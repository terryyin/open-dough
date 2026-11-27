// What an admitted Claude terminal socket passes: real WebSocket upgrades reach
// agentTerminals.ts on the launch boundary mounted on a plain HTTP server, with
// fake-claude recording native attach calls. Same-origin recorded sessions
// pass output, input and size; socket close ends attachment while keeping the
// session (server close: agent-terminal-close.spec.ts; done marks:
// agent-terminal-reopen.spec.ts). Which upgrades attach at all:
// agent-terminal-admission.spec.ts.

import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  openDoughFolder,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  composeSession,
  lastAttachEnded,
  openTerminal,
  shows,
  type RecordedSession,
  type TerminalServer,
} from "../../test-support/agentTerminalBoundary.ts";
import { startClaudeTerminalBoundary } from "../../test-support/claudeTerminalBoundaryHttp.ts";

let stopBoundary: () => Promise<void>;
let server: TerminalServer;
let session: RecordedSession;

function attachCalls() {
  return server.claudeCalls().filter((call) => call.argv[0] === "attach");
}

beforeAll(async () => {
  const started = await startClaudeTerminalBoundary(["open-dough"]);
  server = started.server;
  stopBoundary = started.stop;
  session = await composeSession(server);
});

afterAll(async () => {
  await stopBoundary();
});

test("attaches a same-origin socket to the recorded session and passes output, input, and size", async () => {
  const terminal = await openTerminal(server, session);

  expect(await shows(terminal, `attached ${session.shortId} 80x24`)).toBe(true);
  expect(attachCalls()).toEqual([
    { argv: ["attach", session.shortId], cwd: openDoughFolder(server) },
  ]);

  terminal.send({ input: "hello" });
  terminal.send({ input: "\r" });
  expect(await shows(terminal, "echo hello")).toBe(true);

  terminal.send({ resize: { cols: 120, rows: 40 } });
  expect(await shows(terminal, "resized 120x40")).toBe(true);

  terminal.socket.close();
  expect(await lastAttachEnded(server)).toBe("SIGHUP");
  expect(await recordsOf(server, "open-dough")).toMatchObject([
    {
      session: { sessionId: session.sessionId },
      sessionState: { kind: "available" },
    },
  ]);
  expect(server.claudeLaunchCalls()).toEqual([]);
});

describe("a bad frame closes the socket", () => {
  test.each([
    { message: "plain text", sent: "hello" },
    { message: "a command", sent: { command: "ls" } },
    { message: "input that is not text", sent: { input: 7 } },
    {
      message: "an oversized resize",
      sent: { resize: { cols: 5_000, rows: 40 } },
    },
    { message: "binary data", sent: Buffer.from("hello\r") },
  ])(
    "closes the socket on $message and ends its attach process",
    async ({ sent }) => {
      const terminal = await openTerminal(server, session);
      expect(await shows(terminal, "attached")).toBe(true);

      if (Buffer.isBuffer(sent)) {
        terminal.socket.send(sent, { binary: true });
      } else {
        terminal.send(sent);
      }

      expect(await terminal.closed).toBe(1008);
      expect(await lastAttachEnded(server)).toBe("SIGHUP");
      expect(terminal.output()).not.toContain("echo");
    },
  );
});
