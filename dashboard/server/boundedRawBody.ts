// One bounded raw-body read for binary local-boundary POSTs: content type and
// length are checked before and while bytes arrive, so a large or wrong body
// never raises the shared 32 KB JSON bound (`./jsonRequestBody.ts`).

import type { IncomingMessage } from "node:http";
import { RefusedRequest } from "./localOrigin.ts";

export async function readBoundedRawBody(
  req: IncomingMessage,
  signal: AbortSignal,
  {
    allowedTypes,
    limitBytes,
    unsupportedType,
    tooLarge,
    empty,
  }: {
    readonly allowedTypes: readonly string[];
    readonly limitBytes: number;
    readonly unsupportedType: string;
    readonly tooLarge: string;
    readonly empty: string;
  },
): Promise<{ readonly bytes: Buffer; readonly type: string }> {
  const type = req.headers["content-type"]?.split(";")[0]?.trim() ?? "";
  if (!allowedTypes.includes(type)) {
    throw new RefusedRequest(415, unsupportedType);
  }
  if (Number(req.headers["content-length"]) > limitBytes) {
    throw new RefusedRequest(413, tooLarge);
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
          : new Error("The binary request was aborted."),
      );
    };
    const abort = () => {
      error(signal.reason);
      req.resume();
    };
    const data = (chunk: Buffer) => {
      size += chunk.length;
      if (size > limitBytes) {
        error(new RefusedRequest(413, tooLarge));
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
    throw new RefusedRequest(400, empty);
  }
  return { bytes, type };
}
