import type { LaunchRecord } from "../src/launchRecord.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import { sessionKey } from "../src/sessionReference.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import type {
  SessionBranchEntry,
  SessionBranchResult,
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

export function hasBranchReview(record: LaunchRecord): boolean {
  return (
    record.branchEntry !== undefined ||
    record.branchReviewRepository !== undefined
  );
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

async function readBranchResult(
  record: LaunchRecord,
  doneAt: string,
): Promise<SessionBranchResult> {
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
  return { repository, doneAt, base, revision, committedTip };
}

// Read before publishing the mark, then admit and pin the result within the
// same record write as Done. The write's own ordering guards decide whether
// the prepared result may be applied. Receipt retry never reads the checkout.
export async function withBranchResultAtDone<T>(
  candidate: LaunchRecord | undefined,
  doneAt: string | undefined,
  write: (
    settle: (marked: LaunchRecord) => Promise<LaunchRecord>,
  ) => Promise<T>,
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

  const read = await readBranchResult(candidate, doneAt).catch(() => undefined);
  let previous: SessionBranchResult | undefined;
  let pinned: SessionBranchResult | undefined;
  try {
    const saved = await write(async (marked) => {
      if (
        marked.doneAt !== doneAt ||
        !branchCapturePending(marked, doneAt) ||
        sessionKey(marked.session) !== sessionKey(candidate.session) ||
        marked.branchReviewRepository !== candidate.branchReviewRepository ||
        marked.branchEntry?.committedTip !== candidate.branchEntry?.committedTip
      )
        return marked;
      if (read === undefined)
        return { ...marked, branchResultFailedAt: doneAt };
      try {
        await keepBranchResultRefs(marked.session, read);
      } catch {
        await releaseBranchResultRefs(marked.session, read);
        return { ...marked, branchResultFailedAt: doneAt };
      }
      previous = marked.branchResult;
      pinned = read;
      const next = { ...marked, branchResult: read };
      delete next.branchResultFailedAt;
      return next;
    });
    if (pinned !== undefined)
      await releaseBranchResultRefs(candidate.session, previous);
    return saved;
  } catch (error) {
    await releaseBranchResultRefs(candidate.session, pinned);
    throw error;
  }
}
