// The dashboard server's feedback maintenance check
// (../server/feedbackMaintenanceCheck.ts): with the standing authorization on
// and Open Dough's published watch list due, one unattached session starts in
// Open Dough's folder with the cycle's invocation and the reporting context,
// listed as "Feedback maintenance", and nothing is notified; restarts, later
// checks, an ended or deleted session, and an open one start nothing more for
// that due date. The cycle's own completion report settles it as any ad hoc
// session's does. Not due, off, no block, a failed read, or a developer's
// open session with the same invocation start nothing. Real start, launch,
// installed reporting command, store and gh path; Claude, GitHub and the
// notification sender are fakes. Checks run every 100 ms; "nothing more" is
// asserted only after the server has asked GitHub, or listed the sessions,
// again, never after a sleep.

import path from "node:path";
import type { Page } from "@playwright/test";
import {
  attempts,
  deleteRecord,
  launch,
  openDoughFolder,
  markDone,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  emptyBacklog,
  noConnection,
  publishMovingOrigin,
  type MovingOrigin,
} from "./publishedOrigin.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { FakeGitHub } from "./support/fakeGitHub.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { diagnosticsUrl } from "./support/readDiagnostics.ts";
import { reportingThrough } from "./support/reportedLaunch.ts";
import { afterFurtherListings, messages } from "./support/sessionAlerts.ts";
import { startOrigin, type StartOrigin } from "./support/startOrigin.ts";
import { feedbackWatchListPath as watchList } from "../src/feedbackReview.ts";
import {
  authorizeFeedbackMaintenance,
  dayFromToday,
  dueWatchList,
  withdrawFeedbackMaintenance,
} from "./support/feedbackMaintenanceDue.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";

const invocation = "/maintain-feedback-cycle";

const watchListDue = (reviewAfter: string) =>
  dueWatchList(reviewAfter, dayFromToday(-7));

let revisions = 0;
// Pushes Open Dough's main with this watch list, or none.
function pushWatchList(moving: MovingOrigin, text?: string): string {
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

function turnOn(origin: StartOrigin): void {
  authorizeFeedbackMaintenance(machineHome(origin), {
    host: "claude",
    model: "opus",
  });
}

function turnOff(origin: StartOrigin): void {
  withdrawFeedbackMaintenance(machineHome(origin));
}

function serverOn(
  origin: StartOrigin,
  github: FakeGitHub,
  mode: "boundary" | "preview" = "boundary",
  port?: number,
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
    maintenanceCheckMs: 100,
  });
}

// How often the server has resolved Open Dough's main.
const refReads = (moving: MovingOrigin) =>
  moving.requests.filter(({ request }) => request.kind === "ref").length;

// Waits until the server has checked GitHub twice more.
async function afterFurtherChecks(moving: MovingOrigin): Promise<void> {
  const before = refReads(moving);
  await expect.poll(() => refReads(moving)).toBeGreaterThanOrEqual(before + 2);
}

// The watch list reads the server asked for, by revision.
const watchListReads = (moving: MovingOrigin) =>
  moving.requests.flatMap(({ request }) =>
    request.kind === "content" && request.path === watchList
      ? [request.revision]
      : [],
  );

async function maintenanceRecords(
  server: DashboardServer,
): Promise<LaunchRecord[]> {
  return (await recordsOf(server, "open-dough")) as LaunchRecord[];
}

// The one automatic launch's first input, once it is made.
async function launchedInput(server: DashboardServer): Promise<string> {
  await expect.poll(() => server.claudeLaunchCalls().length).toBe(1);
  await expect
    .poll(async () => (await maintenanceRecords(server)).length)
    .toBe(1);
  return server.claudeLaunchCalls()[0]?.argv.at(-1) ?? "";
}

async function sessionsSidebar(page: Page, server: DashboardServer) {
  await page.goto(server.baseURL);
  const { button, entry } = sidebarParts(page);
  await button.click();
  return entry;
}

test("a reached due date starts one Feedback maintenance session in Open Dough's folder, unnotified; restarts and later checks start none, and a quiet report marks it done until an advanced date ends the due state", async ({
  page,
  github,
}) => {
  test.setTimeout(180_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const yesterday = dayFromToday(-1);
  const first = pushWatchList(moving, watchListDue(yesterday));
  let server = await serverOn(origin, github, "preview");
  try {
    server.claudeScenario("launched");
    turnOn(origin);
    const input = await launchedInput(server);
    const [call] = server.claudeLaunchCalls();
    expect(call?.cwd).toBe(openDoughFolder(server));
    expect(input.split("\n\n")[0]).toBe(invocation);
    expect(input).toContain("Dashboard reporting context:");
    expect(input).toMatch(/^- reporting command: .+$/m);
    const [record] = await maintenanceRecords(server);
    expect(record?.request).toMatchObject({
      workflow: "ad-hoc",
      host: "claude",
      model: "opus",
      instruction: invocation,
      title: "Feedback maintenance",
      maintenance: { due: yesterday },
    });
    expect(record?.request.policy).toBeUndefined();
    expect(record?.doneAt).toBeUndefined();

    const entry = await sessionsSidebar(page, server);
    await expect(entry("Feedback maintenance")).toBeVisible();
    await expect(entry("Feedback maintenance")).toHaveAttribute(
      "title",
      /Open Dough/,
    );

    // Open: later checks and a restart ask GitHub nothing and start nothing.
    await afterFurtherListings(server);
    // Restarted on its port, as a replaced production dashboard is, so the
    // session's reporting command still reaches it.
    const port = Number(new URL(server.origin).port);
    await server.close();
    server = await serverOn(origin, github, "boundary", port);
    server.claudeScenario("launched");
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    // The fake's call log outlives the restart: still the one launch.
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);

    // The cycle reports quietly: done, unnotified, and its date served.
    await reportingThrough(origin, input)({ message: "" });
    await expect
      .poll(async () => (await maintenanceRecords(server))[0]?.doneAt)
      .toEqual(expect.any(String));
    await afterFurtherChecks(moving);
    await afterFurtherListings(server);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);
    // The served revision's watch list is read once, whatever the checks.
    expect(watchListReads(moving)).toEqual([first]);

    // The cycle advances its due date: read once at the new revision, not due.
    const advanced = pushWatchList(moving, watchListDue(dayFromToday(1)));
    await expect.poll(() => watchListReads(moving)).toEqual([first, advanced]);
    await afterFurtherChecks(moving);
    expect(watchListReads(moving)).toEqual([first, advanced]);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(await maintenanceRecords(server)).toHaveLength(1);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

test("an attention report notifies once and keeps the session open with no second launch; ended and deleted without the date advancing, it is not launched again", async ({
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  pushWatchList(moving, watchListDue(dayFromToday(-1)));
  const server = await serverOn(origin, github);
  try {
    server.claudeScenario("launched");
    turnOn(origin);
    const input = await launchedInput(server);
    const [record] = await maintenanceRecords(server);
    const session = record?.session.sessionId ?? "";

    const report = reportingThrough(origin, input);
    await report({
      message: "Terry Talks has no findings record; one response needs you.",
    });
    await expect.poll(() => server.notifierCalls().length).toBe(1);
    await afterFurtherListings(server);
    expect(server.notifierCalls()).toHaveLength(1);
    expect((await maintenanceRecords(server))[0]?.doneAt).toBeUndefined();
    expect(server.claudeLaunchCalls()).toHaveLength(1);

    // The session ends without the date advancing and its record is deleted:
    // its launch attempt still serves the date, which is not launched again.
    server.claudeSessionBecomes(session, "forgotten");
    const deleted = await deleteRecord(server, {
      source: "open-dough",
      session,
    });
    expect(JSON.parse(deleted.body)).toEqual({ kind: "deleted" });
    expect(await maintenanceRecords(server)).toEqual([]);
    expect(
      (await attempts(server)).map(({ request }) => request),
    ).toContainEqual(
      expect.objectContaining({ maintenance: expect.anything() }),
    );
    await afterFurtherChecks(moving);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
    // The ended session may alert as unavailable, as any session does; the
    // report is still notified once and no start is notified.
    expect(
      messages(server).filter((message) => message !== "Session unavailable"),
    ).toEqual(["Unread report: Completed with attention"]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

test("not yet due, turned off, no due block, or a failed read starts nothing and notifies nothing; the failed read shows in the read diagnostics", async ({
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const server = await serverOn(origin, github);
  try {
    server.claudeScenario("launched");
    // An unrelated open session neither blocks the check nor counts as one.
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
          instruction: "Why is CI slow on main?",
        })
      ).status,
    ).toBe(200);
    turnOn(origin);
    // The ref read fails.
    const failed = moving.answerWith("main", noConnection);
    pushWatchList(moving, watchListDue(dayFromToday(-1)));
    await afterFurtherChecks(moving);
    const diagnostics = await rawRequest({
      url: diagnosticsUrl(server),
      headers: { Origin: server.origin },
    });
    expect(
      (JSON.parse(diagnostics.body) as { failures: { category: string }[] })
        .failures,
    ).toContainEqual(expect.objectContaining({ category: "ref" }));
    failed();

    pushWatchList(moving, watchListDue(dayFromToday(1)));
    await afterFurtherChecks(moving);
    pushWatchList(moving, "# Near-term watch list\n\nNo block yet.\n");
    await afterFurtherChecks(moving);
    pushWatchList(moving);
    await afterFurtherChecks(moving);

    // Off: the due list starts nothing and GitHub is not asked.
    turnOff(origin);
    pushWatchList(moving, watchListDue(dayFromToday(-1)));
    // A check that read the setting before it was removed may still ask.
    await afterFurtherListings(server);
    const asked = refReads(moving);
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    expect(refReads(moving)).toBe(asked);

    expect(server.claudeLaunchCalls()).toHaveLength(1);
    expect(
      (await maintenanceRecords(server)).map(({ request }) => request.title),
    ).toEqual(["Why is CI slow on main?"]);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

test("a developer's open session with the cycle's invocation is the machine's feedback maintenance session: nothing more starts while it is open", async ({
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  pushWatchList(moving, watchListDue(dayFromToday(-1)));
  const server = await serverOn(origin, github);
  try {
    server.claudeScenario("launched");
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
          instruction: invocation,
        })
      ).status,
    ).toBe(200);
    const [manual] = await maintenanceRecords(server);
    expect(manual?.request.title).toBe(invocation);
    turnOn(origin);
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    expect(refReads(moving)).toBe(0);
    expect(server.claudeLaunchCalls()).toHaveLength(1);

    // A page cannot mark its own launch as the automatic one.
    expect(
      (
        await launch(server, {
          source: "open-dough",
          workflow: "ad-hoc",
          host: "claude",
          instruction: invocation,
          maintenance: { due: dayFromToday(-1) },
        })
      ).status,
    ).toBe(400);

    // Once the developer marks it done, the due date is launched once.
    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: manual?.session.sessionId,
        })
      ).status,
    ).toBe(200);
    await expect.poll(() => server.claudeLaunchCalls().length).toBe(2);
    await afterFurtherListings(server);
    expect(server.claudeLaunchCalls()).toHaveLength(2);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
