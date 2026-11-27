// One review state control, a done story's (`./StoryReviewStateAction.tsx`)
// or one session's (`./SessionReviewStateAction.tsx`): unreviewed offers a red
// Mark as reviewed, and reviewed a quieter Reviewed button that asks before
// undoing the review. Nothing shows until the project's states are first
// read. Using either action keeps the keyboard on the card, on the action that
// then shows (when Recently done has meanwhile kept the keyboard on the card
// itself, it moves on to that action), and says once what changed. A change
// that could not be saved leaves the state last saved, with the keyboard on
// the action still shown, and says so until the action is used again and
// saved. It never selects the story or opens the Side panel.
import { useRef, useState, type ReactNode } from "react";
import { InPlaceQuestion, useAskInPlace } from "./AskInPlace.tsx";
import { reviewStateNotSaved } from "./storyReviewStatesReadSource.ts";
import "./story-review-state.css";

export function ReviewStateControl({
  reviewed,
  question,
  change,
  badge,
}: {
  // Undefined until the project's states are first read.
  readonly reviewed: boolean | undefined;
  readonly question: string;
  // Saves the opposite state; rejects when it could not be saved.
  readonly change: (reviewed: boolean) => Promise<void>;
  readonly badge?: ReactNode;
}) {
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  const asking = useAskInPlace(
    reviewed ? question : undefined,
    async (pressed) => {
      if (reviewed === undefined || busy) return "withdrawn";
      setBusy(true);
      try {
        await change(!reviewed);
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
      {badge}
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
