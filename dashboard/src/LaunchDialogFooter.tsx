// What a launch dialog keeps in view below its scrolling body
// (`./LaunchDialog.tsx`): the launch's effects, beside Start; once the launch
// is submitted, the cutoff saying it can no longer be cancelled here; and
// Cancel and Start, which says "Starting…" while the request is on its way.

import type { ReactNode, RefObject } from "react";
import "./frame-controls.css";

export function LaunchDialogFooter({
  id,
  effects,
  submitting,
  submittingLabel = "Starting…",
  submittingStatus,
  startBlocked,
  startButton,
  onCancel,
}: {
  readonly id: string;
  readonly effects: ReactNode;
  readonly submitting: boolean;
  // What Start says while the request is on its way.
  readonly submittingLabel?: string;
  // Optional status while the request is on its way (base CI judgment).
  readonly submittingStatus?: string;
  // Whether the choices cannot start yet.
  readonly startBlocked: boolean;
  readonly startButton: RefObject<HTMLButtonElement | null>;
  readonly onCancel: () => void;
}) {
  const effectsId = `${id}-effects`;
  const cutoffId = `${id}-cutoff`;
  const statusId = `${id}-submitting-status`;
  return (
    <div className="launch-dialog-footer">
      {effects !== undefined && (
        <p id={effectsId} className="launch-dialog-effects">
          {effects}
        </p>
      )}
      {submitting && submittingStatus !== undefined && (
        <p id={statusId} role="status" className="launch-dialog-cutoff">
          {submittingStatus}
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
          className="frame-button"
          aria-describedby={submitting ? cutoffId : undefined}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          ref={startButton}
          type="submit"
          className="frame-button frame-button-primary"
          aria-describedby={effects !== undefined ? effectsId : undefined}
          disabled={startBlocked}
        >
          {submitting ? submittingLabel : "Start"}
        </button>
      </div>
    </div>
  );
}
