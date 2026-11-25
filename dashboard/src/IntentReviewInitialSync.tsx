import { failedSyncExplanation } from "./storyReviewContract.ts";
import type { ReviewInitialSyncFeedback } from "./useReviewRead.ts";

export function IntentReviewInitialSync({
  sync,
}: {
  readonly sync: ReviewInitialSyncFeedback;
}) {
  return (
    <p className="intent-story-state" role="status">
      {sync.kind === "running" ? (
        "Running initial sync. Review changes will open when the published history is ready."
      ) : (
        <>
          {failedSyncExplanation(sync)}{" "}
          <button type="button" onClick={sync.retry}>
            Retry sync
          </button>
        </>
      )}
    </p>
  );
}
