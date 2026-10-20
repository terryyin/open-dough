// Bridges one browser terminal to the Cursor runner that holds its
// client: output and input pass through, and closing the browser leaves
// the kept client held by the runner.
import { WebSocket, type RawData } from "ws";
import { terminalAttachFailedCode } from "../../../src/agentTerminal.ts";
import type { TerminalSession } from "../../agentTerminals.ts";
import { cursorRunnerAttachUrl } from "./runnerAttach.ts";
import { cursorRunnerPort } from "./runnerProcess.ts";

export async function bridgeCursorTerminal(
  browser: WebSocket,
  session: TerminalSession,
  home?: string,
): Promise<void> {
  const fail = () => {
    if (browser.readyState === WebSocket.OPEN) {
      browser.close(
        terminalAttachFailedCode,
        "The Cursor runner could not be reached.",
      );
    }
  };
  const port = await cursorRunnerPort(home);
  if (port === undefined || browser.readyState !== WebSocket.OPEN) {
    fail();
    return;
  }
  const runner = new WebSocket(cursorRunnerAttachUrl(port, session), {
    perMessageDeflate: false,
  });
  const pending: { data: RawData; binary: boolean }[] = [];
  let opened = false;
  browser.on("message", (data, binary) => {
    if (!opened) {
      pending.push({ data, binary });
      return;
    }
    if (runner.readyState === WebSocket.OPEN) runner.send(data, { binary });
  });
  browser.on("close", () => {
    if (runner.readyState === WebSocket.CONNECTING) runner.terminate();
    else if (runner.readyState === WebSocket.OPEN) runner.close();
  });
  runner.on("open", () => {
    opened = true;
    for (const message of pending) {
      runner.send(message.data, { binary: message.binary });
    }
  });
  runner.on("message", (data, binary) => {
    if (browser.readyState === WebSocket.OPEN) browser.send(data, { binary });
  });
  runner.on("close", (code, reason) => {
    if (
      browser.readyState === WebSocket.OPEN ||
      browser.readyState === WebSocket.CLOSING
    ) {
      const usable = code === 1005 || code === 1006 ? 1000 : code;
      try {
        browser.close(usable, reason);
      } catch {
        browser.terminate();
      }
    }
  });
  runner.on("error", () => {
    if (!opened) fail();
  });
}
