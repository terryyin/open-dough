// A published comparison without a retained launch on this Done card.
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import { followUpSessionKey } from "./followUpRequest.ts";
import { useOpenStoryChanges } from "./pageStoryReviewOpening.tsx";
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
  const openStoryChanges = useOpenStoryChanges();
  if (record.story === undefined) return null;
  const story = record.story;
  // Intent opens the story with this session chosen.
  return (
    <ReviewChangesButton
      label="Review session changes"
      onClick={() => {
        openStoryChanges?.({
          project: sourceId,
          identity: story,
          session: followUpSessionKey({ published: record.sessionId }),
        });
      }}
    />
  );
}
