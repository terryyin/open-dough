// Passive reads of saved conversations, never native discovery or resume.
import { z } from "zod";
import type { LaunchRecord, SessionState } from "../../../src/agentLaunch.ts";
import type { SessionObservation } from "../../hostLaunch.ts";
import { CodexRpc, NativeRefusal } from "./rpc.ts";

const metadataSchema = z.object({
  thread: z.object({
    id: z.string(),
    status: z.object({
      type: z.string(),
      activeFlags: z.array(z.string()).optional(),
    }),
  }),
});
const turnsSchema = z.object({
  data: z.array(z.object({ id: z.string(), status: z.string() })),
});

async function state(rpc: CodexRpc, threadId: string): Promise<SessionState> {
  let raw: unknown;
  try {
    raw = await rpc.request("thread/read", { threadId, includeTurns: false });
  } catch (error) {
    // Codex 0.159.3 checks durable metadata before this exact missing result.
    // Other refusals, including history errors, do not establish absence.
    if (
      error instanceof NativeRefusal &&
      error.code === -32600 &&
      error.message === `thread not loaded: ${threadId}`
    )
      return { kind: "unavailable" };
    throw error;
  }
  const metadata = metadataSchema.parse(raw);
  if (metadata.thread.id !== threadId) return { kind: "unknown" };
  const status = metadata.thread.status;
  const availability = status.type === "notLoaded" ? "retained" : "loaded";
  const available = (
    activity: Extract<SessionState, { kind: "available" }>["activity"],
    description?: string,
  ): SessionState => ({
    kind: "available",
    availability,
    activity,
    ...(description === undefined ? {} : { description }),
  });
  if (status.type === "systemError") return available("failed");
  if (status.type === "active") {
    const flags = status.activeFlags;
    if (
      flags === undefined ||
      flags.some(
        (flag) => flag !== "waitingOnApproval" && flag !== "waitingOnUserInput",
      )
    )
      return available(
        "unknown",
        "Codex reported an unrecognized active status",
      );
    if (flags.length > 0)
      return {
        kind: "available",
        availability,
        activity: "waiting",
        waitingFor: flags.includes("waitingOnApproval")
          ? "Codex is waiting for approval"
          : "Codex is waiting for your input",
      };
    return available("working");
  }
  if (status.type !== "idle" && status.type !== "notLoaded")
    return available("unknown", `Codex reported native status: ${status.type}`);
  try {
    const latest = turnsSchema.parse(
      await rpc.request("thread/turns/list", {
        threadId,
        limit: 1,
        sortDirection: "desc",
        itemsView: "notLoaded",
      }),
    ).data[0];
    if (latest === undefined) return available("awaiting-instruction");
    switch (latest.status) {
      case "completed":
        return available("review");
      case "interrupted":
        return available("interrupted");
      case "failed":
        return available("failed");
      case "inProgress":
        return available("working");
      default:
        return available(
          "unknown",
          `Codex reported native turn status: ${latest.status}`,
        );
    }
  } catch {
    return available("unknown", "Codex's latest turn could not be read");
  }
}

async function endpointSessions(
  endpoint: string,
  records: readonly LaunchRecord[],
  signal: AbortSignal,
): Promise<readonly SessionObservation[]> {
  let rpc: CodexRpc | undefined;
  try {
    // Settle each endpoint before the common ten-second observation deadline,
    // preserving completed independent endpoints when one never answers.
    rpc = new CodexRpc(
      endpoint,
      AbortSignal.any([signal, AbortSignal.timeout(9_000)]),
    );
    await rpc.initialize();
    const connected = rpc;
    return await Promise.all(
      records.map(async ({ session }) => {
        let sessionState: SessionState;
        try {
          sessionState = await state(connected, session.sessionId);
        } catch {
          sessionState = { kind: "unknown" };
        }
        return { session, sessionState };
      }),
    );
  } catch {
    return records.map(({ session }) => ({
      session,
      sessionState: { kind: "unknown" },
    }));
  } finally {
    rpc?.close();
  }
}

export async function codexSessions(
  records: readonly LaunchRecord[],
  signal: AbortSignal,
): Promise<readonly SessionObservation[]> {
  const endpoints = new Map<string, LaunchRecord[]>();
  const unknown: SessionObservation[] = [];
  for (const record of records) {
    const endpoint = record.session.continuation?.endpoint;
    if (endpoint === undefined)
      unknown.push({
        session: record.session,
        sessionState: { kind: "unknown" },
      });
    else endpoints.set(endpoint, [...(endpoints.get(endpoint) ?? []), record]);
  }
  return [
    ...unknown,
    ...(
      await Promise.all(
        [...endpoints].map(([endpoint, targets]) =>
          endpointSessions(endpoint, targets, signal),
        ),
      )
    ).flat(),
  ];
}
