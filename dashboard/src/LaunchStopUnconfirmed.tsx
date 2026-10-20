// The replacement-writer block in a launch dialog: a session in this
// workspace carries a stop that was not confirmed, so starting another
// writer risks two agents editing the same workspace. Only an explicit
// Start anyway, after this risk is shown, overrides it. Its heading takes
// the keyboard when it opens.
import { useEffect, useRef } from "react";
import type { StopUnconfirmedFound } from "./sessionStop.ts";

export function LaunchStopUnconfirmed({
  id,
  blocked,
  starting,
  onBack,
  onStartAnyway,
}: {
  readonly id: string;
  readonly blocked: StopUnconfirmedFound;
  readonly starting: boolean;
  readonly onBack: () => void;
  readonly onStartAnyway: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = `${id}-stop-unconfirmed-heading`;
  useEffect(() => {
    heading.current?.focus();
  }, []);
  return (
    <section className="launch-changes" aria-labelledby={headingId}>
      <div className="launch-dialog-body">
        <h2 id={headingId} ref={heading} tabIndex={-1}>
          A session in this workspace may still be running
        </h2>
        <p>{blocked.explanation}</p>
        <p>
          Workspace <code>{blocked.workspace}</code>
        </p>
        <p>
          Starting anyway risks a competing writer: the earlier session may
          still be working in this workspace while the new session edits it too.
        </p>
      </div>
      <div className="launch-dialog-footer">
        <div className="launch-dialog-actions">
          <button
            type="button"
            className="frame-button"
            onClick={onBack}
            disabled={starting}
          >
            Back
          </button>
          <button
            type="button"
            className="frame-button frame-button-primary"
            onClick={onStartAnyway}
            disabled={starting}
          >
            {starting ? "Starting…" : "Start anyway"}
          </button>
        </div>
      </div>
    </section>
  );
}
