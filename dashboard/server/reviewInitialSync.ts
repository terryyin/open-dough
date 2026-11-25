// The Dashboard owns one initial sync for each configured published target.
// A request begins or reads an attempt, then leaves without owning its Git.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewInitialSyncStatus } from "../src/reviewInitialSync.ts";
import { gitProblem } from "./gitRunner.ts";
import {
  fetchInitialReviewTarget,
  reviewRepositoryPath,
} from "./reviewRepositoryStorage.ts";

export type ReviewInitialSyncRequest = {
  readonly source: PublishedSource;
  readonly operation: "status" | "start" | "retry";
};

export class ReviewInitialSync {
  private readonly shutdown = new AbortController();
  private readonly attempts = new Set<Promise<void>>();
  private readonly statuses = new Map<string, ReviewInitialSyncStatus>();

  constructor(private readonly inactivityMs = 50_000) {}

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
    if (operation === "status") return status ?? { kind: "idle" };
    if (
      status !== undefined &&
      !(operation === "retry" && status.kind === "failed")
    )
      return status;

    const running = { kind: "running" } as const;
    this.statuses.set(key, running);
    const attempt = fetchInitialReviewTarget(
      source,
      this.shutdown.signal,
      this.inactivityMs,
    ).then(
      (revision) => {
        this.statuses.set(key, { kind: "ready", revision });
      },
      (error: unknown) => {
        this.statuses.set(key, { kind: "failed", problem: gitProblem(error) });
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
