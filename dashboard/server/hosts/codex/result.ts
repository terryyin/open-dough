// Read retained history without loading/resuming the conversation or taking input.
import { z } from "zod";
import type { LaunchHost } from "../../launchHosts.ts";
import type { SessionResult } from "../../../src/sessionResult.ts";
import { CodexRpc } from "./rpc.ts";

const historySchema = z.object({
  thread: z.object({
    id: z.string(),
    cwd: z.string(),
    turns: z.array(
      z.object({
        id: z.string().min(1),
        status: z.string(),
        items: z.array(z.unknown()),
      }),
    ),
  }),
});
const reportSchema = z.object({
  type: z.literal("agentMessage"),
  phase: z.literal("final_answer"),
  text: z.string().refine((text) => text.trim().length > 0),
});
const agentMessageSchema = z.object({ type: z.literal("agentMessage") });
const unavailable = (explanation: string): SessionResult => ({
  kind: "unavailable",
  explanation,
});

export const readCodexResult: NonNullable<LaunchHost["readResult"]> = async (
  session,
  signal,
) => {
  const continuation = session.continuation;
  if (session.host !== "codex" || continuation === undefined)
    return unavailable("The saved Codex result connection is unavailable.");
  let rpc: CodexRpc | undefined;
  try {
    rpc = new CodexRpc(
      continuation.endpoint,
      AbortSignal.any([signal, AbortSignal.timeout(9_000)]),
    );
    await rpc.initialize();
    const { thread } = historySchema.parse(
      await rpc.request("thread/read", {
        threadId: session.sessionId,
        includeTurns: true,
      }),
    );
    if (
      thread.id !== session.sessionId ||
      thread.cwd !== continuation.workspace
    )
      return unavailable(
        "The native result does not match this saved conversation and workspace.",
      );
    const latest = thread.turns.at(-1);
    if (latest?.status !== "completed")
      return unavailable(
        "The latest Codex turn has no completed final report.",
      );
    const final = reportSchema.safeParse(
      latest.items.findLast(
        (item) => agentMessageSchema.safeParse(item).success,
      ),
    ).data;
    return final === undefined
      ? unavailable("Codex did not provide a recognized final report.")
      : { kind: "available", turnId: latest.id, text: final.text };
  } catch {
    return unavailable(
      "The retained Codex result could not be read. The saved conversation is still kept; retry to read it again.",
    );
  } finally {
    rpc?.close();
  }
};
