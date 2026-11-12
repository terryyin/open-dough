// A done story card's review state among its Story actions
// (`./DoneStoryCard.tsx`), from the project's shared states
// (`./storyReviewStates.ts`): an unreviewed story offers Mark as reviewed; a
// reviewed one says Reviewed, a status in words rather than a control, and
// offers the quieter Unreview beside it. An unreviewed story shows no badge.
// Nothing shows until the project's states are first read. Using either
// action keeps the keyboard on the card, on the action that then shows (when
// Recently done has meanwhile kept the keyboard on the card itself, it moves
// on to that action), and says once what changed. A change that could not be
// saved leaves the card showing the state last saved, with the keyboard on the
// action still shown, and says so until the action is used again and saved.
// It never selects the story or opens the Side panel.
import { useEffect, useRef, useState } from "react";
import {
  reviewStateNotSaved,
  type StoryReviewStates,
} from "./storyReviewStates.ts";
import "./story-review-state.css";

export function StoryReviewStateAction({
  identity,
  states,
}: {
  readonly identity: string;
  readonly states: StoryReviewStates;
}) {
  const [said, setSaid] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const holder = useRef<HTMLDivElement>(null);
  const control = useRef<HTMLButtonElement>(null);
  const keepFocus = useRef(false);
  const reviewed = states.reviewed?.has(identity);
  useEffect(() => {
    if (!keepFocus.current) return;
    keepFocus.current = false;
    // The action used is gone; the keyboard is on the page or still on the
    // card unless the developer moved it elsewhere meanwhile.
    const focused = document.activeElement;
    const card = holder.current?.closest("article") ?? holder.current;
    if (
      focused === null ||
      focused === document.body ||
      card?.contains(focused) === true
    )
      control.current?.focus();
  }, [reviewed]);
  if (reviewed === undefined) return null;
  const act = () => {
    if (busy) return;
    setBusy(true);
    keepFocus.current = true;
    states
      .change({ identity, reviewed: !reviewed })
      .then(
        () => {
          setFailed(false);
          setSaid(reviewed ? "Marked as not reviewed." : "Marked as reviewed.");
        },
        () => {
          keepFocus.current = false;
          setFailed(true);
        },
      )
      .finally(() => {
        setBusy(false);
      });
  };
  return (
    <div ref={holder} className="story-review-state">
      {reviewed ? (
        <>
          <span className="story-review-state-reviewed">Reviewed</span>
          <button
            ref={control}
            type="button"
            className="start-launch-button story-review-state-undo"
            aria-disabled={busy}
            onClick={act}
          >
            Unreview
          </button>
        </>
      ) : (
        <button
          ref={control}
          type="button"
          className="start-launch-button"
          aria-disabled={busy}
          onClick={act}
        >
          Mark as reviewed
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
