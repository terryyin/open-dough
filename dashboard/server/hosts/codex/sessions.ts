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
    unknownReason?: Extract<
      SessionState,
      { kind: "available" }
    >["unknownReason"],
  ): SessionState => ({
    kind: "available",
    availability,
    activity,
    ...(description === undefined ? {} : { description }),
    ...(unknownReason === undefined ? {} : { unknownReason }),
  });
  if (status.type === "systemError") return available("failed");
  if (status.type === "active") {
    const flags = status.activeFlags;
    if (flags === undefined)
      return available(
        "unknown",
        "Codex did not report active status flags",
        "incomplete",
      );
    if (
      flags.some(
        (flag) => flag !== "waitingOnApproval" && flag !== "waitingOnUserInput",
      )
    )
      return available(
        "unknown",
        "Codex reported an unrecognized active status",
        "unrecognized",
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
    return available(
      "unknown",
      `Codex reported native status: ${status.type}`,
      "unrecognized",
    );
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
          "unrecognized",
        );
    }
  } catch {
    return available(
      "unknown",
      "Codex's latest turn could not be read",
      "incomplete",
    );
  }
}

// One endpoint owns a shared observation budget, including overlapping page
// and alert polls. A slot covers metadata and latest-turn history together.
const maxConcurrentReads = 4;
type QueuedRead = {
  signal: AbortSignal;
  read(): Promise<SessionState>;
  resolve(state: SessionState): void;
};
type ReadQueue = { active: number; waiting: QueuedRead[] };
const readQueues = new Map<string, ReadQueue>();

function drainReads(endpoint: string): void {
  const queue = readQueues.get(endpoint);
  if (queue === undefined) return;
  queue.waiting = queue.waiting.filter((job) => {
    if (!job.signal.aborted) return true;
    job.resolve({ kind: "unknown" });
    return false;
  });
  while (queue.active < maxConcurrentReads && queue.waiting.length > 0) {
    const job = queue.waiting.shift();
    if (job === undefined) break;
    queue.active++;
    void job
      .read()
      .then(
        (result) => {
          job.resolve(result);
        },
        () => {
          job.resolve({ kind: "unknown" });
        },
      )
      .finally(() => {
        queue.active--;
        drainReads(endpoint);
      });
  }
  if (queue.active === 0 && queue.waiting.length === 0)
    readQueues.delete(endpoint);
}

async function boundedStates(
  endpoint: string,
  rpc: CodexRpc,
  records: readonly LaunchRecord[],
  signal: AbortSignal,
): Promise<readonly SessionObservation[]> {
  const queue = readQueues.get(endpoint) ?? { active: 0, waiting: [] };
  readQueues.set(endpoint, queue);
  const pending = records.map(
    ({ session }) =>
      new Promise<SessionObservation>((resolve) => {
        queue.waiting.push({
          signal,
          read: () => state(rpc, session.sessionId),
          resolve: (sessionState) => {
            resolve({ session, sessionState });
          },
        });
      }),
  );
  // One abort listener per observation batch, rather than one per saved
  // session. Cancel queued work even while every native slot is occupied.
  const aborted = () => {
    drainReads(endpoint);
  };
  signal.addEventListener("abort", aborted, { once: true });
  drainReads(endpoint);
  try {
    return await Promise.all(pending);
  } finally {
    signal.removeEventListener("abort", aborted);
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
    const deadline = AbortSignal.any([signal, AbortSignal.timeout(9_000)]);
    rpc = new CodexRpc(endpoint, deadline);
    await rpc.initialize();
    return await boundedStates(endpoint, rpc, records, deadline);
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
    const session = record.session;
    const endpoint =
      session.host === "codex" ? session.continuation?.endpoint : undefined;
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
