import { useContext, useState } from "react";
import { Mic, Square } from "lucide-react";
import { IconButton } from "./Icon.tsx";
import { useInstructionRecording } from "./useInstructionRecording.ts";
import { instructionProblems } from "./instructionTranscription.ts";
import { terminalDictationText } from "./terminalDictation.ts";
import { SettingsNavigation } from "./settingsNavigation.ts";

// Destination state belongs to the keyed session view, so attachment retries
// retain an unsent result while closing or replacing the view discards it.
// `recovery` names the panel's shown attach-again action when an offer fails,
// or nothing while the attachment is still connecting.
export function useTerminalDictation(
  insert: (text: string) => boolean,
  recovery: () => string | undefined,
) {
  const openSettings = useContext(SettingsNavigation);
  const [pending, setPending] = useState<{
    readonly text: string;
    readonly action: string | undefined;
  }>();
  const [problem, setProblem] = useState<string>();
  const offer = (text: string) => {
    if (insert(text)) setPending(undefined);
    else setPending({ text, action: recovery() });
  };
  const recording = useInstructionRecording((transcript) => {
    const text = terminalDictationText(transcript);
    if (!text) setProblem(instructionProblems.empty);
    else offer(text);
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
              {pending.action === undefined
                ? "The transcript was not inserted while the terminal is still connecting. Insert it here once it connects, or discard it."
                : `The transcript was not inserted. ${pending.action}, then insert it here or discard it.`}{" "}
              Nothing is inserted automatically.
            </p>
            <label>
              Unsent transcript
              <textarea
                className="frame-input"
                readOnly
                rows={3}
                value={pending.text}
              />
            </label>
            <button
              type="button"
              className="frame-button"
              onClick={() => {
                offer(pending.text);
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
