import { useEffect, useRef, useState } from "react";
import { openAIConfigurationEndpoint } from "./openAIConfiguration.ts";
import {
  instructionAudioLimitBytes,
  instructionRecordingTypes,
  instructionTranscriptionEndpoint,
  instructionSetupRequired,
  instructionRecordingTooLarge,
  instructionTranscriptionFailed,
  instructionProblems,
  safeInstructionProblem,
  microphoneProblem,
} from "./instructionTranscription.ts";

type Phase = "ready" | "permission" | "recording" | "transcribing";
type Operation = {
  controller: AbortController;
  stream?: MediaStream;
  recorder?: MediaRecorder;
  explicitlyStopped?: boolean;
};

export function useInstructionRecording(append: (text: string) => void) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [problem, setProblem] = useState<string>();
  const [setupRequired, setSetupRequired] = useState(false);
  const operation = useRef<Operation | undefined>(undefined);
  const release = (own: Operation) => {
    own.stream?.getTracks().forEach((track) => {
      track.stop();
    });
  };
  const cancel = () => {
    const own = operation.current;
    operation.current = undefined;
    if (!own) {
      return;
    }
    own.controller.abort();
    if (own.recorder?.state === "recording") {
      own.recorder.stop();
    }
    release(own);
  };
  useEffect(() => cancel, []);

  async function record() {
    if (operation.current) {
      return;
    }
    const own: Operation = { controller: new AbortController() };
    operation.current = own;
    setProblem(undefined);
    setSetupRequired(false);
    setPhase("permission");
    const current = () => operation.current === own;
    const failed = (message: string) => {
      if (!current()) {
        return;
      }
      cancel();
      setPhase("ready");
      setProblem(message);
    };
    let readingConfiguration = true;
    try {
      const status = await fetch(openAIConfigurationEndpoint, {
        signal: own.controller.signal,
      });
      const configuration: unknown = await status.json();
      if (!current()) {
        return;
      }
      if (!status.ok) {
        throw new Error(instructionProblems.configuration);
      }
      if (
        typeof configuration === "object" &&
        configuration !== null &&
        "configured" in configuration &&
        configuration.configured === false
      ) {
        setSetupRequired(true);
        failed(instructionSetupRequired);
        return;
      }
      readingConfiguration = false;
      // DOM declarations assume this capability exists; older browsers and
      // insecure contexts may omit it at runtime.
      const mediaDevices = (
        navigator as { readonly mediaDevices?: Partial<MediaDevices> }
      ).mediaDevices;
      if (!mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error(instructionProblems.unavailable);
      }
      const mimeType = instructionRecordingTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      if (!mimeType) {
        throw new Error(instructionProblems.format);
      }
      const stream = await mediaDevices.getUserMedia({ audio: true });
      own.stream = stream;
      if (!current()) {
        release(own);
        return;
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      own.recorder = recorder;
      const chunks: Blob[] = [];
      let bytes = 0;
      recorder.ondataavailable = (event) => {
        if (!current()) {
          return;
        }
        bytes += event.data.size;
        if (bytes > instructionAudioLimitBytes) {
          failed(instructionRecordingTooLarge);
        } else {
          chunks.push(event.data);
        }
      };
      recorder.onerror = () => {
        failed(
          "Microphone recording failed. Retry explicitly or type the instruction.",
        );
      };
      recorder.onstop = () => {
        release(own);
        if (!current()) {
          return;
        }
        if (!own.explicitlyStopped) {
          failed(
            "Microphone recording ended before Stop. Retry explicitly or type the instruction.",
          );
          return;
        }
        void (async () => {
          try {
            const audio = new Blob(chunks, { type: recorder.mimeType });
            const response = await fetch(instructionTranscriptionEndpoint, {
              method: "POST",
              body: audio,
              signal: own.controller.signal,
            });
            const answer: unknown = await response.json();
            if (!current()) {
              return;
            }
            if (typeof answer !== "object" || answer === null) {
              throw new Error(instructionProblems.empty);
            }
            if (!response.ok) {
              if ("setupRequired" in answer && answer.setupRequired === true) {
                setSetupRequired(true);
              }
              throw new Error(
                "error" in answer && typeof answer.error === "string"
                  ? safeInstructionProblem(
                      answer.error,
                      instructionTranscriptionFailed,
                    )
                  : instructionTranscriptionFailed,
              );
            }
            if (
              !("text" in answer) ||
              typeof answer.text !== "string" ||
              !answer.text.trim()
            ) {
              throw new Error(instructionProblems.empty);
            }
            operation.current = undefined;
            setPhase("ready");
            append(answer.text);
          } catch (error) {
            failed(
              safeInstructionProblem(
                error instanceof Error ? error.message : undefined,
                instructionProblems.network,
              ),
            );
          }
        })();
      };
      recorder.start(250);
      setPhase("recording");
    } catch (error) {
      failed(
        readingConfiguration
          ? instructionProblems.configuration
          : microphoneProblem(error),
      );
    }
  }
  const stop = () => {
    const own = operation.current;
    if (own?.recorder?.state !== "recording") {
      return;
    }
    setPhase("transcribing");
    own.explicitlyStopped = true;
    own.recorder.stop();
    release(own);
  };
  return {
    phase,
    busy: phase !== "ready",
    problem,
    setupRequired,
    record,
    stop,
    cancel,
  };
}
