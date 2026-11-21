// Reads of a named target can arrive together from Review and CI comparison,
// including through sibling worktrees. Share an outstanding fetch, and keep
// each repository's next mutation behind the actual previous Git exit.
import { OutstandingReads } from "../../Distribution/src/skills/dough-execute-plan/scripts/github-request-outstanding.mjs";
import { storyReviewWaitMs } from "../src/storyReviewContract.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { commitIdSchema } from "../src/launchLanding.ts";
import {
  GitFailure,
  runGit,
  runGitUntilClosed,
  type GitCall,
} from "./gitRunner.ts";

// Read the exact named remote branch directly from its remote.
export async function remoteBranchHead(
  remote: string,
  ref: string,
  call: GitCall,
): Promise<string | undefined> {
  try {
    const { stdout } = await runGit(
      ["ls-remote", "--exit-code", "--refs", "--", remote, ref],
      call,
    );
    const [sha, named] = stdout.trimEnd().split("\t");
    if (named !== ref)
      throw new Error("The remote returned an invalid branch head.");
    return commitIdSchema.parse(sha);
  } catch (error) {
    if (
      error instanceof GitFailure &&
      error.cause instanceof Error &&
      "code" in error.cause &&
      error.cause.code === 2
    )
      return undefined;
    throw error;
  }
}

export class GitTargetFetches {
  private readonly outstanding = new OutstandingReads<void>(storyReviewWaitMs);
  private readonly settling = new Map<string, Promise<void>>();

  fetch(
    repository: string,
    remote: string,
    target: string,
    waiter: AbortSignal,
    start: (signal: AbortSignal) => Promise<void>,
  ): Promise<void> {
    return this.outstanding.waitFor(
      JSON.stringify([repository, remote, target]),
      waiter,
      (signal) => {
        const previous = this.settling.get(repository);
        const read = (async () => {
          if (previous !== undefined) await previous.catch(() => undefined);
          signal.throwIfAborted();
          await start(signal);
        })();
        this.settling.set(repository, read);
        void read
          .finally(() => {
            if (this.settling.get(repository) === read)
              this.settling.delete(repository);
          })
          .catch(() => undefined);
        return read;
      },
    );
  }
}

const fetches = new GitTargetFetches();

export async function fetchGitTarget(
  remote: string,
  target: string,
  call: GitCall & { readonly signal: AbortSignal },
): Promise<void> {
  const repository = await commonGitDirectory(call);
  await fetches.fetch(
    repository,
    remote,
    target,
    call.signal,
    async (signal) => {
      await runGitUntilClosed(["fetch", "--quiet", remote, target], {
        ...call,
        signal,
        env: { ...call.env, GIT_TERMINAL_PROMPT: "0" },
      });
    },
  );
}

// Ensures the repository holds `revision`, first fetching the trunk `target`
// from `remote` when it lacks the commit, as a machine that has not fetched
// since another one published would. Rejects while the commit stays missing.
export async function fetchUnlessCommitPresent(
  revision: string,
  { remote, target }: { readonly remote: string; readonly target: string },
  call: GitCall & { readonly signal: AbortSignal },
): Promise<void> {
  const commit = ["cat-file", "-e", `${revision}^{commit}`];
  try {
    await runGit(commit, call);
  } catch {
    await fetchGitTarget(remote, target, call);
    await runGit(commit, call);
  }
}
