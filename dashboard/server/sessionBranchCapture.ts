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
import {
  canonicalGitDirectory,
  commonGitDirectory,
  commonGitDirectoryOptions,
} from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import {
  keepBranchResultRefs,
  releaseBranchResultRefs,
} from "./launchRecordPins.ts";
import { resolvedCheckout } from "./sessionCheckout.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { readBranchTrunkRevision } from "./sessionBranchAttribution.ts";
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
  // One rev-parse per read: each Git process is the capture's main cost.
  // Revisions precede --symbolic-full-name, which applies to those after it.
  const lines = async (args: readonly string[]) =>
    (await runGit(args, call)).stdout.trim().split("\n");
  const ref = `refs/heads/${branch}`;
  const [toplevel, common, tip, head] = await lines([
    "rev-parse",
    "--show-toplevel",
    ...commonGitDirectoryOptions,
    "HEAD^{commit}",
    "--symbolic-full-name",
    "HEAD",
  ]);
  if (
    resolvedCheckout(toplevel ?? "") !== checkout ||
    (await canonicalGitDirectory(common ?? "")) !== repository ||
    head !== ref
  )
    throw new Error("The checkout no longer holds the launch's branch.");
  const committedTip = commitIdSchema.parse(tip);
  const [tipAfter, headAfter] = await lines([
    "rev-parse",
    "HEAD",
    "--symbolic-full-name",
    "HEAD",
  ]);
  if (headAfter !== ref || tipAfter !== committedTip)
    throw new Error("The launch's branch changed during capture.");
  return committedTip;
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
  const witnessedTrunk = manualLandingTrunk(record);
  const call = gitCall(repository);
  const [committedTip, targetHead] = await Promise.all([
    readBranchWorkspace({ ...start, repository }),
    record.landing === undefined
      ? readBranchTrunkRevision(witnessedTrunk, call)
      : undefined,
  ]);
  const [, delivery] = await Promise.all([
    runGit(
      ["merge-base", "--is-ancestor", baseTip, committedTip],
      gitCall(start.workspace),
    ),
    record.landing === undefined
      ? manualLandingComparison(
          repository,
          committedTip,
          witnessedTrunk,
          targetHead,
          call,
        )
      : undefined,
  ]);
  const result: SessionBranchResult = {
    repository,
    doneAt,
    committedTip,
    manualDeliveryChecked: true,
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
          "The session identified its branch while Done was in progress. Retry Done to retain its delivery evidence.",
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
