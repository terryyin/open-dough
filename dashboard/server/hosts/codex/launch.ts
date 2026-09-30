// Codex launches use the native configured defaults. Thread creation supplies
// identity, first-input acceptance supplies confirmation, and neither supplies
// a current session/story state. The common durable writer is always awaited.
import { shellCommand } from "../../../src/sessionCapabilities.ts";
import path from "node:path";
import { z } from "zod";
import {
  launchSubject,
  launchWorkflows,
  type HostSession,
} from "../../../src/agentLaunch.ts";
import type { FirstInput } from "../../../src/launchRecord.ts";
import type { LaunchHost } from "../../launchHosts.ts";
import type { HostLaunch } from "../../hostLaunch.ts";
import { CodexRpc, daemonEndpoint, NativeRefusal } from "./rpc.ts";

const threadSchema = z.object({ thread: z.object({ id: z.string().min(1) }) });
const turnSchema = z.object({ turn: z.object({ id: z.string().min(1) }) });
const connections = new Set<CodexRpc>();

export function closeCodexConnections(): void {
  for (const rpc of connections) rpc.close();
  connections.clear();
}

export const launchCodex: LaunchHost["launch"] = async (
  source,
  request,
  folder,
  signal,
  established,
  record,
): Promise<HostLaunch> => {
  let rpc: CodexRpc | undefined;
  let session: HostSession | undefined;
  let evidence: FirstInput = { state: "awaiting" };
  let submitted = false;
  let persisted = false;
  const retire = () => {
    if (rpc !== undefined) {
      rpc.close();
      connections.delete(rpc);
    }
  };
  try {
    if (record === undefined)
      throw new Error("Durable launch recording is required.");
    const workspace = established?.workspace.path ?? folder.path;
    const endpoint = await daemonEndpoint(signal);
    rpc = new CodexRpc(endpoint, signal);
    connections.add(rpc);
    await rpc.initialize();
    const native = threadSchema.parse(
      await rpc.request("thread/start", { cwd: workspace }),
    );
    rpc.watchThread(native.thread.id);
    session = {
      host: "codex",
      sessionId: native.thread.id,
      name: `${source.label} · ${launchSubject(request).name} · ${request.title}`,
      continuation: {
        workspace,
        endpoint,
        args: [
          "codex",
          "resume",
          "--remote",
          endpoint,
          "--cd",
          workspace,
          native.thread.id,
        ],
      },
    };
    await record(session, evidence);
    persisted = true;
    const own = request.instruction?.trim();
    const spec =
      request.workflow === "ad-hoc"
        ? undefined
        : launchWorkflows[request.workflow];
    const input =
      spec === undefined
        ? [{ type: "text", text: own ?? "" }]
        : [
            {
              type: "text",
              text: [
                [
                  `$${spec.skill}`,
                  "identity" in request ? request.identity : "",
                  ...(request.options ?? []),
                ].join(" "),
                established?.handoff.formatted,
                own,
              ]
                .filter((part) => part !== undefined && part !== "")
                .join("\n\n"),
            },
            {
              type: "skill",
              name: spec.skill,
              path: path.join(
                workspace,
                ".agents",
                "skills",
                spec.skill,
                "SKILL.md",
              ),
            },
          ];
    evidence = {
      state: "uncertain",
      explanation:
        "First-input acceptance has not been acknowledged. Continue this conversation before starting again.",
    };
    await record(session, evidence);
    submitted = true;
    const accepted = turnSchema.parse(
      await rpc.request("turn/start", { threadId: native.thread.id, input }),
    );
    evidence = { state: "confirmed", turnId: accepted.turn.id };
    await record(session, evidence);
    const retainedSession = session;
    const connection = rpc;
    rpc.observe(retire, async () => {
      connections.delete(connection);
      await record(retainedSession, {
        ...evidence,
        explanation:
          "The dashboard's native connection ended. Current activity is unavailable; continue the recorded conversation in Codex.",
      });
    });
    return { kind: "launched", session, sessionState: { kind: "unknown" } };
  } catch (error) {
    retire();
    if (session !== undefined) {
      if (submitted && error instanceof NativeRefusal) {
        evidence = {
          state: "awaiting",
          explanation:
            "Codex explicitly refused the first input. The existing conversation was kept.",
        };
        await record?.(session, evidence).catch(() => {});
      }
      return {
        kind: "uncertain",
        reason: signal.aborted ? "timed-out" : "unconfirmed",
        explanation: `Codex conversation ${session.sessionId} ${persisted ? "is kept for recovery" : "could not be saved in the dashboard; retain its continuation for recovery"}. ${submitted ? "Its first input is not confirmed; do not resend it blindly." : "No first input was submitted."} Continue with \`${shellCommand(session.continuation?.args ?? [])}\`.`,
      };
    }
    if (error instanceof NativeRefusal)
      return {
        kind: "failed",
        reason: "refused",
        explanation:
          "Codex refused to create a conversation. No first input was submitted.",
      };
    const missing = (error as NodeJS.ErrnoException).code === "ENOENT";
    return missing
      ? {
          kind: "failed",
          reason: "not-installed",
          explanation:
            "Codex (`codex`) was not found on this machine. Install and authenticate it, then start again.",
        }
      : {
          kind: "uncertain",
          reason: "unconfirmed",
          explanation:
            "Codex did not provide a trustworthy conversation identity. Check native Codex history before starting again; no second conversation was created automatically.",
        };
  }
};
