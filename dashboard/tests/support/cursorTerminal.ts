// Raw terminal socket for one recorded Cursor session. Binary frames are the
// readiness controls; text frames are the fixture's PTY output.
import { z } from "zod";
import WebSocket from "ws";
import { terminalReadinessSchema } from "../../src/agentTerminal.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { terminalUrl, type Terminal } from "../agentTerminalBoundary.ts";

export type CursorReadiness = z.infer<typeof terminalReadinessSchema>;

export type CursorTerminal = Terminal & {
  controls(): readonly CursorReadiness[];
};

export async function openCursorTerminal(
  server: DashboardServer,
  id: string,
): Promise<CursorTerminal> {
  const url = new URL(terminalUrl(server, "open-dough", id));
  url.searchParams.set("host", "cursor");
  const socket = new WebSocket(url, { origin: server.origin });
  let output = "";
  const controls: CursorReadiness[] = [];
  socket.on("message", (data: Buffer, binary: boolean) => {
    const text = data.toString("utf8");
    if (!binary) {
      output += text;
      return;
    }
    try {
      const parsed = terminalReadinessSchema.safeParse(JSON.parse(text));
      if (parsed.success) controls.push(parsed.data);
    } catch {
      // Not a readiness frame.
    }
  });
  const closed = new Promise<number>((resolve) => socket.on("close", resolve));
  await new Promise<void>((resolve, reject) => {
    socket.once("open", resolve);
    socket.once("error", reject);
  });
  return {
    socket,
    closed,
    output: () => output,
    controls: () => controls,
    send: (message) => {
      socket.send(JSON.stringify(message));
    },
  };
}
