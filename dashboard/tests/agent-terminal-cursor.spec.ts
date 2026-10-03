// A recorded Cursor session stays in the Cursor runner when the dashboard
// server restarts, and the new server joins that same client. While that
// client is working, closing or dropping its socket leaves the process
// running, and a new socket joins the same pid. The fixture admits that
// resume and paints the working marker. Closing the server does not hang
// the client up.
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base, expect } from "@playwright/test";
import { launch } from "./agentLaunchBoundary.ts";
import { refusedStatus, terminalUrl } from "./agentTerminalBoundary.ts";
import { waitUntil, type DashboardServer } from "./support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import {
  openCursorTerminal,
  type CursorTerminal,
} from "./support/cursorTerminal.ts";
import {
  admit,
  codexResumeLog,
  keptCursor,
  startCursorDashboard,
  stayedUp,
} from "./support/keptCursorTurn.ts";
import { processRunning } from "./support/processGroup.ts";
import { stopCursorRunner } from "../server/hosts/cursor/runnerClient.ts";

const instruction = "continue this session";

const test = base.extend<{
  cursor: FakeCursor;
  mode: "dev" | "preview";
}>({
  mode: ["preview", { option: true }],
  // eslint-disable-next-line no-empty-pattern
  cursor: async ({}, use) => {
    const cursor = installFakeCursor({ working: true });
    await use(cursor);
    cursor.cleanup();
  },
});

async function join(
  server: DashboardServer,
  cursor: FakeCursor,
  sessionId: string,
  pid: number,
): Promise<CursorTerminal> {
  const sizes = cursor.sizes(pid).length;
  const terminal = await openCursorTerminal(server, sessionId);
  await expect
    .poll(() => terminal.controls())
    .toEqual([{ readiness: "attached" }]);
  await expect.poll(() => terminal.output()).toContain("ctrl+c to stop");
  await expect.poll(() => cursor.sizes(pid).length).toBeGreaterThan(sizes);
  let painted = cursor.sizes(pid).length;
  let quiet = false;
  while (!quiet) {
    const grew = await waitUntil(() => cursor.sizes(pid).length !== painted, {
      timeoutMs: 100,
    });
    quiet = !grew;
    if (grew) painted = cursor.sizes(pid).length;
  }
  expect(cursor.attaches().some((attach) => attach.pid === pid)).toBe(true);
  expect(
    cursor.attaches().filter((attach) => processRunning(attach.pid)),
  ).toEqual([expect.objectContaining({ pid })]);
  expect(processRunning(pid)).toBe(true);
  return terminal;
}

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor embedded terminal (${mode})`, () => {
    test.use({ mode });
    test("a working Cursor client survives detach and a new socket joins it", async ({
      cursor,
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const machine = mkdtempSync(
        path.join(tmpdir(), "dough-cursor-terminal-"),
      );
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
        const recorded = keptCursor(server.home);
        if (recorded.session.host !== "cursor") {
          throw new Error("Missing recorded Cursor session.");
        }
        const sessionId = recorded.session.sessionId;
        const workspace = recorded.session.continuation.workspace;
        expect(recorded.firstInput).toMatchObject({
          state: "confirmed",
          instruction,
        });
        expect(recorded.session.continuation.args).toEqual([
          "cursor-agent",
          "--workspace",
          workspace,
          "--resume",
          sessionId,
        ]);
        expect(cursor.calls().map((call) => call.args)).toEqual([
          ["create-chat"],
        ]);
        expect(cursor.attaches()).toHaveLength(1);
        const client = cursor.attaches()[0];
        expect(client?.args).toEqual([
          "--workspace",
          workspace,
          "--resume",
          sessionId,
        ]);
        expect(cursor.input(client?.pid ?? 0).replace(/\r$/u, "")).toBe(
          recorded.firstInput?.instruction,
        );

        await server.close();
        server = undefined;
        server = await startCursorDashboard(launchMode, cursor, machine);
        const restored = keptCursor(server.home);
        if (restored.session.host !== "cursor") {
          throw new Error("Missing recorded Cursor session.");
        }
        expect(restored.session).toEqual(recorded.session);

        const terminal = await openCursorTerminal(server, sessionId);
        await admit(terminal);
        const attach = cursor.attaches()[0];
        expect(attach).toMatchObject({
          cwd: realpathSync(workspace),
          cols: 80,
          rows: 24,
          sessionId,
          args: ["--workspace", workspace, "--resume", sessionId],
        });
        expect(attach?.executable.endsWith(`${path.sep}cursor-agent`)).toBe(
          true,
        );
        expect(cursor.calls().map((call) => call.args)).toEqual([
          ["create-chat"],
        ]);
        expect(cursor.attaches()).toHaveLength(1);
        expect(server.claudeAttaches()).toEqual([]);
        expect(codexResumeLog(server)).toBe("");
        const pid = attach?.pid ?? 0;

        await test.step("closing the socket leaves the working client running", async () => {
          terminal.socket.close();
          await terminal.closed;
          await stayedUp(cursor, pid);
          expect(keptCursor(server?.home ?? "").session.sessionId).toBe(
            sessionId,
          );
        });

        const joined =
          await test.step("a new socket joins the same pid", async () => {
            const next = await join(
              server as DashboardServer,
              cursor,
              sessionId,
              pid,
            );
            next.send({ input: "kept-turn" });
            await expect.poll(() => cursor.input(pid)).toContain("kept-turn");
            expect(keptCursor(server?.home ?? "").session).toEqual(
              recorded.session,
            );
            return next;
          });

        const alongside =
          await test.step("a second open socket shares that client", async () => {
            const before = joined.output();
            const next = await openCursorTerminal(
              server as DashboardServer,
              sessionId,
            );
            await expect
              .poll(() => next.controls())
              .toEqual([{ readiness: "attached" }]);
            await expect.poll(() => next.output()).toContain("ctrl+c to stop");
            const added = () => joined.output().slice(before.length);
            await expect
              .poll(
                () =>
                  added().includes("ctrl+c to stop") &&
                  next.output() === added(),
              )
              .toBe(true);
            expect(cursor.attaches()).toHaveLength(1);
            expect(cursor.attaches()[0]?.pid).toBe(pid);
            return next;
          });

        const attached = cursor.attaches().length;
        const unknown = new URL(terminalUrl(server, "open-dough", "unknown"));
        unknown.searchParams.set("host", "cursor");
        expect(
          await refusedStatus(unknown.href, { origin: server.origin }),
        ).toBe(404);
        unknown.searchParams.set("session", sessionId);
        expect(
          await refusedStatus(unknown.href, { origin: "http://evil.example" }),
        ).toBe(403);
        expect(cursor.attaches()).toHaveLength(attached);
        expect(server.claudeAttaches()).toEqual([]);
        expect(codexResumeLog(server)).toBe("");

        await test.step("a dropped connection still leaves that client to rejoin", async () => {
          joined.socket.terminate();
          alongside.socket.terminate();
          await joined.closed;
          await alongside.closed;
          await stayedUp(cursor, pid);
          const again = await join(
            server as DashboardServer,
            cursor,
            sessionId,
            pid,
          );
          again.socket.close();
          await again.closed;
          await stayedUp(cursor, pid);
        });

        await test.step("closing the server leaves the kept client running", async () => {
          await server?.close();
          server = undefined;
          await stayedUp(cursor, pid, 500);
        });
      } finally {
        await server?.close();
        await stopCursorRunner(path.join(machine, "home"));
        rmSync(machine, { recursive: true, force: true });
      }
    });
  });
}
