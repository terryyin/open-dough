// A kept Cursor client with no socket. The ordinary finished prompt hangs
// that client up, and the next open starts another that takes a follow-up.
// A screen waiting for an answer, or one that matches neither marker, keeps
// the client.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base, expect } from "./support/pageTest.ts";
import { launch } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import {
  openCursorTerminal,
  type CursorTerminal,
} from "./support/cursorTerminal.ts";
import {
  keptCursor,
  startCursorDashboard,
  stayedUp,
} from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "continue this session";

const test = base.extend<{
  mode: "dev" | "preview";
}>({
  mode: ["preview", { option: true }],
});

// Opens one recorded Cursor terminal on a fresh fake cursor. The caller
// chooses the screen that cursor paints. Cleanup hangs the server up and
// removes both temporary directories.
async function withOpenedCursor(
  launchMode: "dev" | "preview",
  cursor: FakeCursor,
  body: (opened: {
    server: DashboardServer;
    sessionId: string;
    terminal: CursorTerminal;
    pid: number;
  }) => Promise<void>,
): Promise<void> {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-terminal-"));
  let server: DashboardServer | undefined;
  try {
    server = await startCursorDashboard(launchMode, cursor, machine);
    const launched = await launch(server, {
      source: "open-dough",
      workflow: "ad-hoc",
      host: "cursor",
      instruction,
    });
    expect(launched.status).toBe(200);
    const sessionId = keptCursor(server.home).session.sessionId;
    const terminal = await openCursorTerminal(server, sessionId);
    await expect.poll(() => cursor.attaches()).toHaveLength(1);
    const pid = cursor.attaches()[0]?.pid ?? 0;
    await body({ server, sessionId, terminal, pid });
  } finally {
    await server?.close();
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

for (const mode of ["dev", "preview"] as const) {
  test.describe(`detached Cursor screen (${mode})`, () => {
    test.use({ mode });

    test("an idle detached Cursor client ends and the next open takes a follow-up", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor();
      await withOpenedCursor(
        launchMode,
        cursor,
        async ({ server, sessionId, terminal, pid }) => {
          await expect
            .poll(() => terminal.output())
            .toContain("→ Add a follow-up");
          expect(terminal.output()).not.toContain("done");
          expect(terminal.output()).not.toContain("ctrl+c to stop");
          expect(terminal.output()).not.toContain("Clarifying Questions");
          terminal.send({
            cursorVisible: true,
            screen: ["→ Add a follow-up"],
          });
          await expect
            .poll(() => terminal.controls())
            .toContainEqual({ readiness: "attached" });

          terminal.socket.close();
          await terminal.closed;
          expect(cursor.signals(pid)).not.toContain("SIGHUP");
          expect(processRunning(pid)).toBe(true);
          await expect.poll(() => cursor.signals(pid)).toContain("SIGHUP");
          await expect.poll(() => processRunning(pid)).toBe(false);

          const next = await openCursorTerminal(server, sessionId);
          await expect
            .poll(() => next.controls())
            .toEqual([{ readiness: "observe" }]);
          await expect.poll(() => next.output()).toContain("→ Add a follow-up");
          expect(cursor.attaches()).toHaveLength(2);
          const nextPid = cursor.attaches()[1]?.pid ?? 0;
          expect(nextPid).not.toBe(pid);
          expect(processRunning(nextPid)).toBe(true);
          next.send({
            cursorVisible: true,
            screen: ["→ Add a follow-up"],
          });
          await expect
            .poll(() => next.controls())
            .toContainEqual({ readiness: "attached" });
          next.send({ input: "follow-up" });
          await expect.poll(() => cursor.input(nextPid)).toContain("follow-up");
        },
      );
    });

    test("a detached Cursor client waiting for an answer stays running", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({ screen: "waiting" });
      await withOpenedCursor(launchMode, cursor, async ({ terminal, pid }) => {
        await expect
          .poll(() => terminal.output())
          .toContain("Clarifying Questions");
        expect(terminal.output()).toContain("Red");
        expect(terminal.output()).toContain("Blue");
        expect(terminal.output()).not.toContain("Add a follow-up");
        expect(terminal.output()).not.toContain("ctrl+c to stop");
        terminal.socket.close();
        await terminal.closed;
        await stayedUp(cursor, pid, 500);
      });
    });

    test("an unrecognized Cursor screen keeps the detached client", async ({
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const cursor = installFakeCursor({ screen: "unrecognized" });
      await withOpenedCursor(launchMode, cursor, async ({ terminal, pid }) => {
        await expect.poll(() => terminal.output()).toContain("Cursor Agent");
        expect(terminal.output()).not.toContain("Add a follow-up");
        expect(terminal.output()).not.toContain("ctrl+c to stop");
        expect(terminal.output()).not.toContain("Clarifying Questions");
        terminal.socket.close();
        await terminal.closed;
        await stayedUp(cursor, pid, 500);
      });
    });
  });
}
