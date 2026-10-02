// Setup and admission for a working Cursor terminal client. The boundary
// spec drives detach, join, and server shutdown against these helpers.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect } from "@playwright/test";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { shows } from "../agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import type { CursorTerminal } from "./cursorTerminal.ts";
import { processRunning } from "./processGroup.ts";

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

export async function startCursorDashboard(
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
  expect(cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(pid);
}
