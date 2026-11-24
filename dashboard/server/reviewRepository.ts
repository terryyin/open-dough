// One bare Review repository per configured project under this machine's
// dashboard home. It alone creates the repository, names its origin, fetches
// exact published refs into `refs/remotes/origin/*` and records each sync, so
// review readers take its path and never depend on an execution checkout.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublishedSource } from "../src/publishedSource.ts";
import { GitTargetFetches } from "./gitTargetFetch.ts";
import {
  defaultGitOutputLimit as maxBuffer,
  gitProblem,
  runGit,
  runGitUntilClosed,
} from "./gitRunner.ts";
import { machineDashboardPath } from "./machineHome.ts";

type ReviewRepositorySync = {
  readonly lastSyncedAt?: string;
  readonly lastFailure?: { readonly at: string; readonly problem: string };
};

const fetches = new GitTargetFetches();
const fetchEnvironment = { GIT_TERMINAL_PROMPT: "0" };
const credentials = [
  "-c",
  "credential.helper=",
  "-c",
  "credential.helper=!gh auth git-credential",
];

export function reviewRepositoryPath(source: PublishedSource): string {
  return machineDashboardPath(
    "review-repositories",
    `${source.repository}.git`,
  );
}

const syncRecordPath = (repository: string) =>
  path.join(repository, "open-dough-sync.json");

async function lastSync(repository: string): Promise<ReviewRepositorySync> {
  try {
    return JSON.parse(
      await readFile(syncRecordPath(repository), "utf8"),
    ) as ReviewRepositorySync;
  } catch {
    return {};
  }
}

async function created(source: PublishedSource, signal: AbortSignal) {
  const repository = reviewRepositoryPath(source);
  if (existsSync(path.join(repository, "HEAD"))) return repository;
  await mkdir(repository, { recursive: true });
  const call = { cwd: repository, signal, maxBuffer };
  await runGit(["init", "--quiet", "--bare"], call);
  await runGit(
    [
      "config",
      "remote.origin.url",
      `https://github.com/${source.repository}.git`,
    ],
    call,
  );
  return repository;
}

// Each exact published ref lands on its own remote-tracking ref; no
// wildcard, so nothing prunes refs another exact fetch brought in.
const refspec = (ref: string) =>
  `+refs/heads/${ref}:refs/remotes/origin/${ref}`;

// Fetch one exact published ref (the target by default, or a Taken story
// branch), sharing a fetch of the same ref already under way for this Review
// repository, and record its outcome.
export async function syncedReviewRepository(
  source: PublishedSource,
  signal: AbortSignal,
  ref: string = source.ref,
): Promise<string> {
  const repository = reviewRepositoryPath(source);
  await fetches.fetch(repository, "origin", ref, signal, async (fetching) => {
    const previous = await lastSync(repository);
    try {
      await created(source, fetching);
      await runGitUntilClosed(
        [...credentials, "fetch", "--quiet", "origin", refspec(ref)],
        {
          cwd: repository,
          signal: fetching,
          env: fetchEnvironment,
          maxBuffer,
        },
      );
      await record(repository, {
        lastSyncedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (!fetching.aborted)
        await record(repository, {
          ...previous,
          lastFailure: {
            at: new Date().toISOString(),
            problem: gitProblem(error),
          },
        }).catch(() => undefined);
      throw error;
    }
  });
  return repository;
}

// The Review repository holding `revision`, syncing only when it lacks it.
export async function reviewRepositoryHolding(
  source: PublishedSource,
  revision: string,
  signal: AbortSignal,
): Promise<string> {
  const repository = reviewRepositoryPath(source);
  try {
    await runGit(["cat-file", "-e", `${revision}^{commit}`], {
      cwd: repository,
      signal,
      maxBuffer,
    });
    return repository;
  } catch {
    return syncedReviewRepository(source, signal);
  }
}

async function record(repository: string, sync: ReviewRepositorySync) {
  await writeFile(syncRecordPath(repository), JSON.stringify(sync));
}
