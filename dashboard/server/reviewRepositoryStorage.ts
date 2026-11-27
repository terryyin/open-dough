// One bare Review repository per configured project under this machine's
// dashboard home. It alone creates the repository, names its origin, fetches
// exact published refs into `refs/remotes/origin/*` and records each sync, so
// review readers take its path and never depend on an execution checkout.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { commitIdSchema } from "../src/launchLanding.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { GitTargetFetches } from "./gitTargetFetch.ts";
import {
  defaultGitOutputLimit as maxBuffer,
  fetchGitTransport,
  gitExitedOne,
  gitProblem,
  runGit,
  runGitUntilClosed,
} from "./gitRunner.ts";
import { whileGitProgresses } from "./gitFetchProgress.ts";
import {
  githubGitCredentials,
  githubGitEnvironment,
  githubGitOrigin,
} from "./githubGitTransport.ts";
import { machineDashboardPath } from "./machineHome.ts";

type ReviewRepositorySync = {
  readonly lastSyncedAt?: string;
  readonly lastFailure?: { readonly at: string; readonly problem: string };
};

const fetches = new GitTargetFetches();

export function reviewRepositoryPath(source: PublishedSource): string {
  return machineDashboardPath(
    "review-repositories",
    `${source.repository}.git`,
  );
}

const syncRecordPath = (repository: string) =>
  path.join(repository, "open-dough-sync.json");

export async function lastSync(
  repository: string,
): Promise<ReviewRepositorySync> {
  try {
    return JSON.parse(
      await readFile(syncRecordPath(repository), "utf8"),
    ) as ReviewRepositorySync;
  } catch {
    return {};
  }
}

async function createIfMissing(
  repository: string,
  source: PublishedSource,
  signal: AbortSignal,
) {
  const call = { cwd: repository, signal, maxBuffer };
  if (existsSync(path.join(repository, "HEAD"))) {
    try {
      await runGit(["config", "--local", "--get", "remote.origin.url"], call);
      return;
    } catch (error) {
      if (!gitExitedOne(error)) throw error;
    }
  } else {
    await mkdir(repository, { recursive: true });
    await runGitUntilClosed(["init", "--quiet", "--bare"], call);
  }
  await runGitUntilClosed(
    ["config", "remote.origin.url", githubGitOrigin(source.repository)],
    call,
  );
}

// The verified-trunk check shares this bare repository. Review's tracking
// fetch and sync record stay in `fetchPublishedRef`.
export async function ensureReviewRepository(
  source: PublishedSource,
  signal: AbortSignal,
): Promise<string> {
  const repository = reviewRepositoryPath(source);
  await createIfMissing(repository, source, signal);
  return repository;
}

// Each exact published ref lands on its own remote-tracking ref; no
// wildcard, so nothing prunes refs another exact fetch brought in.
const trackingRef = (ref: string) => `refs/remotes/origin/${ref}`;

async function verifiedRef(
  repository: string,
  ref: string,
  signal: AbortSignal,
) {
  const result = await runGitUntilClosed(
    ["rev-parse", "--verify", `${trackingRef(ref)}^{commit}`],
    { cwd: repository, signal, env: githubGitEnvironment, maxBuffer },
  );
  return commitIdSchema.parse(result.stdout.trim());
}

export async function locallyReadableReviewTarget(
  source: PublishedSource,
  signal: AbortSignal,
) {
  const repository = reviewRepositoryPath(source);
  if (!existsSync(path.join(repository, "HEAD"))) return undefined;
  try {
    return await verifiedRef(repository, source.ref, signal);
  } catch {
    signal.throwIfAborted();
    return undefined;
  }
}

async function fetchPublishedRef(
  repository: string,
  source: PublishedSource,
  ref: string,
  signal: AbortSignal,
  progress?: (chunk: string) => void,
): Promise<string> {
  const previous = await lastSync(repository);
  const call = {
    cwd: repository,
    signal,
    env: githubGitEnvironment,
    maxBuffer,
  };
  try {
    await createIfMissing(repository, source, signal);
    const args = [
      ...githubGitCredentials,
      "fetch",
      progress === undefined ? "--quiet" : "--progress",
      "origin",
      `+refs/heads/${ref}:${trackingRef(ref)}`,
    ];
    if (progress === undefined) await runGitUntilClosed(args, call);
    else await fetchGitTransport(args, call, progress);
    const revision = await verifiedRef(repository, ref, signal);
    await record(repository, { lastSyncedAt: new Date().toISOString() });
    return revision;
  } catch (error) {
    if (!signal.aborted)
      await record(repository, {
        ...previous,
        lastFailure: {
          at: new Date().toISOString(),
          problem: gitProblem(error),
        },
      }).catch(() => undefined);
    throw error;
  }
}

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
    await fetchPublishedRef(repository, source, ref, fetching);
  });
  return repository;
}

// The server's initial sync verifies only the configured published target,
// with the same writer and exact fetch as a bounded review.
export function fetchInitialReviewTarget(
  source: PublishedSource,
  lifetime: AbortSignal,
  inactivityMs: number,
): Promise<string> {
  const repository = reviewRepositoryPath(source);
  return fetches.fetchOwned(
    repository,
    "origin",
    source.ref,
    lifetime,
    (signal) =>
      whileGitProgresses(signal, inactivityMs, (fetchSignal, progress) =>
        fetchPublishedRef(
          repository,
          source,
          source.ref,
          fetchSignal,
          progress,
        ),
      ),
  );
}

async function record(repository: string, sync: ReviewRepositorySync) {
  await writeFile(syncRecordPath(repository), JSON.stringify(sync));
}
