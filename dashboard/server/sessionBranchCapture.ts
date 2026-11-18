import type { LaunchRecord } from "../src/launchRecord.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import { sessionKey } from "../src/sessionReference.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import type { SessionBranchResult } from "../src/sessionBranchResult.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import {
  keepBranchResultRefs,
  releaseBranchResultRefs,
} from "./launchRecordPins.ts";
import { resolvedCheckout } from "./sessionCommitsCapture.ts";
import { writeWorkingTree } from "./workingTreeSnapshot.ts";

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
    record.branchReviewRepository !== undefined &&
    record.branchResultFailedAt !== doneAt &&
    record.branchResult?.doneAt !== doneAt
  );
}

async function readBranchResult(
  record: LaunchRecord,
  doneAt: string,
): Promise<SessionBranchResult> {
  const start = record.establishedSession;
  const repository = record.branchReviewRepository;
  if (start === undefined || repository === undefined)
    throw new Error("The launch has no recorded branch repository.");
  const base = commitIdSchema.parse(start.startingRevision);
  const checkout = resolvedCheckout(start.workspace);
  const call = gitCall(checkout);
  const git = async (args: readonly string[]) =>
    (await runGit(args, call)).stdout.trim();
  const ref = `refs/heads/${start.branch}`;
  if (
    resolvedCheckout(await git(["rev-parse", "--show-toplevel"])) !==
      checkout ||
    (await commonGitDirectory(call)) !== repository ||
    (await git(["symbolic-ref", "HEAD"])) !== ref
  )
    throw new Error("The checkout no longer holds the launch's branch.");
  const committedTip = commitIdSchema.parse(
    await git(["rev-parse", "--verify", `${ref}^{commit}`]),
  );
  const tree = commitIdSchema.parse(await writeWorkingTree(committedTip, call));
  const committedTree = await git(["rev-parse", `${committedTip}^{tree}`]);
  if (
    (await git(["symbolic-ref", "HEAD"])) !== ref ||
    (await git(["rev-parse", "--verify", "HEAD"])) !== committedTip
  )
    throw new Error("The launch's branch changed during capture.");
  await git(["merge-base", "--is-ancestor", base, committedTip]);
  const revision = tree === committedTree ? committedTip : tree;
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
    return write((marked) => Promise.resolve(marked));

  const read = await readBranchResult(candidate, doneAt).catch(() => undefined);
  let previous: SessionBranchResult | undefined;
  let pinned: SessionBranchResult | undefined;
  try {
    const saved = await write(async (marked) => {
      if (
        marked.doneAt !== doneAt ||
        !branchCapturePending(marked, doneAt) ||
        sessionKey(marked.session) !== sessionKey(candidate.session) ||
        marked.branchReviewRepository !== candidate.branchReviewRepository
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
