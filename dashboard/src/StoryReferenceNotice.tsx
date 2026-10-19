// The persistent navigation announcement and the actions that belong to it.
// Activating one keeps the journey; typing or moving elsewhere supersedes it.
export function isStoryReferenceAction(event: Event): boolean {
  if (
    !(event.target instanceof Element) ||
    event.target.closest(".story-reference-actions button") === null
  )
    return false;
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
