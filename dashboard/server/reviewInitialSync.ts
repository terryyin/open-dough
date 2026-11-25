// The Dashboard owns one initial sync for each configured published target.
// A request begins or reads an attempt, then leaves without owning its Git.
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ReviewInitialSyncStatus } from "../src/reviewInitialSync.ts";
import { gitProblem } from "./gitRunner.ts";
import {
  fetchInitialReviewTarget,
  locallyReadableReviewTarget,
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

  // Only an observation for this exact configured source can be reused.
  async forReview(
    source: PublishedSource,
    request: AbortSignal,
    resume: true | string,
  ) {
    const read = { source, operation: "status" } as const;
    const before = this.answer(read, request);
    if (before.kind === "running" || before.kind === "failed") return "pending";
    const current = await locallyReadableReviewTarget(source, request);
    const status = this.answer(read, request);
    if (status.kind === "running" || status.kind === "failed") return "pending";
    if (current === undefined) {
      if (status.kind === "ready" && status === before)
        this.statuses.delete(keyOf(source));
      return "pending";
    }
    return status.kind === "ready" &&
      current === status.revision &&
      current === resume
      ? "verified"
      : "warm";
  }

  answer(
    { source, operation }: ReviewInitialSyncRequest,
    request: AbortSignal,
  ): ReviewInitialSyncStatus {
    request.throwIfAborted();
    this.shutdown.signal.throwIfAborted();
    const key = keyOf(source);
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

const keyOf = (source: PublishedSource) =>
  JSON.stringify([source.id, reviewRepositoryPath(source), source.ref]);
