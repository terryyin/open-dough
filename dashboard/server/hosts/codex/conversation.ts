// Native connection ownership continues after the HTTP caller detaches.
import type { HostSession, FirstInput } from "../../../src/launchRecord.ts";
import type { LaunchRecording } from "../../launchRecording.ts";
import { CodexRpc } from "./rpc.ts";
const connections = new Set<CodexRpc>();
export function connection(endpoint: string, signal: AbortSignal) {
  const rpc = new CodexRpc(endpoint, signal);
  connections.add(rpc);
  return rpc;
}
export function retire(rpc: CodexRpc | undefined): void {
  if (rpc === undefined) return;
  rpc.close();
  connections.delete(rpc);
}
export function closeCodexConnections(): void {
  for (const rpc of connections) rpc.close();
  connections.clear();
}
export function observe(
  rpc: CodexRpc,
  session: HostSession,
  evidence: FirstInput,
  record: LaunchRecording,
): void {
  rpc.watchThread(session.sessionId);
  rpc.observe(
    () => {
      retire(rpc);
    },
    async () => {
      connections.delete(rpc);
      await record.session(session, {
        ...evidence,
        explanation:
          "The dashboard's native connection ended. Current activity is unavailable; continue the recorded conversation in Codex.",
      });
    },
  );
}
