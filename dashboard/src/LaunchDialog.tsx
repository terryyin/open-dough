// The dialog mechanics shared by every launch action: a modal that focuses
// its instruction field, sends nothing when dismissed, shows "Starting…" while
// a launch is in flight, and returns the keyboard to the action that opened
// it, unless a launched session took it. Callers supply only the words, and
// the options a launch may select, offered as one flat list of checkboxes.

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { OfferedOption } from "./commandOptions.ts";
import { LaunchOptions } from "./LaunchOptions.tsx";
import {
  launchInstructionLimit,
  launchModels,
  type LaunchChoices,
  type LaunchModel,
} from "./agentLaunch.ts";
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
// opening starts without an earlier instruction or model choice.
export function LaunchDialog({
  heading,
  description,
  note,
  fieldLabel,
  command,
  options = [],
  optionsHint,
  starting,
  onStart,
  onClose,
}: {
  readonly heading: string;
  readonly description: ReactNode;
  readonly note?: ReactNode;
  readonly fieldLabel: string;
  // The command line the instruction follows; it includes the selected
  // options' flags, in the order `options` offers them.
  readonly command?: string;
  readonly options?: readonly OfferedOption[];
  readonly optionsHint?: string;
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
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const flags = options
    .map(({ flag }) => flag)
    .filter((flag) => selected.has(flag));
  const [model, setModel] = useState<LaunchModel | "">("");

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
            ...(model === "" ? {} : { model }),
            ...(flags.length === 0 ? {} : { options: flags }),
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
        {command !== undefined && (
          <p id={hintId} className="quiet" aria-live="polite">
            Sent after <code>{[command, ...flags].join(" ")}</code>.
          </p>
        )}
        <textarea
          ref={instruction}
          id={`${id}-instruction`}
          aria-describedby={command !== undefined ? hintId : undefined}
          maxLength={launchInstructionLimit}
          rows={4}
        />
        {options.length > 0 && (
          <LaunchOptions
            id={id}
            options={options}
            hint={optionsHint}
            selected={selected}
            onToggle={(flag, chosen) => {
              setSelected((current) => {
                const next = new Set(current);
                if (chosen) next.add(flag);
                else next.delete(flag);
                return next;
              });
            }}
          />
        )}
        <label htmlFor={`${id}-model`}>Model</label>
        <select
          id={`${id}-model`}
          value={model}
          onChange={(event) => {
            setModel(event.target.value as LaunchModel | "");
          }}
        >
          <option value="">Default (your Claude Code setting)</option>
          {Object.entries(launchModels).map(([alias, { name }]) => (
            <option key={alias} value={alias}>
              {name}
            </option>
          ))}
        </select>
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
