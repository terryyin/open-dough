// The JSON body of a request to the local launch boundary
// (`./agentLaunchAdmission.ts`), refused when it is not JSON or is larger than
// any request the launch limits allow.

import type { IncomingMessage } from "node:http";
import { RefusedRequest } from "./localOrigin.ts";

// Enough for the longest request the limits allow, in any UTF-8 spelling.
const bodyLimitBytes = 32 * 1024;

function readBody(req: IncomingMessage, signal?: AbortSignal): Promise<string> {
  signal?.throwIfAborted();
  let aborted: (() => void) | undefined;
  return new Promise<string>((resolve, reject) => {
    aborted = () => {
      const reason: unknown = signal?.reason;
      reject(
        reason instanceof Error
          ? reason
          : new Error("The request was aborted."),
      );
    };
    signal?.addEventListener("abort", aborted, { once: true });
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > bodyLimitBytes) {
        req.destroy();
        reject(new RefusedRequest(413, "The request is too large."));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  }).finally(() => {
    if (aborted !== undefined) signal?.removeEventListener("abort", aborted);
  });
}

export async function jsonBody(
  req: IncomingMessage,
  signal?: AbortSignal,
): Promise<unknown> {
  if (!/^application\/json\b/.test(req.headers["content-type"] ?? "")) {
    throw new RefusedRequest(415, "A request here is JSON.");
  }
  try {
    return JSON.parse(await readBody(req, signal));
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    if (error instanceof RefusedRequest) {
      throw error;
    }
    throw new RefusedRequest(400, "The request is not JSON.");
  }
}
