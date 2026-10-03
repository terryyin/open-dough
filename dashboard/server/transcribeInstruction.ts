import { RefusedRequest } from "./localOrigin.ts";
import { readOpenAIAPIKey } from "./openAICredential.ts";
import {
  instructionSetupRequired,
  instructionProblems,
  instructionTranscriptionFailed,
} from "../src/instructionTranscription.ts";

const responseLimitBytes = 256 * 1024;

export async function transcribeInstruction(
  audio: { bytes: Buffer; type: string },
  signal: AbortSignal,
) {
  const apiKey = readOpenAIAPIKey();
  if (apiKey === undefined) {
    throw new RefusedRequest(409, instructionSetupRequired);
  }
  const form = new FormData();
  form.set("model", "gpt-transcribe");
  const extension = audio.type === "audio/mp4" ? "mp4" : "webm";
  form.set(
    "file",
    new Blob([new Uint8Array(audio.bytes)], { type: audio.type }),
    `instruction.${extension}`,
  );
  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal,
    });
  } catch {
    signal.throwIfAborted();
    throw new RefusedRequest(503, instructionProblems.network);
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new RefusedRequest(
      502,
      response.status === 401 || response.status === 403
        ? instructionProblems.authentication
        : response.status === 429
          ? instructionProblems.rateLimit
          : instructionTranscriptionFailed,
    );
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new RefusedRequest(503, instructionProblems.empty);
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.byteLength;
      if (size > responseLimitBytes) {
        throw new RefusedRequest(503, instructionTranscriptionFailed);
      }
      chunks.push(value);
    }
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof RefusedRequest) throw error;
    throw new RefusedRequest(503, instructionProblems.network);
  } finally {
    // A disconnected stream can reject cancellation too; retain the safe
    // category (or deadline reason) from the actual read above.
    await reader.cancel().catch(() => undefined);
  }
  let answer: unknown;
  try {
    answer = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RefusedRequest(503, instructionProblems.empty);
  }
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("text" in answer) ||
    typeof answer.text !== "string" ||
    !answer.text.trim()
  ) {
    throw new RefusedRequest(502, instructionProblems.empty);
  }
  signal.throwIfAborted();
  return { text: answer.text.trim() };
}
