// Setup and admission for a working Cursor terminal client. The boundary
// spec drives detach, join, and server shutdown against these helpers.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { shows } from "../agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { waitUntil } from "./waitUntil.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import type { CursorTerminal } from "./cursorTerminal.ts";
import type { RawResponse } from "./rawHttp.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { processRunning } from "./processGroup.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";

// The boundary server a Cursor test starts around its fake `cursor-agent`:
// `{ mode: "boundary" }` in the production environment, or
// `developmentBoundary` (./dashboardServer.ts). No page journey starts its
// server here.
export type CursorServer = {
  readonly mode: "boundary";
  readonly environment?: ProjectEnvironment;
};

export function keptCursor(home: string): LaunchRecord {
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

export function codexResumeLog(server: DashboardServer): string {
  const file = server.codex.env["FAKE_CODEX_CLI_LOG"];
  if (file === undefined) throw new Error("Missing Codex resume log.");
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "";
    throw error;
  }
}

export function enteredInstruction(cursor: FakeCursor, pid: number): string {
  return cursor.input(pid).replace(/\r$/u, "");
}

// One ad hoc Cursor launch whose text is `instruction`.
export function instructedCursorRequest(instruction: string) {
  return {
    source: "open-dough" as const,
    workflow: "ad-hoc" as const,
    host: "cursor" as const,
    instruction,
  };
}

// Starts one dashboard, launches that instructed session, and requires the
// launch to be answered. The body observes the settled launch response.
export async function withInstructedCursor(
  boundary: CursorServer,
  cursor: FakeCursor,
  instruction: string,
  observe: (
    server: DashboardServer,
    launched: RawResponse,
  ) => Promise<void> | void,
  launchTimeoutMs?: number,
): Promise<void> {
  await withCursorLaunch(
    boundary,
    cursor,
    async (server) => {
      const launched = await launch(
        server,
        instructedCursorRequest(instruction),
      );
      expect(launched.status).toBe(200);
      await observe(server, launched);
    },
    launchTimeoutMs,
  );
}

// Starts one dashboard around `cursor` and removes the machine directory
// afterwards. The body sees the running server.
export async function withCursorLaunch(
  boundary: CursorServer,
  cursor: FakeCursor,
  body: (server: DashboardServer) => Promise<void>,
  launchTimeoutMs?: number,
  options?: { readonly alertCheckMs?: number },
): Promise<void> {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-launch-"));
  let server: DashboardServer | undefined;
  try {
    server = await startCursorDashboard(boundary, cursor, machine, {
      ...(launchTimeoutMs === undefined ? {} : { launchTimeoutMs }),
      ...(options?.alertCheckMs === undefined
        ? {}
        : { alertCheckMs: options.alertCheckMs }),
    });
    await body(server);
  } finally {
    await server?.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

export async function startCursorDashboard(
  boundary: CursorServer,
  cursor: FakeCursor,
  machine: string,
  options?: {
    readonly launchTimeoutMs?: number;
    readonly alertCheckMs?: number;
  },
): Promise<DashboardServer> {
  return startDashboardServer({
    ...boundary,
    machine,
    projectFolders: ["open-dough"],
    pathPrefix: [cursor.binDir],
    extraEnv: { ...cursor.env },
    ...(options?.launchTimeoutMs === undefined
      ? {}
      : { launchTimeoutMs: options.launchTimeoutMs }),
    ...(options?.alertCheckMs === undefined
      ? {}
      : { alertCheckMs: options.alertCheckMs }),
  });
}

export async function admit(terminal: CursorTerminal) {
  expect(await shows(terminal, "ctrl+c to stop")).toBe(true);
  expect(terminal.output()).toContain("Add a follow-up");
  expect(terminal.output()).toContain("\x1b[?25h");
  expect(terminal.controls()).toContainEqual({ readiness: "observe" });
  terminal.send({
    cursorVisible: true,
    screen: ["→ Add a follow-up", "ctrl+c to stop"],
  });
  await expect
    .poll(() => terminal.controls())
    .toContainEqual({ readiness: "attached" });
}

// Closing the socket does not hang the client up. A sent SIGHUP would exit
// the fixture within this wait, as cursor-agent does.
export async function stayedUp(
  cursor: FakeCursor,
  pid: number,
  timeoutMs = 300,
) {
  const ended = await waitUntil(
    () => !processRunning(pid) || cursor.signals(pid).includes("SIGHUP"),
    { timeoutMs },
  );
  expect(ended).toBe(false);
  expect(processRunning(pid)).toBe(true);
  expect(cursor.signals(pid)).not.toContain("SIGHUP");
  expect(
    cursor.attaches().filter((attach) => processRunning(attach.pid)),
  ).toEqual([expect.objectContaining({ pid })]);
}
