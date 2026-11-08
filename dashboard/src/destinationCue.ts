// The destination cue: a brief mark on the card a reveal brings into view
// (`revealStory` in ./pageEntries.ts), so that a developer who follows a story
// reference or opens a direct story URL sees which card they arrived at, even
// among similar cards and when it is already in view. It is not the selected
// story's Highlight: it selects nothing, lies over the Highlight when the
// story is selected, and leaves inspection, focus and scrolling as the reveal
// made them. Each reveal cues again, restarting a cue still showing. The cue
// ends on its own after `destinationCueMs`; with reduced motion it is a
// static mark for that time (story-cards.css).

export const destinationCueClass = "story-card-destination-cue";

// How long a cue shows, in page time. The page gives the card this duration
// for its animation, so the mark and its ending agree.
export const destinationCueMs = 1600;

const durationProperty = "--destination-cue-duration";

// The end of the cue a card is showing, while it shows one.
const shownCues = new WeakMap<HTMLElement, () => void>();

export function cueDestination(card: HTMLElement): void {
  shownCues.get(card)?.();
  // Laying out the card without the cue lets the next one start afresh.
  card.getBoundingClientRect();
  card.style.setProperty(durationProperty, `${String(destinationCueMs)}ms`);
  card.classList.add(destinationCueClass);
  let timer = 0;
  const end = () => {
    window.clearTimeout(timer);
    shownCues.delete(card);
    card.classList.remove(destinationCueClass);
    card.style.removeProperty(durationProperty);
  };
  timer = window.setTimeout(end, destinationCueMs);
  shownCues.set(card, end);
}
