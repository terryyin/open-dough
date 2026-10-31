// Shared startup choices and editable instruction; only explicit Start submits.
// Dismissal releases dictation. A deliberate settings trip keeps this draft
// mounted, then restores the modal and its field focus.
import { useEffect, useId, useRef } from "react";
import { launchInstructionLimit } from "./agentLaunch.ts";
import { useExistingChangesConfirmation } from "./LaunchExistingChanges.tsx";
import { LaunchDialogFooter } from "./LaunchDialogFooter.tsx";
import { LaunchDisclosure } from "./LaunchDisclosure.tsx";
import { useLaunchInstruction } from "./LaunchInstruction.tsx";
import { useLaunchSettings } from "./useLaunchSettings.ts";
import { LaunchHostModel } from "./LaunchHostModel.tsx";
import { LaunchOptions, useOptionSelection } from "./LaunchOptions.tsx";
import {
  LaunchAttachments,
  useLaunchAttachments,
} from "./LaunchAttachmentControls.tsx";
import type { LaunchDialogProps } from "./LaunchDialogProps.ts";
import "./agent-launch.css";
import "./launch-dialog.css";
import "./launch-session.css";

// Mounted only while open, so an action carries no hidden dialog text and each
// opening starts without an earlier instruction or model choice. A launch that
// was not accepted hands its selection back (`onRefused`) for the next
// opening to start from (`kept`), so the developer can change it.
export function LaunchDialog({
  sourceId,
  projectContext = false,
  heading,
  subject,
  description,
  effects,
  details,
  host,
  onHost,
  note,
  fieldLabel,
  command,
  session,
  options,
  optionsLabel = "Options",
  optionsReading = false,
  optionsHint,
  optionsLine,
  kept,
  notOfferedLine,
  onStart,
  onRefused,
  onClose,
}: LaunchDialogProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const instruction = useRef<HTMLTextAreaElement>(null);
  const dictation = useLaunchInstruction(instruction, dialog);
  const headingId = `${id}-heading`;
  const hintId = `${id}-instruction-hint`;
  const accepted = useRef(false);
  const selection = useOptionSelection(
    options,
    kept,
    optionsReading,
    notOfferedLine,
  );
  const { selected, flags } = selection;
  const { model, setModel, effort, setEffort, catalog, settingsBlocked } =
    useLaunchSettings(sourceId, host, projectContext);
  const attachments = useLaunchAttachments();
  // Unless a launch found existing changes to confirm, closes with its answer.
  const confirmation = useExistingChangesConfirmation({
    id,
    landing: session.landing,
    onStart,
    ended: (answer) => {
      accepted.current = answer;
      if (!answer) onRefused?.(selected);
      dialog.current?.close();
    },
  });
  const { submitting } = confirmation;

  useEffect(() => {
    dialog.current?.showModal();
    instruction.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="launch-dialog"
      aria-labelledby={headingId}
      onCancel={(event) => {
        confirmation.onCancel(event);
        if (!submitting) dictation.cancel();
      }}
      onClose={() => {
        if (dictation.suspended.current) return;
        dictation.cancel();
        onClose(accepted.current);
      }}
    >
      {confirmation.view}
      <form
        hidden={Boolean(confirmation.view)}
        onSubmit={(event) => {
          event.preventDefault();
          if (settingsBlocked || dictation.busy) {
            return;
          }
          confirmation.start({
            host,
            instruction: instruction.current?.value ?? "",
            ...(model === "" ? {} : { model }),
            ...((host === "codex" || host === "cursor") && effort !== ""
              ? { effort }
              : {}),
            ...(flags.length === 0 ? {} : { options: flags }),
            ...(attachments.files.length === 0
              ? {}
              : { images: attachments.files }),
            ...session.chosen,
          });
        }}
      >
        <fieldset className="launch-dialog-submission" disabled={submitting}>
          <div className="launch-dialog-body">
            <h2 id={headingId}>{heading}</h2>
            {subject !== undefined && (
              <p className="launch-dialog-subject">{subject}</p>
            )}
            <p>{description}</p>
            {note !== undefined && <p className="launch-dialog-note">{note}</p>}
            <label htmlFor={`${id}-instruction`}>{fieldLabel}</label>
            <textarea
              ref={instruction}
              id={`${id}-instruction`}
              className="frame-input"
              aria-describedby={command !== undefined ? hintId : undefined}
              maxLength={launchInstructionLimit}
              rows={4}
              readOnly={dictation.busy}
            />
            {dictation.controls}
            <LaunchAttachments
              id={id}
              items={attachments.items}
              onAdd={attachments.addFiles}
              onRemove={attachments.removeAt}
              disabled={dictation.busy}
            />
            <LaunchHostModel
              id={id}
              host={host}
              onHost={onHost}
              model={model}
              onModel={setModel}
              effort={effort}
              onEffort={setEffort}
              catalog={catalog}
            />
            {session.group(id)}
            {options !== undefined && options.options.length > 0 ? (
              <LaunchOptions
                id={id}
                label={optionsLabel}
                shape={options}
                hint={optionsHint}
                selected={selected}
                onChoose={selection.choose}
                onClearGroup={selection.clearGroup}
              />
            ) : (
              optionsLine !== undefined && (
                <p className="quiet">{optionsLine}</p>
              )
            )}
            {selection.changedOfferLine !== undefined && (
              <p className="quiet">{selection.changedOfferLine}</p>
            )}
            {(command !== undefined || details !== undefined) && (
              <LaunchDisclosure summary="Command details">
                <div className="launch-disclosure-content">
                  {command !== undefined && (
                    <p id={hintId}>
                      Sent after <code>{[command, ...flags].join(" ")}</code>.
                    </p>
                  )}
                  {details}
                </div>
              </LaunchDisclosure>
            )}
          </div>
          <LaunchDialogFooter
            id={id}
            effects={effects}
            submitting={submitting}
            startBlocked={
              settingsBlocked ||
              dictation.busy ||
              (optionsReading && selected.size > 0) ||
              session.blocksStart
            }
            startButton={confirmation.startButton}
            onCancel={() => {
              dictation.cancel();
              dialog.current?.close();
            }}
          />
        </fieldset>
      </form>
    </dialog>
  );
}
