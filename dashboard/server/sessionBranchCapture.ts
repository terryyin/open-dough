import type { LaunchRecord } from "../src/launchRecord.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import {
  branchResultAtDone,
  type SessionBranchResult,
} from "../src/sessionBranchResult.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { resolvedCheckout } from "./sessionCommitsCapture.ts";

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

export function branchCapturePending(record: LaunchRecord): boolean {
  return (
    record.request.workflow === "ad-hoc" &&
    record.branchReviewRepository !== undefined &&
    record.doneAt !== undefined &&
    record.branchResultFailedAt !== record.doneAt &&
    branchResultAtDone(record) === undefined
  );
}

export async function readBranchResult(
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
  await git(["merge-base", "--is-ancestor", base, committedTip]);
  return { repository, doneAt, base, revision: committedTip, committedTip };
}
