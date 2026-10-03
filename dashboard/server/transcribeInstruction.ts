import { RefusedRequest } from "./localOrigin.ts";
import { readOpenAIAPIKey } from "./openAICredential.ts";
import { instructionSetupRequired } from "../src/instructionTranscription.ts";

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
  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal,
    },
  );
  if (!response.ok) {
    await response.body?.cancel();
    throw new RefusedRequest(
      502,
      "OpenAI could not transcribe this recording. Check your API access in System settings, retry, or type the instruction.",
    );
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error();
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
        throw new Error();
      }
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const answer: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (
    typeof answer !== "object" ||
    answer === null ||
    !("text" in answer) ||
    typeof answer.text !== "string" ||
    !answer.text.trim()
  ) {
    throw new RefusedRequest(
      502,
      "No usable transcript was returned. Record another clip or type the instruction.",
    );
  }
  signal.throwIfAborted();
  return { text: answer.text.trim() };
}
