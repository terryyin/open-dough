// Which Claude terminal upgrades attach: real WebSocket upgrades reach
// agentTerminals.ts and terminalAdmission.ts on the launch boundary mounted on
// a plain HTTP server, with fake-claude recording native attach calls.
// Refusals never run claude; a stopped or unreadable listing still attaches.
// A foreign Host on an upgrade reaches localOrigin.ts, which no Vite host check
// precedes here; the dev server's own HMR socket beside this guard is
// ../runtime/serving-modes.spec.ts. Other origin variations:
// agent-launch-refusal.spec.ts and authenticated-read-refusal.spec.ts; this
// suite proves their shared upgrade guard. What an admitted socket passes is
// agent-terminal-boundary.spec.ts.

import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  composeSession,
  lastAttachEnded,
  openTerminal,
  refusedResponse,
  refusedStatus,
  shows,
  terminalUrl,
  withoutProjectFolder,
  type RecordedSession,
  type TerminalServer,
} from "../../test-support/agentTerminalBoundary.ts";
import { startClaudeTerminalBoundary } from "../../test-support/terminalBoundaryHttp.ts";

let stopBoundary: () => Promise<void>;
let server: TerminalServer;
let session: RecordedSession;

function attachCalls() {
  return server.claudeCalls().filter((call) => call.argv[0] === "attach");
}

beforeAll(async () => {
  const started = await startClaudeTerminalBoundary(["open-dough", "pygardon"]);
  server = started.server;
  stopBoundary = started.stop;
  session = await composeSession(server);
});

afterAll(async () => {
  await stopBoundary();
});

describe("a session Claude Code can still open", () => {
  test("attaches to a stopped session Claude Code still lists", async () => {
    const stopped = await composeSession(server);
    server.claudeSessionBecomes(stopped.sessionId, "stopped");
    const terminal = await openTerminal(server, stopped);

    expect(await shows(terminal, `attached ${stopped.shortId}`)).toBe(true);
    terminal.socket.close();
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
  });

  test("attaches while Claude Code's listing cannot be read, as the page's open action allows", async () => {
    server.claudeListingFails(true);
    try {
      const terminal = await openTerminal(server, session);

      expect(await shows(terminal, `attached ${session.shortId}`)).toBe(true);
      terminal.socket.close();
      expect(await lastAttachEnded(server)).toBe("SIGHUP");
    } finally {
      server.claudeListingFails(false);
    }
  });
});

describe("a refused upgrade runs no claude", () => {
  const sameOrigin = () => ({ origin: server.origin });
  test.each([
    {
      upgrade: "from another site",
      status: 403,
      options: () => ({ origin: "http://evil.example" }),
    },
    {
      upgrade: "naming a foreign Host",
      status: 403,
      options: () => ({
        origin: "http://evil.example",
        headers: { Host: "evil.example" },
      }),
    },
    {
      upgrade: "for an unknown project",
      status: 404,
      source: "not-a-real-project",
      options: sameOrigin,
    },
    {
      upgrade: "for a session this dashboard did not launch",
      status: 404,
      sessionId: () => "00000000-0000-4000-8000-000000000000",
      options: sameOrigin,
    },
    {
      upgrade: "naming no session",
      status: 404,
      sessionId: () => undefined,
      options: sameOrigin,
    },
    {
      upgrade: "for another project's session",
      status: 404,
      source: "pygardon",
      options: sameOrigin,
    },
  ])("refuses an upgrade $upgrade", async (refused) => {
    const callsBefore = server.claudeCalls().length;
    const status = await refusedStatus(
      terminalUrl(
        server,
        refused.source ?? "open-dough",
        refused.sessionId === undefined
          ? session.sessionId
          : refused.sessionId(),
      ),
      refused.options(),
    );

    expect(status).toBe(refused.status);
    expect(server.claudeCalls()).toHaveLength(callsBefore);
  });

  test("refuses an upgrade for a session Claude Code no longer lists, without attaching", async () => {
    const forgotten = await composeSession(server);
    server.claudeSessionBecomes(forgotten.sessionId, "forgotten");
    const attachesBefore = attachCalls().length;

    const response = await refusedResponse(
      terminalUrl(server, "open-dough", forgotten.sessionId),
      { origin: server.origin },
    );

    expect(response.status).toBe(410);
    expect(JSON.parse(response.body)).toEqual({
      error: "Claude Code no longer lists this session.",
    });
    expect(attachCalls()).toHaveLength(attachesBefore);
  });

  test("refuses an upgrade whose execution checkout is gone", async () => {
    const elsewhere = await composeSession(server, "pygardon");
    const callsBefore = server.claudeCalls().length;

    const status = await withoutProjectFolder(server, "pygardon", () =>
      refusedStatus(terminalUrl(server, "pygardon", elsewhere.sessionId), {
        origin: server.origin,
      }),
    );

    expect(status).toBe(404);
    expect(server.claudeCalls()).toHaveLength(callsBefore);
  });
});
