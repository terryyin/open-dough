// The dialog mechanics shared by every launch action: a modal that focuses
// its instruction field, sends nothing when dismissed, shows "Starting…" while
// a launch is in flight, and, with the action's `useLaunchDialogLauncher`
// (./launchDialogLauncher.ts), returns the keyboard to the action that opened
// it, unless a launched session took it. Callers supply only the words, and
// the options a launch may select, or the line saying why there are none.
// The dialog reads in one order, for eyes and keyboard alike: what is started
// and why, the instruction, host and model on one row, the options behind a
// disclosure whose summary names the selection, the command and longer
// explanations behind Command details, then, always in view below the
// scrolling body, the launch's effects and Cancel and Start.

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  withChoice,
  withoutGroup,
  type OfferedShape,
} from "./commandOptions.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { LaunchHostModel } from "./LaunchHostModel.tsx";
import { LaunchOptions } from "./LaunchOptions.tsx";
import {
  launchInstructionLimit,
  type LaunchChoices,
  type LaunchModel,
} from "./agentLaunch.ts";
import "./agent-launch.css";
import "./launch-dialog.css";

// Mounted only while open, so an action carries no hidden dialog text and each
// opening starts without an earlier instruction or model choice. A launch that
// failed hands its selection back (`onRefused`) for the next opening to start
// from (`kept`), so the developer can change it.
export function LaunchDialog({
  heading,
  subject,
  description,
  effects,
  details,
  host = "claude",
  onHost,
  note,
  fieldLabel,
  command,
  options,
  optionsLabel = "Options",
  optionsReading = false,
  optionsHint,
  optionsLine,
  kept,
  notOfferedLine,
  starting,
  onStart,
  onRefused,
  onClose,
}: {
  readonly host?: AgentLaunchRequest["host"];
  readonly onHost?: ((host: AgentLaunchRequest["host"]) => void) | undefined;
  readonly heading: string;
  // What the launch is about, such as a story's title and identity.
  readonly subject?: ReactNode;
  // Why the launch is started, in a sentence.
  readonly description: ReactNode;
  // What pressing Start does, always in view beside Start.
  readonly effects?: ReactNode;
  // Longer explanations and metadata, read under Command details.
  readonly details?: ReactNode;
  readonly note?: ReactNode;
  readonly fieldLabel: string;
  // The command line the instruction follows; it includes the selected
  // options' flags, in the order `options` offers them.
  readonly command?: string;
  readonly optionsReading?: boolean;
  readonly options?: OfferedShape | undefined;
  // The name of the options' disclosure.
  readonly optionsLabel?: string;
  readonly optionsHint?: string;
  // Said in place of the options when there are none to choose from.
  readonly optionsLine?: string | undefined;
  readonly kept?: ReadonlySet<string> | undefined;
  // Said under the options when `kept` names flags the offer no longer has.
  readonly notOfferedLine?: string | undefined;
  readonly starting: boolean;
  readonly onStart: (choices: LaunchChoices) => Promise<boolean>;
  readonly onRefused?: (selected: ReadonlySet<string>) => void;
  // Whether a launched session took the keyboard.
  readonly onClose: (launched: boolean) => void;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const instruction = useRef<HTMLTextAreaElement>(null);
  const headingId = `${id}-heading`;
  const hintId = `${id}-instruction-hint`;
  const effectsId = `${id}-effects`;
  const launched = useRef(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(
    kept ?? new Set(),
  );
  const flags = (options?.options ?? [])
    .map(({ flag }) => flag)
    .filter((flag) => selected.has(flag));
  const absent = [...selected].filter(
    (flag) => !(options?.options ?? []).some((option) => option.flag === flag),
  );
  const changedOfferLine =
    optionsReading || absent.length === 0
      ? notOfferedLine
      : `Not offered any more, so not sent: ${absent.join(", ")}.`;
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
            host,
            instruction: instruction.current?.value ?? "",
            ...(model === "" ? {} : { model }),
            ...(flags.length === 0 ? {} : { options: flags }),
          }).then((started) => {
            launched.current = started;
            if (!started) onRefused?.(selected);
            dialog.current?.close();
          });
        }}
      >
        <div className="launch-dialog-body">
          <h2 id={headingId}>{heading}</h2>
          {subject !== undefined && (
            <p className="launch-dialog-subject">{subject}</p>
          )}
          <p>{description}</p>
          {note}
          <label htmlFor={`${id}-instruction`}>{fieldLabel}</label>
          <textarea
            ref={instruction}
            id={`${id}-instruction`}
            aria-describedby={command !== undefined ? hintId : undefined}
            maxLength={launchInstructionLimit}
            rows={4}
          />
          <LaunchHostModel
            id={id}
            host={host}
            onHost={onHost}
            model={model}
            onModel={setModel}
          />
          {options !== undefined && options.options.length > 0 ? (
            <LaunchOptions
              id={id}
              label={optionsLabel}
              shape={options}
              hint={optionsHint}
              selected={selected}
              onChoose={(flag, chosen) => {
                setSelected((current) =>
                  withChoice(options, current, flag, chosen),
                );
              }}
              onClearGroup={(group) => {
                setSelected((current) => withoutGroup(current, group));
              }}
            />
          ) : (
            optionsLine !== undefined && <p className="quiet">{optionsLine}</p>
          )}
          {changedOfferLine !== undefined && (
            <p className="quiet">{changedOfferLine}</p>
          )}
          {(command !== undefined || details !== undefined) && (
            <details className="launch-disclosure">
              <summary>Command details</summary>
              <div className="launch-disclosure-content">
                {command !== undefined && (
                  <p id={hintId}>
                    Sent after <code>{[command, ...flags].join(" ")}</code>.
                  </p>
                )}
                {details}
              </div>
            </details>
          )}
        </div>
        <div className="launch-dialog-footer">
          {effects !== undefined && (
            <p id={effectsId} className="launch-dialog-effects">
              {effects}
            </p>
          )}
          <div className="launch-dialog-actions">
            <button
              type="button"
              onClick={() => {
                dialog.current?.close();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="launch-dialog-start"
              aria-describedby={effects !== undefined ? effectsId : undefined}
              disabled={starting || (optionsReading && selected.size > 0)}
            >
              {starting ? "Starting…" : "Start"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
