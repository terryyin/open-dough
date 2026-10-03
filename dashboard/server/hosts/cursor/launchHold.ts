// One join per chat, opened with the launch, so the page's later terminal
// finds that client still held. Closing the dashboard drops these. The
// page's terminal then keeps that client from the idle rule.
import { homedir } from "node:os";
import { WebSocket } from "ws";
import { sessionKey } from "../../../src/sessionReference.ts";
import type { TerminalSession } from "../../agentTerminals.ts";
import { cursorRunnerPort } from "./runnerProcess.ts";
import {
  cursorRunnerAttachHoldName,
  cursorRunnerAttachHoldValue,
} from "./runnerProtocol.ts";

export function cursorRunnerAttachUrl(
  port: number,
  session: TerminalSession,
  hold = false,
): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const held = hold
    ? `&${cursorRunnerAttachHoldName}=${cursorRunnerAttachHoldValue}`
    : "";
  return `ws://127.0.0.1:${String(port)}/attach?session=${payload}${held}`;
}

const launchHolds = new Map<string, WebSocket>();

function socketLive(ws: WebSocket): boolean {
  return (
    ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING
  );
}

function closeLive(ws: WebSocket): void {
  if (socketLive(ws)) {
    ws.close();
  }
}

export function holdCursorClient(
  session: TerminalSession,
  home = homedir(),
): Promise<void> {
  return openLaunchHold(session, home).catch(() => undefined);
}

async function openLaunchHold(
  session: TerminalSession,
  home: string,
): Promise<void> {
  const port = await cursorRunnerPort(home);
  if (port === undefined) {
    return;
  }
  const key = sessionKey(session.session);
  const current = launchHolds.get(key);
  if (current !== undefined && socketLive(current)) {
    return;
  }
  const ws = new WebSocket(cursorRunnerAttachUrl(port, session, true), {
    perMessageDeflate: false,
  });
  launchHolds.set(key, ws);
  const forget = () => {
    if (launchHolds.get(key) === ws) {
      launchHolds.delete(key);
    }
  };
  ws.on("close", forget);
  await new Promise<void>((resolve) => {
    ws.once("open", () => {
      resolve();
    });
    ws.once("error", () => {
      resolve();
    });
    ws.once("close", () => {
      resolve();
    });
  });
}

// The page's terminal has joined. This launch's hold is no longer what
// keeps the client from the idle rule.
export function releaseCursorHold(session: TerminalSession["session"]): void {
  const key = sessionKey(session);
  const ws = launchHolds.get(key);
  if (ws === undefined) {
    return;
  }
  launchHolds.delete(key);
  closeLive(ws);
}

export function closeCursorHolds(): void {
  for (const ws of launchHolds.values()) {
    closeLive(ws);
  }
  launchHolds.clear();
}
