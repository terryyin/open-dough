import { openAIConfigurationEndpoint } from "./openAIConfiguration.ts";
import {
  instructionProblems,
  instructionTranscriptionEndpoint,
  instructionTranscriptionFailed,
  safeInstructionProblem,
} from "./instructionTranscription.ts";

type TranscriptionAnswer =
  | { readonly text: string }
  | { readonly problem: string; readonly setupRequired?: boolean };

export type InstructionTranscriptionSource = {
  readonly configured: (signal: AbortSignal) => Promise<boolean>;
  readonly transcribe: (
    audio: Blob,
    signal: AbortSignal,
  ) => Promise<TranscriptionAnswer>;
};

export const instructionTranscription: InstructionTranscriptionSource = {
  async configured(signal) {
    const response = await fetch(openAIConfigurationEndpoint, { signal });
    const configuration: unknown = await response.json();
    if (!response.ok) throw new Error(instructionProblems.configuration);
    return !(
      typeof configuration === "object" &&
      configuration !== null &&
      "configured" in configuration &&
      configuration.configured === false
    );
  },
  async transcribe(audio, signal) {
    const response = await fetch(instructionTranscriptionEndpoint, {
      method: "POST",
      body: audio,
      signal,
    });
    const answer: unknown = await response.json();
    if (typeof answer !== "object" || answer === null) {
      return { problem: instructionProblems.empty };
    }
    if (!response.ok) {
      return {
        problem: safeInstructionProblem(
          "error" in answer ? answer.error : undefined,
          instructionTranscriptionFailed,
        ),
        setupRequired:
          "setupRequired" in answer && answer.setupRequired === true,
      };
    }
    return "text" in answer &&
      typeof answer.text === "string" &&
      answer.text.trim()
      ? { text: answer.text }
      : { problem: instructionProblems.empty };
  },
};
