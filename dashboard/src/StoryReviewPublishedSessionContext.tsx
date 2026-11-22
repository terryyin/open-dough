// Published-session context names the recorded pair and when the session
// closed. Kept-session launch/done wording stays on session-commits only.
import { sharedCheckoutWarning } from "./StoryReviewSessionCommitsContext.tsx";
import type { StoryReview } from "./storyReviewContract.ts";

export type PublishedSessionReview = Extract<
  StoryReview,
  { kind: "published-session" }
>;

export const publishedSessionDescription =
  "Read-only: this session's published changes from its close record, from the recorded baseline to its published tree.";

export const publishedSessionName = "Published changes";

export function PublishedSessionContext({
  review: { session, baseline, tree },
}: {
  readonly review: PublishedSessionReview;
}) {
  return (
    <div>
      <h3>{publishedSessionName}</h3>
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
