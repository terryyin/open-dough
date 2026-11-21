// The review panel's header title and subtitle for the reviewed-work subject
// the request names: a story's title and identity, or an ad hoc session's
// label and session id, or a published session's UUID.

import { SidePanelTitle } from "./SidePanelTitle.tsx";
import {
  reviewedSessionName,
  reviewedStoryIdentity,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

export function storyReviewPanelLabel(subject: ReviewedWorkSubject): string {
  return reviewedSessionName(subject) === undefined
    ? "Story review"
    : "Session review";
}

export function StoryReviewHeading({
  subject,
  title,
  headingId,
}: {
  readonly subject: ReviewedWorkSubject;
  readonly title: string;
  readonly headingId: string;
}) {
  const kind = storyReviewPanelLabel(subject);
  const code = reviewedSessionName(subject) ?? reviewedStoryIdentity(subject);
  return (
    <div className="side-panel-names">
      <SidePanelTitle title={title} id={headingId} />
      <p className="quiet">
        {kind} <code>{code}</code>
      </p>
    </div>
  );
}
