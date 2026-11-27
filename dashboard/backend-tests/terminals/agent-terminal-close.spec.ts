// The terminal boundary (../../server/agentTerminals.ts) when its server closes:
// the plugin's own `closeServer` hook ends every open attach process with the
// SIGHUP a closed terminal sends. End to end, a closing server's PTYs hang up
// their processes anyway, so the hook is called alone here, on the launch
// boundary mounted on a plain HTTP server that stays listening with the socket
// open. How the page shows a lost connection or an ended terminal is
// ../../../e2e/terminals/agent-terminal-lifetime.spec.ts.
// The synthetic `claude` (../../test-support/fixtures/fake-claude) stands in for the attached
// session; the real one is never reached.

import { expect, test } from "vitest";
import {
  composeSession,
  lastAttachEnded,
  openTerminal,
  shows,
  type Terminal,
} from "../../test-support/agentTerminalBoundary.ts";
import { startClaudeTerminalBoundary } from "../../test-support/claudeTerminalBoundaryHttp.ts";

test("closeServer, called alone with the socket and HTTP server still open, ends the attach process", async () => {
  const { server, closeBoundary, stop } = await startClaudeTerminalBoundary([
    "open-dough",
  ]);
  let terminal: Terminal | undefined;
  try {
    terminal = await openTerminal(server, await composeSession(server));
    expect(await shows(terminal, "attached")).toBe(true);

    await closeBoundary();

    expect(await lastAttachEnded(server)).toBe("SIGHUP");
  } finally {
    terminal?.socket.terminate();
    await stop();
  }
});
