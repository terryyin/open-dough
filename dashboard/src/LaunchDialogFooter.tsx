// What a launch dialog keeps in view below its scrolling body
// (`./LaunchDialog.tsx`): the launch's effects, beside Start; once the launch
// is submitted, the cutoff saying it can no longer be cancelled here; and
// Cancel and Start, which says "Starting…" while the request is on its way.

import type { ReactNode, RefObject } from "react";

export function LaunchDialogFooter({
  id,
  effects,
  submitting,
  startBlocked,
  startButton,
  onCancel,
}: {
  readonly id: string;
  readonly effects: ReactNode;
  readonly submitting: boolean;
  // Whether the choices cannot start yet.
  readonly startBlocked: boolean;
  readonly startButton: RefObject<HTMLButtonElement | null>;
  readonly onCancel: () => void;
}) {
  const effectsId = `${id}-effects`;
  const cutoffId = `${id}-cutoff`;
  return (
    <div className="launch-dialog-footer">
      {effects !== undefined && (
        <p id={effectsId} className="launch-dialog-effects">
          {effects}
        </p>
      )}
      {submitting && (
        <p id={cutoffId} className="launch-dialog-cutoff">
          Startup is underway and can no longer be cancelled here.
        </p>
      )}
      <div className="launch-dialog-actions">
        <button
          type="button"
          aria-describedby={submitting ? cutoffId : undefined}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          ref={startButton}
          type="submit"
          className="launch-dialog-start"
          aria-describedby={effects !== undefined ? effectsId : undefined}
          disabled={startBlocked}
        >
          {submitting ? "Starting…" : "Start"}
        </button>
      </div>
    </div>
  );
}
