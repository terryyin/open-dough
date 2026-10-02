// A recorded Cursor session, after the dashboard server restarts, attaches
// through the stored continuation. The fixture admits that resume and still
// accepts the same uuid after the terminal client ends.
import { mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base, expect } from "@playwright/test";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { shows, refusedStatus, terminalUrl } from "./agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { installFakeCursor, type FakeCursor } from "./support/fakeCursor.ts";
import {
  openCursorTerminal,
  type CursorTerminal,
} from "./support/cursorTerminal.ts";
import { processRunning } from "./support/processGroup.ts";

const instruction = "continue this session";

const test = base.extend<{
  cursor: FakeCursor;
  mode: "dev" | "preview";
}>({
  mode: ["preview", { option: true }],
  // eslint-disable-next-line no-empty-pattern
  cursor: async ({}, use) => {
    const cursor = installFakeCursor();
    await use(cursor);
    cursor.cleanup();
  },
});

function keptCursor(home: string): LaunchRecord {
  const kept = JSON.parse(
    readFileSync(
      path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
      "utf8",
    ),
  ) as Record<string, LaunchRecord[]>;
  const [record] = kept["open-dough"] ?? [];
  if (record?.session.host !== "cursor") {
    throw new Error("Missing recorded Cursor session.");
  }
  return record;
}

function codexResumeLog(server: DashboardServer): string {
  const file = server.codex.env["FAKE_CODEX_CLI_LOG"];
  if (file === undefined) throw new Error("Missing Codex resume log.");
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw error;
  }
}

async function start(
  mode: "dev" | "preview",
  cursor: FakeCursor,
  machine: string,
): Promise<DashboardServer> {
  return startDashboardServer({
    mode,
    prebuilt: mode === "preview" ? builtDashboardDir : undefined,
    machine,
    projectFolders: ["open-dough"],
    pathPrefix: [cursor.binDir],
    extraEnv: { ...cursor.env },
  });
}

async function admit(terminal: CursorTerminal) {
  expect(await shows(terminal, "Add a follow-up")).toBe(true);
  expect(terminal.output()).toContain("\x1b[?25h");
  expect(terminal.controls()).toContainEqual({ readiness: "observe" });
  terminal.send({ cursorVisible: true, screen: ["→ Add a follow-up"] });
  await expect
    .poll(() => terminal.controls())
    .toContainEqual({ readiness: "attached" });
}

for (const mode of ["dev", "preview"] as const) {
  test.describe(`Cursor embedded terminal (${mode})`, () => {
    test.use({ mode });
    test("a restarted server resumes the stored Cursor uuid and leaves it resumable", async ({
      cursor,
      mode: launchMode,
    }) => {
      test.setTimeout(120_000);
      const machine = mkdtempSync(
        path.join(tmpdir(), "dough-cursor-terminal-"),
      );
      let server: DashboardServer | undefined;
      try {
        server = await start(launchMode, cursor, machine);
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
        expect(cursor.attaches()).toEqual([]);

        await server.close();
        server = undefined;
        server = await start(launchMode, cursor, machine);
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
        expect(cursor.calls().map((call) => call.args.at(-1))).toEqual([
          "create-chat",
          instruction,
        ]);
        expect(server.claudeAttaches()).toEqual([]);
        expect(codexResumeLog(server)).toBe("");

        terminal.socket.close();
        const pid = attach?.pid ?? 0;
        await expect.poll(() => cursor.signals(pid)).toContain("SIGHUP");
        expect(processRunning(pid)).toBe(true);
        expect(keptCursor(server.home).session.sessionId).toBe(sessionId);

        const resumed = await openCursorTerminal(server, sessionId);
        await admit(resumed);
        const again = cursor.attaches()[1];
        expect(again?.args).toEqual([
          "--workspace",
          workspace,
          "--resume",
          sessionId,
        ]);
        expect(again?.pid).not.toBe(pid);
        expect(processRunning(pid)).toBe(true);
        expect(keptCursor(server.home).session).toEqual(recorded.session);

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
        resumed.socket.close();
      } finally {
        await server?.close();
        rmSync(machine, { recursive: true, force: true });
      }
    });
  });
}
