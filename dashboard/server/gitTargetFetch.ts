// Reads of a named target can arrive together from Review and CI comparison,
// including through sibling worktrees. Share an outstanding fetch, and keep
// each repository's next mutation behind the actual previous Git exit.
import { OutstandingReads } from "../../src/skills/dough-execute-plan/scripts/github-request-outstanding.mjs";
import { storyReviewWaitMs } from "../src/storyReviewContract.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { runGitUntilClosed, type GitCall } from "./gitRunner.ts";

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
