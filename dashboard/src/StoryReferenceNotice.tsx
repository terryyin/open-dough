// The chooser can offer other destinations while an unavailable answer stays
// visible. Its interaction mark is independent of where or how it is styled.
const choicesAttribute = "data-story-reference-choices";
export const storyReferenceChoices = { [choicesAttribute]: true };

// Activating an action in the notice keeps the journey. Interacting with the
// chooser also keeps an unavailable answer while the reader considers it.
export function keepsStoryReference(
  event: Event,
  unavailable: boolean,
): boolean {
  const target = event.target;
  if (!(target instanceof Element)) return false;
  if (unavailable && target.closest(`[${choicesAttribute}]`) !== null)
    return true;
  if (target.closest(".story-reference-actions button") === null) return false;
  return (
    event.type === "pointerdown" ||
    event.type === "touchstart" ||
    (event instanceof KeyboardEvent &&
      (event.key === "Enter" || event.key === " "))
  );
}

export function StoryReferenceNotice({
  problem,
  pending,
  retry,
  dismiss,
}: {
  readonly problem: string | undefined;
  readonly pending: boolean;
  readonly retry: (() => void) | undefined;
  readonly dismiss: () => void;
}) {
  return (
    <div
      className="announcement story-reference-notice"
      role="status"
      aria-label="Story reference navigation"
    >
      {problem !== undefined && (
        <>
          <p>{problem}</p>
          <div className="story-reference-actions">
            {!pending && retry !== undefined && (
              <button type="button" className="frame-button" onClick={retry}>
                Retry story reference
              </button>
            )}
            <button type="button" className="frame-button" onClick={dismiss}>
              Dismiss story reference
            </button>
          </div>
        </>
      )}
    </div>
  );
}
