// A passive native read ends when its caller leaves or its bounded wait expires.
import type { ServerResponse } from "node:http";

export async function withResponseSignal<T>(
  res: ServerResponse,
  read: (signal: AbortSignal) => Promise<T>,
  timeoutMs = 10_000,
): Promise<T> {
  const controller = new AbortController();
  const closed = () => {
    controller.abort();
  };
  const deadline = setTimeout(closed, timeoutMs);
  res.on("close", closed);
  try {
    return await read(controller.signal);
  } finally {
    clearTimeout(deadline);
    res.off("close", closed);
  }
}
