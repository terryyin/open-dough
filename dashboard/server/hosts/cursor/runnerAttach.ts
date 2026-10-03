// The runner's attach URL for one admitted terminal session. The dashboard
// bridges a page socket here. The runner owns the client.
import type { TerminalSession } from "../../agentTerminals.ts";

export function cursorRunnerAttachUrl(
  port: number,
  session: TerminalSession,
): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `ws://127.0.0.1:${String(port)}/attach?session=${payload}`;
}
