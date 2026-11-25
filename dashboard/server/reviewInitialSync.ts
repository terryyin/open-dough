// The Dashboard owns one initial sync for each configured published target.
// A request begins or reads an attempt, then leaves without owning its Git.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewInitialSyncStatus } from "../src/reviewInitialSync.ts";
import { gitProblem } from "./gitRunner.ts";
import { reviewSyncBounds } from "./reviewRepository.ts";
import {
  fetchInitialReviewTarget,
  reviewRepositoryPath,
} from "./reviewRepositoryStorage.ts";

export type ReviewInitialSyncRequest = {
  readonly source: PublishedSource;
  readonly operation: "status" | "start";
};

export class ReviewInitialSync {
  private readonly shutdown = new AbortController();
  private readonly attempts = new Set<Promise<void>>();
  private readonly statuses = new Map<string, ReviewInitialSyncStatus>();

  answer(
    { source, operation }: ReviewInitialSyncRequest,
    request: AbortSignal,
  ): ReviewInitialSyncStatus {
    request.throwIfAborted();
    this.shutdown.signal.throwIfAborted();
    const key = JSON.stringify([
      source.id,
      reviewRepositoryPath(source),
      source.ref,
    ]);
    const status = this.statuses.get(key);
    if (status !== undefined) return status;
    if (operation === "status") return { kind: "idle" };

    const running = { kind: "running" } as const;
    this.statuses.set(key, running);
    const deadline = AbortSignal.timeout(reviewSyncBounds.neverSyncedMs);
    const lifetime = AbortSignal.any([deadline, this.shutdown.signal]);
    const attempt = fetchInitialReviewTarget(source, lifetime).then(
      (revision) => {
        this.statuses.set(key, { kind: "ready", revision });
      },
      (error: unknown) => {
        const problem = deadline.aborted
          ? `origin did not answer within ${reviewSyncBounds.neverSyncedMs / 1000} seconds`
          : gitProblem(error);
        this.statuses.set(key, { kind: "failed", problem });
      },
    );
    this.attempts.add(attempt);
    void attempt.finally(() => this.attempts.delete(attempt));
    return running;
  }

  async close(): Promise<void> {
    this.shutdown.abort();
    await Promise.all(this.attempts);
    this.statuses.clear();
  }
}
