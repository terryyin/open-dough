// A production dashboard server checking feedback maintenance every 100 ms,
// unless a test asks for a longer period, over Open Dough's moving fake
// origin, with the standing authorization switched in its machine home and the
// GitHub reads it made counted, for the feedback maintenance specs.
import path from "node:path";
import { expect } from "@playwright/test";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { emptyBacklog, type MovingOrigin } from "../publishedOrigin.ts";
import { feedbackWatchListPath as watchList } from "../../src/feedbackReview.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import {
  authorizeFeedbackMaintenance,
  dayFromToday,
  dueWatchList,
  withdrawFeedbackMaintenance,
} from "./feedbackMaintenanceDue.ts";
import type { StartOrigin } from "./startOrigin.ts";

export const invocation = "/maintain-feedback-cycle";

// The watch list reviewed a week ago with its next review due `reviewAfter`.
export const watchListDue = (reviewAfter: string) =>
  dueWatchList(reviewAfter, dayFromToday(-7));

let revisions = 0;
// Pushes Open Dough's main with this watch list, or none.
export function pushWatchList(moving: MovingOrigin, text?: string): string {
  revisions += 1;
  const revision = revisions.toString(16).padStart(40, "a");
  moving.push(
    revision,
    emptyBacklog,
    text === undefined ? {} : { [watchList]: text },
  );
  return revision;
}

const machineHome = (origin: StartOrigin) => path.join(origin.machine, "home");

export function turnOn(origin: StartOrigin): void {
  authorizeFeedbackMaintenance(machineHome(origin), {
    host: "claude",
    model: "opus",
  });
}

export function turnOff(origin: StartOrigin): void {
  withdrawFeedbackMaintenance(machineHome(origin));
}

export function serverOn(
  origin: StartOrigin,
  github: FakeGitHub,
  mode: "boundary" | "preview" = "boundary",
  port?: number,
  maintenanceCheckMs = 100,
): Promise<DashboardServer> {
  return startDashboardServer({
    mode,
    port,
    ...(mode === "preview" ? { prebuilt: builtDashboardDir } : {}),
    machine: origin.machine,
    github,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    alertCheckMs: 100,
    maintenanceCheckMs,
    doneRenameWaitMs: 100,
  });
}

// How often the server has resolved Open Dough's main.
export const refReads = (moving: MovingOrigin) =>
  moving.requests.filter(({ request }) => request.kind === "ref").length;

// Waits until the server has checked GitHub twice more.
export async function afterFurtherChecks(moving: MovingOrigin): Promise<void> {
  const before = refReads(moving);
  await expect.poll(() => refReads(moving)).toBeGreaterThanOrEqual(before + 2);
}

// The watch list reads the server asked for, by revision.
export const watchListReads = (moving: MovingOrigin) =>
  moving.requests.flatMap(({ request }) =>
    request.kind === "content" && request.path === watchList
      ? [request.revision]
      : [],
  );

export async function maintenanceRecords(
  server: DashboardServer,
): Promise<LaunchRecord[]> {
  return (await recordsOf(server, "open-dough")) as LaunchRecord[];
}

// The one automatic launch's first input, once it is made.
export async function launchedInput(server: DashboardServer): Promise<string> {
  await expect.poll(() => server.claudeLaunchCalls().length).toBe(1);
  await expect
    .poll(async () => (await maintenanceRecords(server)).length)
    .toBe(1);
  return server.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
}
