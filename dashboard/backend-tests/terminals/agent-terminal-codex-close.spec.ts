// closeServer alone (not OS process-group shutdown) detaches the native client:
// the launch boundary on a plain HTTP server, with fake-codex serving the
// native protocol, keeps listening while the admitted Codex socket closes.

import { expect, test } from "vitest";
import {
  shows,
  type Terminal,
} from "../../test-support/agentTerminalBoundary.ts";
import { startCodexTerminalBoundary } from "../../test-support/terminalBoundaryHttp.ts";
import {
  observationRecord,
  saveObservations,
} from "../../test-support/support/codexObservation.ts";
import {
  codexAttaches,
  codexEndOnceGone,
  openCodexTerminal,
} from "../../test-support/support/codexTerminal.ts";

test("closeServer closes an admitted Codex socket and its PTY while the HTTP server/native protocol remain alive", async () => {
  const { server, native, closeBoundary, stop } =
    await startCodexTerminalBoundary(["open-dough"]);
  let terminal: Terminal | undefined;
  try {
    saveObservations(server, [
      observationRecord(server, native, native.threadId),
    ]);
    terminal = await openCodexTerminal(server, native.threadId);
    expect(await shows(terminal, "original retained history")).toBe(true);
    const pid = codexAttaches(native)[0]?.pid ?? 0;

    await closeBoundary();

    expect(await terminal.closed).toBe(1006);
    await expect.poll(() => codexEndOnceGone(native, pid)).toBe("SIGHUP");
    expect(await fetch(server.baseURL).then(({ status }) => status)).toBe(404);
    expect(
      native.calls.filter((call) => call.method === "turn/interrupt"),
    ).toHaveLength(0);
    await expect.poll(() => native.sockets.size).toBe(0);
  } finally {
    terminal?.socket.terminate();
    await stop();
  }
});
