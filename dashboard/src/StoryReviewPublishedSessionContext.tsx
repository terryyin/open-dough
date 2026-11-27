// Published-session context names the recorded pair and when the session
// closed.
import type { StoryReview } from "./storyReviewContract.ts";

const sharedCheckoutWarning =
  "Another session was open in the same checkout during that time, so the comparison may include that session's work.";

export type PublishedSessionReview = Extract<
  StoryReview,
  { kind: "published-session" }
>;

export function PublishedSessionContext({
  review: { session, baseline, tree },
}: {
  readonly review: PublishedSessionReview;
}) {
  return (
    <div>
      <h3>Published changes</h3>
      <p>
        Published changes of this session, closed{" "}
        <time dateTime={session.closedAt}>
          {new Date(session.closedAt).toLocaleString()}
        </time>
        .
      </p>
      <p>
        From <code>{baseline}</code> to <code>{tree}</code>.
        {session.shared === true && ` ${sharedCheckoutWarning}`}
      </p>
    </div>
  );
}
