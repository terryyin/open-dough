// A completed clip remains transient; only reviewed text uses the launch path.
export const instructionTranscriptionEndpoint = "/__instruction-transcription";
export const instructionAudioLimitBytes = 24_000_000;
export const instructionAudioTypes = ["audio/webm", "audio/mp4"];
export const instructionRecordingTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];
export const instructionSetupRequired =
  "Configure an OpenAI API key in System settings to dictate. You can also type the instruction.";
export const instructionRecordingTooLarge =
  "The recording is too large. Record a smaller clip or type the instruction.";
export const instructionTranscriptionFailed =
  "Transcription could not finish. Retry explicitly or type the instruction.";

export const instructionProblems = {
  configuration:
    "The saved OpenAI API key could not be read. Check System settings, replace the key, or type the instruction.",
  unavailable:
    "Microphone recording is unavailable in this browser. Type the instruction or use a browser with recording support.",
  format:
    "This browser cannot record a supported audio format. Type the instruction or try another browser.",
  permission:
    "Microphone permission was refused. Allow microphone access to retry, or type the instruction.",
  device:
    "No usable microphone is available. Check your microphone, retry explicitly, or type the instruction.",
  capture:
    "Microphone recording could not begin. Check your microphone, retry explicitly, or type the instruction.",
  network:
    "Transcription could not reach the service. Check your connection, retry explicitly, or type the instruction.",
  timeout:
    "Transcription took too long. Retry explicitly or type the instruction.",
  authentication:
    "OpenAI refused API access. Check or replace the API key in System settings, then retry explicitly or type the instruction.",
  rateLimit:
    "OpenAI's request or usage limit was reached. Check your API usage, retry explicitly later, or type the instruction.",
  empty:
    "No usable transcript was returned. Record another clip or type the instruction.",
};

// Only locally authored recovery messages cross into the dialog; native and
// provider exception text may contain diagnostics or credentials.
export function safeInstructionProblem(value: unknown, fallback: string) {
  return typeof value === "string" &&
    [
      ...Object.values(instructionProblems),
      instructionSetupRequired,
      instructionRecordingTooLarge,
      instructionTranscriptionFailed,
    ].includes(value)
    ? value
    : fallback;
}

export function microphoneProblem(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return instructionProblems.permission;
    if (
      ["NotFoundError", "NotReadableError", "OverconstrainedError"].includes(
        error.name,
      )
    ) {
      return instructionProblems.device;
    }
  }
  return safeInstructionProblem(
    error instanceof Error ? error.message : undefined,
    instructionProblems.capture,
  );
}
