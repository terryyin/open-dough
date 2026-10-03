import {
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { launchInstructionLimit } from "./agentLaunch.ts";
import { SettingsNavigation } from "./settingsNavigation.ts";
import { useInstructionRecording } from "./useInstructionRecording.ts";

export function useLaunchInstruction(
  field: RefObject<HTMLTextAreaElement | null>,
  dialog: RefObject<HTMLDialogElement | null>,
) {
  const openSettings = useContext(SettingsNavigation);
  const suspended = useRef(false);
  const [overflow, setOverflow] = useState<string>();
  const candidate = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const combinedText = (text: string) => {
    const before = field.current?.value ?? "";
    return before ? `${before}\n\n${text}` : text;
  };
  const append = (text: string) => {
    const destination = field.current;
    if (!destination) {
      return false;
    }
    const combined = combinedText(text);
    if (combined.length > launchInstructionLimit) {
      return false;
    }
    destination.value = combined;
    destination.focus();
    return true;
  };
  const recording = useInstructionRecording((text) => {
    if (!append(text)) {
      setOverflow(text);
    }
  });
  const reviewing = overflow !== undefined;
  useEffect(() => {
    if (reviewing) {
      candidate.current?.focus();
    }
  }, [reviewing]);
  const combinedLength = reviewing ? combinedText(overflow).length : 0;
  const canAdd =
    reviewing &&
    Boolean(overflow.trim()) &&
    combinedLength <= launchInstructionLimit;
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
          Record
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
          {recording.phase === "permission"
            ? "Waiting for microphone permission…"
            : recording.phase === "recording"
              ? "Recording… Stop recording when you are finished."
              : recording.phase === "transcribing"
                ? "Transcribing…"
                : reviewing
                  ? "Review or discard the transcript before Start."
                  : "Dictate, then review or edit the text before Start."}
        </p>
        {recording.problem && <p role="alert">{recording.problem}</p>}
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
          <div>
            <p role="alert" id={`${id}-overflow-hint`}>
              This transcript exceeds the instruction limit. Your instruction
              was kept. Shorten the complete transcript, then add it or discard
              it.
            </p>
            <label htmlFor={`${id}-transcript`}>Transcript to shorten</label>
            <textarea
              ref={candidate}
              className="frame-input"
              id={`${id}-transcript`}
              aria-describedby={`${id}-overflow-hint ${id}-overflow-length`}
              rows={4}
              value={overflow}
              onChange={(event) => {
                setOverflow(event.target.value);
              }}
            />
            <p id={`${id}-overflow-length`} aria-live="polite">
              {overflow.trim()
                ? `${combinedLength.toLocaleString()} of ${launchInstructionLimit.toLocaleString()} combined characters, including the separator.`
                : "Enter transcript text to add, or discard this transcript."}
            </p>
            <button
              type="button"
              className="frame-button"
              disabled={!canAdd}
              onClick={() => {
                if (canAdd && append(overflow)) {
                  setOverflow(undefined);
                }
              }}
            >
              Add transcript
            </button>{" "}
            <button type="button" className="frame-button" onClick={discard}>
              Discard transcript
            </button>
          </div>
        )}
      </div>
    ),
  };
}
