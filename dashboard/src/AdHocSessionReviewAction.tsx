// Review changes on a standalone ad hoc Done entry in Recently done: opens
// the session's retained landing in the page's one review panel
// (`./StoryReview.tsx`), named by the session's label. Drawn as on a done
// story's card (`./StoryReviewAction.tsx`). Every such entry offers it, so an
// absent comparison is explained where the developer looks.

import type { LaunchRecord } from "./launchRecord.ts";
import { launchSubject } from "./launchWorkflow.ts";
import { useOpenStoryReview } from "./pageStoryReviews.ts";
import { ReviewChangesButton } from "./ReviewChangesButton.tsx";
import "./story-review.css";

export function AdHocSessionReviewAction({
  record,
  sourceId,
}: {
  readonly record: LaunchRecord;
  readonly sourceId: string;
}) {
  const openStoryReview = useOpenStoryReview();
  if (record.request.workflow !== "ad-hoc" || record.doneAt === undefined)
    return null;
  const { title } = launchSubject(record.request);
  return (
    <ReviewChangesButton
      onClick={(event) => {
        openStoryReview({
          subject: {
            source: sourceId,
            host: record.session.host,
            session: record.session.sessionId,
          },
          title,
          control: event.currentTarget,
        });
      }}
    />
  );
}
