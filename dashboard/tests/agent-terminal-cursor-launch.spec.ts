// A Cursor launch prompt still running after the launch wait. Opening the
// terminal writes the notice and drops input; no attach process starts.
// Closing and opening again writes the notice again. After the prompted
// process exits, the open socket attaches through today's readiness path
// and shows the ordinary prompt. That exit does not confirm the first input.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base, expect } from "@playwright/test";
import { launch } from "./agentLaunchBoundary.ts";
import { shows } from "./agentTerminalBoundary.ts";
import { waitUntil, type DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import {
  openCursorTerminal,
  type CursorTerminal,
} from "./support/cursorTerminal.ts";
import { keptCursor, startCursorDashboard } from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "hold this launch";
const notice =
  "Cursor is still working on this session's launch prompt. The terminal opens when it finishes.";

const test = base.extend<{
  cursor: FakeCursor;
  mode: "dev" | "preview";
}>({
  mode: ["preview", { option: true }],
  // eslint-disable-next-line no-empty-pattern
  cursor: async ({}, use) => {
    const cursor = installFakeCursor({ holdPrompt: true });
    await use(cursor);
    cursor.cleanup();
  },
});

async function admitOrdinary(terminal: CursorTerminal): Promise<void> {
  expect(await shows(terminal, "Add a follow-up")).toBe(true);
  expect(terminal.output()).toContain("\x1b[?25h");
  expect(terminal.controls()).toEqual([{ readiness: "observe" }]);
  terminal.send({
    cursorVisible: true,
    screen: ["→ Add a follow-up"],
  });
  await expect
    .poll(() => terminal.controls())
    .toEqual([{ readiness: "observe" }, { readiness: "attached" }]);
}

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor launch turn (${mode})`, () => {
    test.use({ mode });
    test("opening during a running launch turn shows a notice, holds input, then opens", async ({
      cursor,
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-launch-"));
      let server: DashboardServer | undefined;
      try {
        server = await startCursorDashboard(launchMode, cursor, machine, {
          launchTimeoutMs: 1_000,
        });
        const launched = await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "cursor",
          instruction,
        });
        expect(launched.status).toBe(200);
        const recorded = keptCursor(server.home);
        if (recorded.session.host !== "cursor") {
          throw new Error("Missing recorded Cursor session.");
        }
        expect(recorded.firstInput).toMatchObject({
          state: "uncertain",
          instruction,
        });
        const sessionId = recorded.session.sessionId;
        const workspace = recorded.session.continuation.workspace;
        expect(cursor.attaches()).toEqual([]);
        expect(cursor.calls()).toHaveLength(2);
        const held = cursor.heldPrompts();
        expect(held).toHaveLength(1);
        expect(held[0]?.args.at(-1)).toBe(instruction);
        const pid = held[0]?.pid ?? 0;
        expect(processRunning(pid)).toBe(true);

        const terminal = await openCursorTerminal(server, sessionId);
        await expect.poll(() => terminal.output()).toContain(notice);
        expect(terminal.controls()).toEqual([]);
        expect(terminal.output()).not.toContain("Add a follow-up");
        expect(cursor.attaches()).toEqual([]);

        terminal.send({ input: "not-yet" });
        const started = await waitUntil(() => cursor.attaches().length > 0, {
          timeoutMs: 300,
        });
        expect(started).toBe(false);
        expect(cursor.heldInput(pid)).toBe("");
        expect(processRunning(pid)).toBe(true);
        expect(cursor.calls()).toHaveLength(2);

        terminal.socket.close();
        await terminal.closed;
        const again = await openCursorTerminal(server, sessionId);
        await expect.poll(() => again.output()).toContain(notice);
        expect(again.controls()).toEqual([]);
        expect(cursor.attaches()).toEqual([]);
        expect(processRunning(pid)).toBe(true);

        cursor.releasePrompt();
        await admitOrdinary(again);
        expect(cursor.attaches()).toHaveLength(1);
        expect(cursor.attaches()[0]?.args).toEqual([
          "--workspace",
          workspace,
          "--resume",
          sessionId,
        ]);
        expect(terminal.output()).not.toContain("Add a follow-up");
        await expect.poll(() => processRunning(pid)).toBe(false);
        expect(keptCursor(server.home).firstInput).toMatchObject({
          state: "uncertain",
          instruction,
        });
        const attachPid = cursor.attaches()[0]?.pid ?? 0;
        again.send({ input: "follow-up" });
        await expect.poll(() => cursor.input(attachPid)).toContain("follow-up");
        expect(cursor.calls()).toHaveLength(2);
        expect(server.claudeAttaches()).toEqual([]);
      } finally {
        cursor.releasePrompt();
        await server?.close();
        rmSync(machine, { recursive: true, force: true });
      }
    });
  });
}
