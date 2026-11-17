// The review panel's header title and subtitle for the reviewed-work subject
// the request names: a story's title and identity, or an ad hoc session's
// label and session id.

import { SidePanelTitle } from "./SidePanelTitle.tsx";
import { StoryNotes } from "./StoryNotesControl.tsx";
import {
  isReviewedSessionSubject,
  type ReviewedWorkSubject,
} from "./reviewedWorkSubject.ts";

export function storyReviewPanelLabel(subject: ReviewedWorkSubject): string {
  return isReviewedSessionSubject(subject) ? "Session review" : "Story review";
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
  const code = isReviewedSessionSubject(subject)
    ? subject.session
    : subject.identity;
  return (
    <>
      <div className="side-panel-names">
        <SidePanelTitle title={title} id={headingId} />
        <p className="quiet">
          {kind} <code>{code}</code>
        </p>
      </div>
      {!isReviewedSessionSubject(subject) && (
        <div className="side-panel-actions">
          <StoryNotes
            sourceId={subject.source}
            identity={subject.identity}
            title={title}
          />
        </div>
      )}
    </>
  );
}
