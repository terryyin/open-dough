// Native done operations target the saved conversation, without CLI typing.
import { z } from "zod";
import type { HostSession, LaunchRecord } from "../../../src/agentLaunch.ts";
import { HostOperationFailure } from "../../hostLaunch.ts";
import { doneSessionName } from "../../../src/doneMark.ts";
import { CodexRpc, NativeRefusal } from "./rpc.ts";

const metadata = z.object({
  thread: z.object({ id: z.string(), status: z.object({ type: z.string() }) }),
});
const turns = z.object({
  data: z.array(z.object({ id: z.string().min(1), status: z.string() })),
});

async function connected<T>(
  session: HostSession,
  signal: AbortSignal,
  operation: (rpc: CodexRpc) => Promise<T>,
): Promise<T> {
  const endpoint = session.continuation?.endpoint;
  if (endpoint === undefined)
    throw new HostOperationFailure("Saved native endpoint is missing.");
  const rpc = new CodexRpc(endpoint, signal);
  try {
    await rpc.initialize();
    return await operation(rpc);
  } catch (error) {
    throw new HostOperationFailure(
      error instanceof NativeRefusal
        ? error.message
        : "The native operation could not be confirmed.",
    );
  } finally {
    rpc.close();
  }
}

export async function renameCodex(record: LaunchRecord): Promise<void> {
  await connected(record.session, AbortSignal.timeout(10_000), (rpc) =>
    rpc
      .request("thread/name/set", {
        threadId: record.session.sessionId,
        name: doneSessionName(record.session),
      })
      .then(() => {}),
  );
}

export async function stopCodex(
  session: HostSession,
  signal: AbortSignal,
): Promise<void> {
  await connected(session, signal, async (rpc) => {
    const threadId = session.sessionId;
    const read = metadata.parse(
      await rpc.request("thread/read", { threadId, includeTurns: false }),
    );
    if (read.thread.id !== threadId)
      throw new Error("Native read returned another conversation.");
    const status = read.thread.status.type;
    if (status === "idle" || status === "notLoaded") return;
    if (status !== "active")
      throw new Error(
        `Cannot establish an active turn from native status: ${status}`,
      );
    const turn = turns.parse(
      await rpc.request("thread/turns/list", {
        threadId,
        limit: 1,
        sortDirection: "desc",
        itemsView: "notLoaded",
      }),
    ).data[0];
    if (turn === undefined)
      throw new Error("Codex did not identify the active turn.");
    if (["completed", "interrupted", "failed"].includes(turn.status)) return;
    if (turn.status !== "inProgress")
      throw new Error(
        `Cannot establish an active turn from native turn status: ${turn.status}`,
      );
    // Never retry with a newer turn if this exact turn completed in the meantime.
    await rpc.request("turn/interrupt", { threadId, turnId: turn.id });
  });
}
