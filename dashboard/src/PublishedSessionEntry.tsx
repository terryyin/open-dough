// A published comparison without a retained launch on this Done card.
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
  const { sessionId, closedAt } = record;
  const name = `${publishedSessionTitle} ${sessionId}`;
  return (
    <article className="session-entry" aria-label={name} tabIndex={-1}>
      <h3>{publishedSessionTitle}</h3>
      <p className="record-identity">{sessionId}</p>
      <p className="quiet">
        Closed <time dateTime={closedAt}>{closedAt}</time>
      </p>
      <PublishedSessionReviewAction record={record} sourceId={sourceId} />
    </article>
  );
}

export function PublishedSessionReviewAction({
  record,
  sourceId,
}: {
  readonly record: PublishedSessionRecord;
  readonly sourceId: string;
}) {
  const openSessionReview = useOpenSessionReview();
  if (record.story === undefined) return null;
  const story = { project: sourceId, identity: record.story };
  return (
    <ReviewChangesButton
      label="Review session changes"
      onClick={(event) => {
        openSessionReview({
          subject: {
            source: sourceId,
            identity: story.identity,
            published: record.sessionId,
          },
          story,
          title: `${publishedSessionTitle} ${record.sessionId}`,
          control: event.currentTarget,
        });
      }}
    />
  );
}
