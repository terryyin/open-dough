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
// `config` is leading Git configuration for that one probe (`-c` …).
export async function remoteBranchHead(
  remote: string,
  ref: string,
  call: GitCall,
  config: readonly string[] = [],
): Promise<string | undefined> {
  try {
    const { stdout } = await runGit(
      [...config, "ls-remote", "--exit-code", "--refs", "--", remote, ref],
      call,
    );
    const exact = stdout
      .split("\n")
      .map((line) => line.split("\t"))
      .find(([, name]) => name === ref);
    return exact === undefined ? undefined : commitIdSchema.parse(exact[0]);
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
  private readonly owned = new Map<string, Promise<unknown>>();
  private readonly settling = new Map<string, Promise<unknown>>();

  fetch(
    repository: string,
    remote: string,
    target: string,
    waiter: AbortSignal,
    start: (signal: AbortSignal) => Promise<void>,
  ): Promise<void> {
    const key = JSON.stringify([repository, remote, target]);
    return this.outstanding.waitFor(key, waiter, async (signal) => {
      const owned = this.owned.get(key);
      if (owned !== undefined) await owned;
      else await this.serialize(repository, signal, start);
    });
  }

  // The operation's owner supplies its lifetime. Ordinary request waiters
  // can join an owned fetch, while their departure leaves it running.
  fetchOwned<T>(
    repository: string,
    remote: string,
    target: string,
    lifetime: AbortSignal,
    start: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const key = JSON.stringify([repository, remote, target]);
    const fetch = this.serialize(repository, lifetime, start);
    this.owned.set(key, fetch);
    return fetch.finally(() => {
      if (this.owned.get(key) === fetch) this.owned.delete(key);
    });
  }

  private serialize<T>(
    repository: string,
    signal: AbortSignal,
    start: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const previous = this.settling.get(repository);
    const fetch = (async () => {
      if (previous !== undefined) await previous.catch(() => undefined);
      signal.throwIfAborted();
      return start(signal);
    })();
    this.settling.set(repository, fetch);
    return fetch.finally(() => {
      if (this.settling.get(repository) === fetch)
        this.settling.delete(repository);
    });
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
// since another one published would.
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
