import { useContext, useState } from "react";
import { Mic, Square } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { useInstructionRecording } from "./useInstructionRecording.ts";
import { instructionProblems } from "./instructionTranscription.ts";
import { terminalDictationText } from "./terminalDictation.ts";
import { SettingsNavigation } from "./settingsNavigation.ts";

// Destination state belongs to the keyed session view, so attachment retries
// retain an unsent result while closing or replacing the view discards it.
export function useTerminalDictation(insert: (text: string) => boolean) {
  const openSettings = useContext(SettingsNavigation);
  const [pending, setPending] = useState<string>();
  const [problem, setProblem] = useState<string>();
  const recording = useInstructionRecording((transcript) => {
    const text = terminalDictationText(transcript);
    if (!text) setProblem(instructionProblems.empty);
    else if (!insert(text)) setPending(text);
  });
  const recordingNow = recording.phase === "recording";
  return {
    control: (
      <IconButton
        label={recordingNow ? "Stop recording" : "Dictate into terminal"}
        icon={recordingNow ? Square : Mic}
        disabled={pending !== undefined || (recording.busy && !recordingNow)}
        onClick={() => {
          if (recordingNow) recording.stop();
          else {
            setProblem(undefined);
            void recording.record();
          }
        }}
      />
    ),
    feedback: (
      <>
        {recording.status && <p className="quiet">{recording.status}</p>}
        {(recording.problem || problem) && (
          <p role="alert">{recording.problem || problem}</p>
        )}
        {recording.setupRequired && openSettings && (
          <button
            type="button"
            className="frame-button"
            onClick={() => {
              openSettings(() => {});
            }}
          >
            Open OpenAI settings
          </button>
        )}
        {pending !== undefined && (
          <div className="terminal-transcript">
            <p>
              The transcript was not inserted. Reconnect, then insert it here or
              discard it. Nothing is inserted automatically.
            </p>
            <label>
              Unsent transcript
              <textarea
                className="frame-input"
                readOnly
                rows={3}
                value={pending}
              />
            </label>
            <button
              type="button"
              className="frame-button"
              onClick={() => {
                if (insert(pending)) setPending(undefined);
              }}
            >
              Insert transcript
            </button>
            <button
              type="button"
              className="frame-button"
              onClick={() => {
                setPending(undefined);
              }}
            >
              Discard transcript
            </button>
          </div>
        )}
      </>
    ),
  };
}
