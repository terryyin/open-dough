// Session commits context names the kept pair and where its commits were made.
import type { StoryReview } from "./storyReviewContract.ts";

export type SessionCommitsReview = Extract<
  StoryReview,
  { kind: "session-commits" }
>;

export const sessionCommitsDescription =
  "Read-only: this session's fixed commits made in the Default main checkout while the session was open, from the revision before them to their last commit.";

export function SessionCommitsContext({
  review: { session, baseline, tree },
}: {
  readonly review: SessionCommitsReview;
}) {
  return (
    <div>
      <h3>Session commits</h3>
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
        {session.shared === true &&
          " Another session was open in the same checkout during that time, so the comparison may include that session's work."}
      </p>
    </div>
  );
}
