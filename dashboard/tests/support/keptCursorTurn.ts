// Setup and admission for a working Cursor terminal client. The boundary
// spec drives detach, join, and server shutdown against these helpers.
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { shows } from "../agentTerminalBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
  type DashboardServerOptions,
} from "./dashboardServer.ts";
import { waitUntil } from "./waitUntil.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import type { CursorTerminal } from "./cursorTerminal.ts";
import type { RawResponse } from "./rawHttp.ts";
import {
  readCursorRunnerSessions,
  stopCursorRunner,
} from "../../server/hosts/cursor/runnerClient.ts";
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

function keptRecordsFile(home: string): string {
  return path.join(home, ".open-dough", "dashboard", "agent-launches.json");
}

export function keptCursor(home: string): LaunchRecord {
  const kept = JSON.parse(
    readFileSync(keptRecordsFile(home), "utf8"),
  ) as Record<string, LaunchRecord[]>;
  const [record] = kept["open-dough"] ?? [];
  if (record?.session.host !== "cursor") {
    throw new Error("Missing recorded Cursor session.");
  }
  return record;
}

// The kept Cursor record's first input state, or undefined before a launch
// keeps one.
export function keptFirstInputState(home: string): string | undefined {
  if (!existsSync(keptRecordsFile(home))) return undefined;
  return keptCursor(home).firstInput?.state;
}

// Waits until the runner holds a Cursor client on its workspace trust prompt.
export async function heldOnWorkspaceTrust(server: DashboardServer) {
  await expect
    .poll(async () => {
      const held = await readCursorRunnerSessions(server.home);
      return (
        held.kind === "running" &&
        held.sessions.some((client) => client.workspaceTrust === true)
      );
    })
    .toBe(true);
}

// Replaces the one kept Cursor record with `change` applied to it.
export function rewriteKeptCursor(
  home: string,
  change: (record: LaunchRecord) => LaunchRecord,
): void {
  const recordsFile = keptRecordsFile(home);
  const kept = JSON.parse(readFileSync(recordsFile, "utf8")) as Record<
    string,
    LaunchRecord[]
  >;
  const [record] = kept["open-dough"] ?? [];
  if (record === undefined) throw new Error("No Cursor session recorded.");
  kept["open-dough"] = [change(record)];
  writeFileSync(recordsFile, JSON.stringify(kept));
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
// With `endWaitAfter`, the launch wait ends only once that observation of the
// running launch holds (`DashboardServer.endLaunchWait`), so the answer is
// the one a launch gives when its wait ends then; otherwise the server's own
// bound applies.
export async function withInstructedCursor(
  boundary: CursorServer,
  cursor: FakeCursor,
  instruction: string,
  observe: (
    server: DashboardServer,
    launched: RawResponse,
  ) => Promise<void> | void,
  endWaitAfter?: (server: DashboardServer) => Promise<void>,
): Promise<void> {
  await withCursorLaunch(
    boundary,
    cursor,
    async (server) => {
      const launching = launch(server, instructedCursorRequest(instruction));
      if (endWaitAfter !== undefined) {
        await endWaitAfter(server);
        await server.endLaunchWait();
      }
      const launched = await launching;
      expect(launched.status).toBe(200);
      await observe(server, launched);
    },
    endWaitAfter === undefined ? {} : { launchWaitEnd: true },
  );
}

// Starts one dashboard around `cursor` and removes the machine directory
// afterwards. The body sees the running server.
export async function withCursorLaunch(
  boundary: CursorServer,
  cursor: FakeCursor,
  body: (server: DashboardServer) => Promise<void>,
  options?: CursorDashboardOptions,
): Promise<void> {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-cursor-launch-"));
  let server: DashboardServer | undefined;
  try {
    server = await startCursorDashboard(boundary, cursor, machine, options);
    await body(server);
  } finally {
    await server?.close();
    await stopCursorRunner(path.join(machine, "home"));
    cursor.cleanup();
    rmSync(machine, { recursive: true, force: true });
  }
}

type CursorDashboardOptions = Pick<
  DashboardServerOptions,
  "launchWaitEnd" | "alertCheckMs" | "sessionsReuseMs"
>;

export async function startCursorDashboard(
  boundary: CursorServer,
  cursor: FakeCursor,
  machine: string,
  options?: CursorDashboardOptions,
): Promise<DashboardServer> {
  return startDashboardServer({
    ...boundary,
    machine,
    projectFolders: ["open-dough"],
    pathPrefix: [cursor.binDir],
    extraEnv: { ...cursor.env },
    ...options,
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
