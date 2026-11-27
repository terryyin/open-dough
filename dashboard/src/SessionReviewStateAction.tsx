// One reviewable session's review state on its Recently done entry, retained
// (`./RecentlyDoneEntry.tsx`) or published-only (`./PublishedSessionEntry.tsx`):
// Mark as reviewed, or Reviewed asking "Unreview this session?". Its explicit
// mark, saved under the session's one identity (`./recentlyDoneListing.ts`),
// wins over the story's `reviewedAt` (`./storyReviewStates.ts`), so a retained
// session and its published record share it. The control itself is
// `./ReviewStateControl.tsx`.
import { ReviewStateControl } from "./ReviewStateControl.tsx";
import {
  sessionReviewed,
  type ReviewableSession,
  type StoryReviewStates,
} from "./storyReviewStates.ts";

export function SessionReviewStateAction({
  story,
  session,
  states,
}: {
  readonly story: string;
  readonly session: ReviewableSession;
  readonly states: StoryReviewStates;
}) {
  return (
    <ReviewStateControl
      reviewed={
        states.reviewed === undefined
          ? undefined
          : sessionReviewed(states.reviewed.get(story), session)
      }
      question="Unreview this session?"
      change={(reviewed) =>
        states.change({ identity: story, session: session.identity, reviewed })
      }
    />
  );
}
