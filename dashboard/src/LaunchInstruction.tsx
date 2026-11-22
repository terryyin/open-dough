import { useContext, useRef, useState, type RefObject } from "react";
import { SettingsNavigation } from "./settingsNavigation.ts";
import type { InstructionTranscriptionSource } from "./instructionTranscriptionSource.ts";
import { useInstructionRecording } from "./useInstructionRecording.ts";
import { fitTranscript, TranscriptReview } from "./TranscriptReview.tsx";

export function useLaunchInstruction(
  field: RefObject<HTMLTextAreaElement | null>,
  dialog: RefObject<HTMLDialogElement | null>,
  source: InstructionTranscriptionSource,
  { before = "Start", subject = "instruction", recordLabel = "Record" } = {},
) {
  const openSettings = useContext(SettingsNavigation);
  const suspended = useRef(false);
  const [overflow, setOverflow] = useState<string>();
  const append = (text: string) => {
    const destination = field.current;
    if (!destination) {
      return false;
    }
    const combined = fitTranscript(destination.value, text);
    if (combined === undefined) {
      return false;
    }
    destination.value = combined;
    destination.focus();
    return true;
  };
  const recording = useInstructionRecording(source, (text) => {
    if (!append(text)) {
      setOverflow(text);
    }
  });
  const reviewing = overflow !== undefined;
  const discard = () => {
    setOverflow(undefined);
    field.current?.focus();
  };
  return {
    ...recording,
    busy: recording.busy || reviewing,
    cancel: () => {
      recording.cancel();
      setOverflow(undefined);
    },
    suspended,
    controls: (
      <div className="launch-dictation">
        <button
          type="button"
          className="frame-button"
          disabled={recording.busy || reviewing}
          onClick={() => {
            void recording.record();
          }}
        >
          {recordLabel}
        </button>{" "}
        <button
          type="button"
          className="frame-button"
          disabled={recording.phase !== "recording"}
          onClick={recording.stop}
        >
          Stop recording
        </button>
        <p role="status">
          {recording.status ??
            (reviewing
              ? `Review or discard the transcript before ${before}.`
              : `Dictate, then review or edit the text before ${before}.`)}
        </p>
        {recording.problem && (
          <p role="alert">
            {recording.problem.replaceAll("instruction", subject)}
          </p>
        )}
        {recording.setupRequired && openSettings && (
          <button
            type="button"
            className="frame-button"
            onClick={() => {
              suspended.current = true;
              dialog.current?.close();
              openSettings(() => {
                suspended.current = false;
                dialog.current?.showModal();
                field.current?.focus();
              });
            }}
          >
            Open OpenAI settings
          </button>
        )}
        {reviewing && (
          <TranscriptReview
            transcript={overflow}
            draft={field.current?.value ?? ""}
            subject={subject}
            onAdd={(text) => {
              if (append(text)) {
                setOverflow(undefined);
              }
            }}
            onDiscard={discard}
          />
        )}
      </div>
    ),
  };
}
