// A creator's includeTurns read persists a fresh blank before history loading.
// Codex 0.159.3 can then refuse list_turns; only that observed refusal is safe.
import { z } from "zod";
import { CodexRpc, NativeRefusal } from "./rpc.ts";

export async function materializeBlank(
  rpc: CodexRpc,
  threadId: string,
  workspace: string,
): Promise<void> {
  const identity = z.object({
    thread: z.object({ id: z.literal(threadId), cwd: z.literal(workspace) }),
  });
  let read: unknown;
  try {
    read = await rpc.request("thread/read", { threadId, includeTurns: true });
  } catch (error) {
    if (
      !(error instanceof NativeRefusal) ||
      error.code !== -32601 ||
      error.message !== "list_turns is not supported yet"
    )
      throw error;
    // Validate the original context as well; arbitrary failed reads establish
    // neither materialization nor availability.
    identity.parse(
      await rpc.request("thread/read", { threadId, includeTurns: false }),
    );
    return;
  }
  identity
    .extend({
      thread: identity.shape.thread.extend({ turns: z.array(z.unknown()) }),
    })
    .parse(read);
}
