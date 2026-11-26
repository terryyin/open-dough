// A production dashboard server checking feedback maintenance every 100 ms,
// unless a test asks for a longer period, over Open Dough's moving fake
// origin, with the standing authorization turned on in its machine home and the
// GitHub reads it made counted, for the feedback maintenance specs.
import path from "node:path";
import { expect } from "@playwright/test";
import { recordsOf } from "../agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { defaultRepository, type MovingOrigin } from "../publishedOrigin.ts";
import { feedbackWatchListPath as watchList } from "../../src/feedbackReview.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeGitHub } from "./fakeGitHub.ts";
import { launchWaitMs } from "./launchWait.ts";
import {
  authorizeFeedbackMaintenance,
  dayFromToday,
  dueWatchList,
} from "./feedbackMaintenanceDue.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { git } from "./startOriginObservation.ts";

export const invocation = "/maintain-feedback-cycle";

// The watch list reviewed a week ago with its next review due `reviewAfter`.
export const watchListDue = (reviewAfter: string) =>
  dueWatchList(reviewAfter, dayFromToday(-7));

type FeedbackMaintenanceReads = Pick<MovingOrigin, "requests">;

// Git and REST follow the same origin, including story admissions that occur
// between the cycle's watch-list publications.
export async function serveWatchListHistory(
  origin: StartOrigin,
  github: FakeGitHub,
) {
  const trunk = async () =>
    (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(github, {
    repoDir: origin.origin,
    repository: defaultRepository,
    revision: await trunk(),
    follows: true,
  });
  return {
    requests: published.requests,
    async descendantOf(revision: string): Promise<string> {
      const tip = await trunk();
      await origin.originGit("merge-base", "--is-ancestor", revision, tip);
      return tip;
    },
    async publish(text: string): Promise<string> {
      await git(origin.project, "fetch", "--quiet", "origin", "main");
      await git(origin.project, "merge", "--ff-only", "FETCH_HEAD");
      return origin.publishRevision({
        message: "Publish the feedback maintenance watch list",
        files: { [watchList]: text },
      });
    },
  };
}

const machineHome = (origin: StartOrigin) => path.join(origin.machine, "home");

export function turnOn(origin: StartOrigin): void {
  authorizeFeedbackMaintenance(machineHome(origin), {
    host: "claude",
    model: "opus",
  });
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
    ...(mode === "preview" ? { prebuilt: sharedDashboardBuild } : {}),
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
const refReads = (moving: FeedbackMaintenanceReads) =>
  moving.requests.filter(({ request }) => request.kind === "ref").length;

// Waits until the server has checked GitHub twice more.
export async function afterFurtherChecks(
  moving: FeedbackMaintenanceReads,
): Promise<void> {
  const before = refReads(moving);
  await expect.poll(() => refReads(moving)).toBeGreaterThanOrEqual(before + 2);
}

// The watch list reads the server asked for, by revision.
export const watchListReads = (moving: FeedbackMaintenanceReads) =>
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
  await expect
    .poll(() => server.claudeLaunchCalls().length, { timeout: launchWaitMs })
    .toBe(1);
  await expect
    .poll(async () => (await maintenanceRecords(server)).length)
    .toBe(1);
  return server.claudeLaunches()[0]?.instruction ?? "";
}
