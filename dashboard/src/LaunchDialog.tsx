// The dialog mechanics shared by every launch action: a modal that focuses
// its instruction field, sends nothing when dismissed, shows "Starting…" while
// a launch is in flight, and returns the keyboard to the action that opened
// it, unless a launched session took it. Callers supply only the words.

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { launchInstructionLimit, type LaunchChoices } from "./agentLaunch.ts";
import "./agent-launch.css";

// The action's side of the dialog: its button, whether the dialog is open, and
// the keyboard's return. A closed dialog returns the keyboard to the button
// once it can take it again: at once, or when a launch still in flight has
// answered.
export function useLaunchDialogLauncher(starting: boolean): {
  readonly launcher: RefObject<HTMLButtonElement | null>;
  readonly open: boolean;
  readonly openDialog: () => void;
  // Whether a launched session took the keyboard.
  readonly closeDialog: (launched: boolean) => void;
} {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const returnsFocus = useRef(false);
  useEffect(() => {
    if (!open && !starting && returnsFocus.current) {
      returnsFocus.current = false;
      launcher.current?.focus();
    }
  }, [open, starting]);
  return {
    launcher,
    open,
    openDialog: () => {
      setOpen(true);
    },
    closeDialog: (launched) => {
      returnsFocus.current = !launched;
      setOpen(false);
    },
  };
}

// Mounted only while open, so an action carries no hidden dialog text and each
// opening starts without an earlier instruction.
export function LaunchDialog({
  heading,
  description,
  note,
  fieldLabel,
  fieldHint,
  starting,
  onStart,
  onClose,
}: {
  readonly heading: string;
  readonly description: ReactNode;
  readonly note?: ReactNode;
  readonly fieldLabel: string;
  readonly fieldHint?: ReactNode;
  readonly starting: boolean;
  readonly onStart: (choices: LaunchChoices) => Promise<boolean>;
  // Whether a launched session took the keyboard.
  readonly onClose: (launched: boolean) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const instruction = useRef<HTMLTextAreaElement>(null);
  const headingId = `${id}-heading`;
  const hintId = `${id}-instruction-hint`;
  const launched = useRef(false);

  useEffect(() => {
    dialog.current?.showModal();
    instruction.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="launch-dialog"
      aria-labelledby={headingId}
      onClose={() => {
        onClose(launched.current);
      }}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onStart({
            instruction: instruction.current?.value ?? "",
          }).then((started) => {
            launched.current = started;
            dialog.current?.close();
          });
        }}
      >
        <h2 id={headingId}>{heading}</h2>
        <p>{description}</p>
        {note}
        <label htmlFor={`${id}-instruction`}>{fieldLabel}</label>
        {fieldHint !== undefined && (
          <p id={hintId} className="quiet">
            {fieldHint}
          </p>
        )}
        <textarea
          ref={instruction}
          id={`${id}-instruction`}
          aria-describedby={fieldHint !== undefined ? hintId : undefined}
          maxLength={launchInstructionLimit}
          rows={4}
        />
        <div className="launch-dialog-actions">
          <button type="submit" disabled={starting}>
            {starting ? "Starting…" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              dialog.current?.close();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </dialog>
  );
}
