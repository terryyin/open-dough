import { useContext, useRef, useState, type RefObject } from "react";
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
  const recording = useInstructionRecording((text) => {
    const destination = field.current;
    if (!destination) {
      return;
    }
    const before = destination.value;
    const combined = before ? `${before}\n\n${text}` : text;
    if (combined.length > launchInstructionLimit) {
      setOverflow(text);
    } else {
      destination.value = combined;
    }
    destination.focus();
  });
  return {
    ...recording,
    suspended,
    controls: (
      <div className="launch-dictation">
        <button
          type="button"
          disabled={recording.busy}
          onClick={() => {
            void recording.record();
          }}
        >
          Record
        </button>{" "}
        <button
          type="button"
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
                : "Dictate, then review or edit the text before Start."}
        </p>
        {recording.problem && <p role="alert">{recording.problem}</p>}
        {recording.setupRequired && openSettings && (
          <button
            type="button"
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
        {overflow !== undefined && (
          <div role="alert">
            <p>
              This transcript exceeds the instruction limit. Your instruction
              was kept. Copy and shorten the complete transcript before adding
              it.
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{overflow}</p>
          </div>
        )}
      </div>
    ),
  };
}
