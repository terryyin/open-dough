import type { IncomingMessage } from "node:http";
import {
  instructionAudioLimitBytes,
  instructionAudioTypes,
  instructionRecordingTooLarge,
} from "../src/instructionTranscription.ts";
import { RefusedRequest } from "./localOrigin.ts";

export async function readInstructionAudio(
  req: IncomingMessage,
  signal: AbortSignal,
) {
  const type = req.headers["content-type"]?.split(";")[0]?.trim() ?? "";
  if (!instructionAudioTypes.includes(type)) {
    throw new RefusedRequest(
      415,
      "Record a supported audio clip before transcribing.",
    );
  }
  if (Number(req.headers["content-length"]) > instructionAudioLimitBytes) {
    throw new RefusedRequest(413, instructionRecordingTooLarge);
  }
  signal.throwIfAborted();
  const bytes = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const cleanup = () => {
      req.off("data", data);
      req.off("end", end);
      req.off("error", error);
      signal.removeEventListener("abort", abort);
    };
    const error = (reason: unknown) => {
      cleanup();
      reject(
        reason instanceof Error
          ? reason
          : new Error("The audio request was aborted."),
      );
    };
    const abort = () => {
      error(signal.reason);
      req.resume();
    };
    const data = (chunk: Buffer) => {
      size += chunk.length;
      if (size > instructionAudioLimitBytes) {
        error(new RefusedRequest(413, instructionRecordingTooLarge));
        req.resume();
      } else {
        chunks.push(chunk);
      }
    };
    const end = () => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };
    req.on("data", data);
    req.on("end", end);
    req.on("error", error);
    signal.addEventListener("abort", abort, { once: true });
  });
  if (bytes.length === 0) {
    throw new RefusedRequest(
      400,
      "The recording is empty. Record another clip or type the instruction.",
    );
  }
  return { bytes, type };
}
