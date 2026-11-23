// The Side panel’s review identifies the kept session or published close record.
import { SidePanelTitle } from "./SidePanelTitle.tsx";
import type { SessionReviewSubject } from "./pageSessionReviews.ts";

export function StoryReviewHeading({
  subject,
  title,
  headingId,
}: {
  readonly subject: SessionReviewSubject;
  readonly title: string;
  readonly headingId: string;
}) {
  return (
    <div className="side-panel-names">
      <SidePanelTitle title={title} id={headingId} />
      <p className="quiet">
        Session review{" "}
        <code>
          {"session" in subject ? subject.session : subject.published}
        </code>
      </p>
    </div>
  );
}
