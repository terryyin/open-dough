// One private machine whose development Dashboard a Vitest case starts,
// closes or starts again around a fake Cursor agent, while the machine-local
// runner outlives each Dashboard. The spec removes the machine after each case.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect } from "vitest";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { instruction } from "./cursorRunnerJourney.ts";
import {
  developmentBoundary,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeCursor } from "./fakeCursor.ts";
import {
  instructedCursorRequest,
  keptCursor,
  startCursorDashboard,
} from "./keptCursorTurn.ts";

export type CursorDashboardMachine = {
  readonly cursor: FakeCursor;
  readonly root: string;
  // Starts the development Dashboard around the fake Cursor, again after a
  // close when the case restarts it.
  startDashboard(): Promise<DashboardServer>;
  // Keeps a Dashboard the case started itself, so removal closes it.
  adopt(server: DashboardServer): DashboardServer;
  remove(): Promise<void>;
};

export function cursorDashboardMachine(
  cursor: FakeCursor,
): CursorDashboardMachine {
  const root = mkdtempSync(path.join(tmpdir(), "dough-cursor-machine-"));
  let server: DashboardServer | undefined;
  const adopt = (started: DashboardServer) => {
    server = started;
    return started;
  };
  return {
    cursor,
    root,
    adopt,
    startDashboard: async () =>
      adopt(await startCursorDashboard(developmentBoundary, cursor, root)),
    remove: async () => {
      await server?.close();
      await stopCursorRunner(path.join(root, "home"));
      cursor.cleanup();
      rmSync(root, { recursive: true, force: true });
    },
  };
}

// The client one launched ad hoc Cursor session leaves held on the runner.
export async function launchedCursorClient(
  server: DashboardServer,
  cursor: FakeCursor,
): Promise<{ sessionId: string; pid: number }> {
  const response = await launch(server, instructedCursorRequest(instruction));
  expect(JSON.parse(response.body)).toMatchObject({ kind: "launched" });
  return {
    sessionId: keptCursor(server.home).session.sessionId,
    pid: cursor.attaches()[0]?.pid ?? 0,
  };
}
