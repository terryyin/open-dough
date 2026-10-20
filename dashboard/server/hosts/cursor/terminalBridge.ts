// Bridges one browser terminal to the Cursor runner that holds its
// client: output and input pass through, and closing the browser leaves
// the kept client held by the runner. Attaching to a client the accepting
// runner still holds joins that client on that runner, even a stale one;
// attaching to a session it does not hold is a resume, so it takes the
// new-work path and a current runner is ensured first.
import { homedir } from "node:os";
import { WebSocket, type RawData } from "ws";
import { terminalAttachFailedCode } from "../../../src/agentTerminal.ts";
import { sessionKey } from "../../../src/sessionReference.ts";
import type { TerminalSession } from "../../agentTerminals.ts";
import { cursorRunnerAttachUrl } from "./runnerAttach.ts";
import { readCursorRunnerSessions } from "./runnerClient.ts";
import { currentCursorRunnerPort } from "./runnerCurrent.ts";
import { acceptingCursorRunnerPort } from "./runnerProcess.ts";

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
  // A read that starts nothing decides the split: held clients join the
  // accepting runner untouched, anything else is resumed as new work.
  const read = await readCursorRunnerSessions(home ?? homedir());
  const held =
    read.kind === "running" &&
    read.sessions.some(
      (item) => sessionKey(item.session) === sessionKey(session.session),
    );
  const port = held
    ? await acceptingCursorRunnerPort(home)
    : await currentCursorRunnerPort(home);
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
