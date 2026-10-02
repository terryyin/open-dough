// Inbound terminal JSON and the outbound control frames shared by a live
// client and the attachment registry.
import type { RawData, WebSocket } from "ws";
import {
  terminalAttachFailedCode,
  terminalEndedCode,
  terminalMessageSchema,
  terminalWorkspaceUnavailableCode,
  type TerminalMessage,
} from "../src/agentTerminal.ts";
import type { UnavailableWorkspace } from "./launchHosts.ts";

export function terminalMessage(
  data: RawData,
  isBinary: boolean,
): TerminalMessage | undefined {
  if (isBinary) {
    return undefined;
  }
  try {
    const parsed = terminalMessageSchema.safeParse(
      JSON.parse((data as Buffer).toString("utf8")),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export function refuseWorkspace(
  ws: WebSocket,
  workspaceUnavailable: UnavailableWorkspace,
): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ workspaceUnavailable }), { binary: true });
    ws.close(terminalWorkspaceUnavailableCode, "Saved workspace unavailable.");
  }
}

// The process is gone. A client that never became ready may instead report
// the workspace limitation observed for this host.
export function closeClientSocket(
  ws: WebSocket,
  ready: boolean,
  hostName: string,
  workspace: UnavailableWorkspace | undefined,
): void {
  if (workspace !== undefined) {
    refuseWorkspace(ws, workspace);
    return;
  }
  ws.close(
    ready ? terminalEndedCode : terminalAttachFailedCode,
    ready ? "The terminal ended." : `${hostName} could not be attached.`,
  );
}

export function sendControl(
  ws: WebSocket,
  message: { readonly readiness: "observe" | "attached" },
): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(message), { binary: true });
  }
}
