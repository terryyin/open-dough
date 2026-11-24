// One bare Review repository per configured project under this machine's
// dashboard home. It alone creates the repository, names its origin, fetches
// exact published refs into `refs/remotes/origin/*` and records each sync, so
// review readers take its path and never depend on an execution checkout.
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewSyncFailure } from "../src/storyReviewContract.ts";
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

// Why a review is unavailable when its sync failed and nothing synced earlier
// can answer it.
export const failedSyncExplanation = ({ problem }: ReviewSyncFailure) =>
  `The review could not sync from origin, and nothing synced earlier holds this comparison: ${problem}`;

// A sync that failed with no earlier sync to read from.
export class ReviewSyncFailed extends Error {
  constructor(readonly failure: ReviewSyncFailure) {
    super(failedSyncExplanation(failure));
  }
}

// How long one open's syncs may wait for origin together: within the
// response, and longer for a project's first sync of a possibly large trunk.
export type ReviewSyncBounds = {
  readonly syncedMs: number;
  readonly neverSyncedMs: number;
};

export const reviewSyncBounds: ReviewSyncBounds = {
  syncedMs: 30_000,
  neverSyncedMs: 50_000,
};

// A session open keeps its 30-second fetch bound, synced before or not.
export const sessionSyncBounds: ReviewSyncBounds = {
  syncedMs: 30_000,
  neverSyncedMs: 30_000,
};

// One open's deadline, started with the open and shared by every sync it
// makes; its first sync fixes its length by whether the project ever synced.
export class ReviewSyncDeadline {
  private readonly startedAt = Date.now();
  private started?: Promise<{ signal: AbortSignal; seconds: number }>;

  constructor(private readonly bounds: ReviewSyncBounds = reviewSyncBounds) {}

  static forSession() {
    return new ReviewSyncDeadline(sessionSyncBounds);
  }

  of(source: PublishedSource) {
    this.started ??= (async () => {
      const { lastSyncedAt } = await lastSync(reviewRepositoryPath(source));
      const ms =
        lastSyncedAt === undefined
          ? this.bounds.neverSyncedMs
          : this.bounds.syncedMs;
      const left = Math.max(0, ms - (Date.now() - this.startedAt));
      return { signal: AbortSignal.timeout(left), seconds: ms / 1000 };
    })();
    return this.started;
  }
}

// Sync `ref` within the open's deadline; when origin cannot be reached or
// does not answer in time, the failure as a notice beside what the last
// successful sync left. A request abort rethrows.
export async function reviewSyncFailure(
  source: PublishedSource,
  signal: AbortSignal,
  syncDeadline: ReviewSyncDeadline,
  ref: string = source.ref,
): Promise<ReviewSyncFailure | undefined> {
  const deadline = await syncDeadline.of(source);
  try {
    await syncedReviewRepository(
      source,
      AbortSignal.any([signal, deadline.signal]),
      ref,
    );
    return undefined;
  } catch (error) {
    if (signal.aborted) throw error;
    const { lastSyncedAt } = await lastSync(reviewRepositoryPath(source));
    const problem = deadline.signal.aborted
      ? `origin did not answer within ${deadline.seconds} seconds`
      : gitProblem(error);
    return { problem, lastSyncedAt };
  }
}

// A review answer carries a failed sync only when there was one.
export const withSyncFailure = (syncFailure: ReviewSyncFailure | undefined) =>
  syncFailure === undefined ? {} : { syncFailure };

// How a review reader reaches the Review repository it reads.
export type ReviewRepositoryReader = (
  source: PublishedSource,
  signal: AbortSignal,
) => Promise<{ repository: string; syncFailure?: ReviewSyncFailure }>;

// Sync the target within the open's deadline, or read what the last
// successful sync left with the failure as a notice. Throws ReviewSyncFailed
// when the project never synced.
export const reviewRepositoryRead =
  (syncDeadline: ReviewSyncDeadline): ReviewRepositoryReader =>
  async (source, signal) => {
    const syncFailure = await reviewSyncFailure(source, signal, syncDeadline);
    if (syncFailure !== undefined && syncFailure.lastSyncedAt === undefined)
      throw new ReviewSyncFailed(syncFailure);
    return {
      repository: reviewRepositoryPath(source),
      ...withSyncFailure(syncFailure),
    };
  };

// What the last sync left, without a remote request: file reads admit against
// the comparison the open that showed them has already synced.
export const lastSyncedReviewRepository: ReviewRepositoryReader = (source) =>
  Promise.resolve({ repository: reviewRepositoryPath(source) });

async function record(repository: string, sync: ReviewRepositorySync) {
  await writeFile(syncRecordPath(repository), JSON.stringify(sync));
}
