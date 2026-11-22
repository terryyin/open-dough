import type { LaunchRecord } from "../src/launchRecord.ts";
import { commitIdSchema, type LaunchLanding } from "../src/launchLanding.ts";
import { sessionKey } from "../src/sessionReference.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import {
  branchPinOwner,
  hasBranchReview,
  type SessionBranchEntry,
  type SessionBranchResult,
} from "../src/sessionBranchResult.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import {
  keepBranchResultRefs,
  releaseBranchResultRefs,
} from "./launchRecordPins.ts";
import { resolvedCheckout } from "./sessionCommitsCapture.ts";
import { writeWorkingTree } from "./workingTreeSnapshot.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { configuredProject } from "./projectConfiguration.ts";
import {
  attributeBranchResult,
  branchTrunk,
  readBranchTrunkRevision,
} from "./sessionBranchAttribution.ts";
import {
  keepManualLanding,
  type ManualLanding,
  manualLandingComparison,
  manualLandingTrunk,
  releaseManualLanding,
} from "./manualSessionLanding.ts";

const gitCall = (cwd: string) => ({
  cwd,
  maxBuffer: defaultGitOutputLimit,
  signal: AbortSignal.timeout(30_000),
});

export async function isolatedBranchReviewRepository(
  session: EstablishedSession,
): Promise<string | undefined> {
  if (session.role !== "isolated" || session.landing !== "review")
    return undefined;
  return commonGitDirectory(gitCall(session.workspace)).catch(() => undefined);
}

function branchCapturePending(record: LaunchRecord, doneAt: string): boolean {
  return (
    record.request.workflow === "ad-hoc" &&
    hasBranchReview(record) &&
    record.branchResultFailedAt !== doneAt &&
    record.branchResult?.doneAt !== doneAt
  );
}

export async function readBranchWorkspace({
  workspace,
  repository,
  branch,
}: Pick<SessionBranchEntry, "workspace" | "repository" | "branch">) {
  const checkout = resolvedCheckout(workspace);
  const call = gitCall(checkout);
  const git = async (args: readonly string[]) =>
    (await runGit(args, call)).stdout.trim();
  const ref = `refs/heads/${branch}`;
  if (
    resolvedCheckout(await git(["rev-parse", "--show-toplevel"])) !==
      checkout ||
    (await commonGitDirectory(call)) !== repository ||
    (await git(["symbolic-ref", "HEAD"])) !== ref
  )
    throw new Error("The checkout no longer holds the launch's branch.");
  const committedTip = commitIdSchema.parse(
    await git(["rev-parse", "--verify", "HEAD^{commit}"]),
  );
  const tree = commitIdSchema.parse(await writeWorkingTree(committedTip, call));
  const committedTree = await git(["rev-parse", `${committedTip}^{tree}`]);
  if (
    (await git(["symbolic-ref", "HEAD"])) !== ref ||
    (await git(["rev-parse", "--verify", "HEAD"])) !== committedTip
  )
    throw new Error("The launch's branch changed during capture.");
  return {
    committedTip,
    tree,
    revision: tree === committedTree ? committedTip : tree,
  };
}

// Answers a candidate record's branch result at its Done time, with the
// manual delivery it proves; production's capture reads Git only.
export type BranchCapture = (
  record: LaunchRecord,
  doneAt: string,
) => Promise<{
  readonly result: SessionBranchResult;
  readonly delivery: ManualLanding | undefined;
}>;

export const captureBranchResult: BranchCapture = async (record, doneAt) => {
  const entry = record.branchEntry;
  const start = entry ?? record.establishedSession;
  const repository = entry?.repository ?? record.branchReviewRepository;
  if (start === undefined || repository === undefined)
    throw new Error("The launch has no recorded branch repository.");
  const baseTip = commitIdSchema.parse(
    entry?.committedTip ?? record.establishedSession?.startingRevision,
  );
  const base = entry?.tree ?? baseTip;
  const { committedTip, revision } = await readBranchWorkspace({
    ...start,
    repository,
  });
  await runGit(
    ["merge-base", "--is-ancestor", baseTip, committedTip],
    gitCall(start.workspace),
  );
  const source = configuredProject(record.request.source);
  const witnessedTrunk = manualLandingTrunk(record);
  const trunk =
    witnessedTrunk ??
    (source === undefined ? undefined : branchTrunk("origin", source.ref));
  const call = gitCall(repository);
  const targetHead = await readBranchTrunkRevision(trunk, call);
  const delivery =
    record.landing === undefined
      ? await manualLandingComparison(
          repository,
          committedTip,
          witnessedTrunk,
          targetHead,
          call,
        )
      : undefined;
  // A proved direct delivery establishes that this exact tip is session work.
  // Its prior target is the trunk history imported by the branch.
  const attributionTarget =
    delivery?.revision === committedTip ? delivery.base : targetHead;
  const attribution = await attributeBranchResult(
    base,
    baseTip,
    committedTip,
    trunk?.revision ?? (entry === undefined ? baseTip : undefined),
    attributionTarget,
    call,
  );
  const result: SessionBranchResult = {
    repository,
    doneAt,
    revision,
    committedTip,
    manualDeliveryChecked: true,
    ...attribution,
  };
  return { result, delivery };
};

// Read before publishing the mark, then admit and pin the result within the
// same record write as Done. The write's own ordering guards decide whether
// the prepared result may be applied. Receipt retry never reads the checkout.
export async function withBranchResultAtDone<T>(
  candidate: LaunchRecord | undefined,
  doneAt: string | undefined,
  write: (
    settle: (marked: LaunchRecord) => Promise<LaunchRecord>,
  ) => Promise<T>,
  capture: BranchCapture = captureBranchResult,
): Promise<T> {
  if (
    candidate === undefined ||
    doneAt === undefined ||
    !branchCapturePending(candidate, doneAt)
  )
    return write((marked) => {
      if (
        doneAt !== undefined &&
        marked.branchEntry !== undefined &&
        candidate?.branchEntry === undefined
      )
        throw new RefusedRequest(
          409,
          "The session identified its branch while Done was in progress. Retry Done to capture it.",
        );
      return Promise.resolve(marked);
    });

  const owner = branchPinOwner(candidate);
  const read = await capture(candidate, doneAt).catch(() => undefined);
  let previous: SessionBranchResult | undefined;
  let pinned: SessionBranchResult | undefined;
  let landing: LaunchLanding | undefined;
  try {
    const saved = await write(async (marked) => {
      if (
        marked.doneAt !== doneAt ||
        !branchCapturePending(marked, doneAt) ||
        marked.launchedAt !== candidate.launchedAt ||
        sessionKey(marked.session) !== sessionKey(candidate.session) ||
        marked.branchReviewRepository !== candidate.branchReviewRepository ||
        marked.branchEntry?.committedTip !== candidate.branchEntry?.committedTip
      )
        return marked;
      if (read === undefined)
        return { ...marked, branchResultFailedAt: doneAt };
      const { result, delivery } = read;
      try {
        await keepBranchResultRefs(owner, result);
      } catch {
        await releaseBranchResultRefs(owner, result);
        return { ...marked, branchResultFailedAt: doneAt };
      }
      previous = marked.branchResult;
      pinned = result;
      landing = await keepManualLanding(marked, delivery);
      const next = { ...marked, branchResult: result };
      delete next.branchResultFailedAt;
      return landing === undefined ? next : { ...next, landing };
    });
    if (pinned !== undefined) await releaseBranchResultRefs(owner, previous);
    return saved;
  } catch (error) {
    await releaseBranchResultRefs(owner, pinned);
    await releaseManualLanding(landing);
    throw error;
  }
}
