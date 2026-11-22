// Session commits context names the kept pair and where its commits were made.
import type { StoryReview } from "./storyReviewContract.ts";

export type SessionCommitsReview = Extract<
  StoryReview,
  { kind: "session-commits" }
>;

export const sessionCommitsDescription =
  "Read-only: this session's kept commits made in the Default main checkout while the session was open, from the revision before them to their last commit.";

export const sessionCommitsName = "Session commits";

// The warning a comparison carries when another session was open in the same
// checkout meanwhile, here and in a published session's review.
export const sharedCheckoutWarning =
  "Another session was open in the same checkout during that time, so the comparison may include that session's work.";

export function SessionCommitsContext({
  review: { session, baseline, tree },
}: {
  readonly review: SessionCommitsReview;
}) {
  return (
    <div>
      <h3>{sessionCommitsName}</h3>
      <p>
        Commits made in the Default main checkout while the session was open,
        launched{" "}
        <time dateTime={session.launchedAt}>
          {new Date(session.launchedAt).toLocaleString()}
        </time>{" "}
        and done{" "}
        <time dateTime={session.doneAt}>
          {new Date(session.doneAt).toLocaleString()}
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
