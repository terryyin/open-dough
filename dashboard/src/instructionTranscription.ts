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
