// A standalone Recently done entry for a session the project published a
// close record for (`./publishedSessionRecord.ts`) and this machine never
// launched: named by its UUID, closed when the record says, and offering
// Review changes on the record's published comparison in the page's one
// review panel (`./StoryReview.tsx`), as a kept ad hoc entry does
// (`./AdHocSessionReviewAction.tsx`). It has no native controls.

import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import { useOpenSessionReview } from "./pageSessionReviews.ts";
import { ReviewChangesButton } from "./ReviewChangesButton.tsx";
import "./agent-launch.css";
import "./story-review.css";

const publishedSessionTitle = "Published session";

export function PublishedSessionEntry({
  record,
  sourceId,
}: {
  readonly record: PublishedSessionRecord;
  readonly sourceId: string;
}) {
  const openSessionReview = useOpenSessionReview();
  const { sessionId, closedAt } = record;
  const name = `${publishedSessionTitle} ${sessionId}`;
  return (
    <article className="session-entry" aria-label={name} tabIndex={-1}>
      <h3>{publishedSessionTitle}</h3>
      <p className="record-identity">{sessionId}</p>
      <p className="quiet">
        Closed <time dateTime={closedAt}>{closedAt}</time>
      </p>
      <ReviewChangesButton
        onClick={(event) => {
          openSessionReview({
            subject: { source: sourceId, published: sessionId },
            title: name,
            control: event.currentTarget,
          });
        }}
      />
    </article>
  );
}
