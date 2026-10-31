import type { IncomingMessage } from "node:http";
import {
  instructionAudioLimitBytes,
  instructionAudioTypes,
  instructionRecordingTooLarge,
} from "../src/instructionTranscription.ts";
import { readBoundedRawBody } from "./boundedRawBody.ts";

export async function readInstructionAudio(
  req: IncomingMessage,
  signal: AbortSignal,
) {
  return readBoundedRawBody(req, signal, {
    allowedTypes: instructionAudioTypes,
    limitBytes: instructionAudioLimitBytes,
    unsupportedType: "Record a supported audio clip before transcribing.",
    tooLarge: instructionRecordingTooLarge,
    empty:
      "The recording is empty. Record another clip or type the instruction.",
  });
}
