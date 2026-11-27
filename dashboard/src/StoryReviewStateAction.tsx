// A done story card's review state among its Story actions
// (`./DoneStoryCard.tsx`), from the project's shared states
// (`./storyReviewStates.ts`) and its reviewable sessions' completions: a story
// none of whose sessions are reviewed offers a red Mark as reviewed; one with
// some reviewed shows a Partially reviewed badge beside that same action; and
// one with all reviewed offers a quieter Reviewed button that asks before
// undoing the review. An unreviewed story shows no badge.
// Nothing shows until the project's states are first read. Using either
// action keeps the keyboard on the card, on the action that then shows (when
// Recently done has meanwhile kept the keyboard on the card itself, it moves
// on to that action), and says once what changed. A change that could not be
// saved leaves the card showing the state last saved, with the keyboard on the
// action still shown, and says so until the action is used again and saved.
// It never selects the story or opens the Side panel.
import { useRef, useState } from "react";
import { InPlaceQuestion, useAskInPlace } from "./AskInPlace.tsx";
import {
  storyReviewStatus,
  type StoryReviewStates,
} from "./storyReviewStates.ts";
import { reviewStateNotSaved } from "./storyReviewStatesReadSource.ts";
import "./story-review-state.css";

export function StoryReviewStateAction({
  identity,
  completions,
  states,
}: {
  readonly identity: string;
  // When each of the story's current reviewable sessions completed.
  readonly completions: readonly string[];
  readonly states: StoryReviewStates;
}) {
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  const status =
    states.reviewed === undefined
      ? undefined
      : storyReviewStatus(states.reviewed.get(identity), completions);
  const reviewed = status === undefined ? undefined : status === "reviewed";
  const asking = useAskInPlace(
    reviewed ? "Unreview this story?" : undefined,
    async (pressed) => {
      if (reviewed === undefined || busy) return "withdrawn";
      setBusy(true);
      try {
        await states.change({ identity, reviewed: !reviewed });
        setFailed(false);
        setSaid(reviewed ? "Marked as not reviewed." : "Marked as reviewed.");
      } catch {
        setFailed(true);
      } finally {
        setBusy(false);
      }
      // Return focus after saving unless the developer moved to another
      // card or part of the page while the save was pending.
      const focused = document.activeElement;
      const card = holder.current?.closest("article");
      if (focused !== document.body && !card?.contains(focused))
        return "withdrawn";
      if (reviewed) return "returned";
      pressed.focus();
      return "withdrawn";
    },
  );
  if (reviewed === undefined) return null;
  return (
    <div ref={holder} className="story-review-state">
      {status === "partial" && (
        <span className="story-review-state-partial">Partially reviewed</span>
      )}
      {asking.shown ? (
        <InPlaceQuestion asking={asking} confirm="Unreview" keep="Cancel" />
      ) : (
        <button
          ref={asking.control}
          type="button"
          className={`start-launch-button ${reviewed ? "story-review-state-reviewed" : "story-review-state-needed"}`}
          aria-disabled={busy}
          onClick={(event) => {
            if (!busy) asking.press(event.currentTarget);
          }}
        >
          {reviewed ? "Reviewed" : "Mark as reviewed"}
        </button>
      )}
      {/* The status stays rendered while silent, so assistive technology
          speaks the change of its text; silent, it takes no room. What it
          says of a change made is spoken, not shown; that the change could
          not be saved is shown too. */}
      <p
        role="status"
        className={
          failed
            ? "story-review-state-said story-review-state-failed"
            : "story-review-state-said"
        }
      >
        {failed ? (
          reviewStateNotSaved
        ) : said !== "" ? (
          <span className="visually-hidden">{said}</span>
        ) : null}
      </p>
    </div>
  );
}
