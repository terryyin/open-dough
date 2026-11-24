import { useEffect, useRef, useState } from "react";
import type { InstructionTranscriptionSource } from "./instructionTranscriptionSource.ts";
import {
  instructionAudioLimitBytes,
  instructionRecordingTypes,
  instructionSetupRequired,
  instructionRecordingTooLarge,
  instructionProblems,
  safeInstructionProblem,
  microphoneProblem,
} from "./instructionTranscription.ts";

type Phase = "ready" | "permission" | "recording" | "transcribing";
const recordingStatus = {
  ready: undefined,
  permission: "Waiting for microphone permission…",
  recording: "Recording… Stop recording when you are finished.",
  transcribing: "Transcribing…",
};
type Operation = {
  controller: AbortController;
  stream?: MediaStream;
  recorder?: MediaRecorder;
  explicitlyStopped?: boolean;
};

export function useInstructionRecording(
  source: InstructionTranscriptionSource,
  append: (text: string) => void,
) {
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
    const failTranscription = (message: unknown) => {
      failed(safeInstructionProblem(message, instructionProblems.network));
    };
    let readingConfiguration = true;
    try {
      const configured = await source.configured(own.controller.signal);
      if (!current()) {
        return;
      }
      if (!configured) {
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
        if (bytes === 0) {
          failed(instructionProblems.noAudio);
          return;
        }
        void (async () => {
          try {
            const audio = new Blob(chunks, { type: recorder.mimeType });
            const answer = await source.transcribe(
              audio,
              own.controller.signal,
            );
            if (!current()) {
              return;
            }
            if ("problem" in answer) {
              if (answer.setupRequired) setSetupRequired(true);
              failTranscription(answer.problem);
              return;
            }
            operation.current = undefined;
            setPhase("ready");
            append(answer.text);
          } catch (error) {
            failTranscription(
              error instanceof Error ? error.message : undefined,
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
    status: recordingStatus[phase],
    busy: phase !== "ready",
    problem,
    setupRequired,
    record,
    stop,
    cancel: () => {
      cancel();
      setPhase("ready");
      setProblem(undefined);
      setSetupRequired(false);
    },
  };
}
