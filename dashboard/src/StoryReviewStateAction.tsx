// A done story card's review state among its Story actions
// (`./DoneStoryCard.tsx`), from the project's shared states
// (`./storyReviewStates.ts`) and its reviewable sessions: a story none of
// whose sessions are reviewed offers Mark as reviewed; one with some reviewed
// shows a Partially reviewed badge beside that same action; and one with all
// reviewed offers Reviewed, asking "Unreview this story?". Marking the story
// marks every current session; unreviewing it unmarks them all. The control
// itself is `./ReviewStateControl.tsx`.
import { ReviewStateControl } from "./ReviewStateControl.tsx";
import {
  storyReviewStatus,
  type ReviewableSession,
  type StoryReviewStates,
} from "./storyReviewStates.ts";

export function StoryReviewStateAction({
  identity,
  sessions,
  states,
}: {
  readonly identity: string;
  // The story's current reviewable sessions.
  readonly sessions: readonly ReviewableSession[];
  readonly states: StoryReviewStates;
}) {
  const status =
    states.reviewed === undefined
      ? undefined
      : storyReviewStatus(states.reviewed.get(identity), sessions);
  return (
    <ReviewStateControl
      reviewed={status === undefined ? undefined : status === "reviewed"}
      question="Unreview this story?"
      change={(reviewed) => states.change({ identity, reviewed })}
      badge={
        status === "partial" && (
          <span className="story-review-state-partial">Partially reviewed</span>
        )
      }
    />
  );
}
