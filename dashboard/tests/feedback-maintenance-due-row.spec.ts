// Where feedback maintenance stands, as the machine's sessions answer carries
// it from the due check's last observation (../src/feedbackMaintenanceState.ts):
// Open Dough's project row says, beside Start session, that it is running
// while a feedback-maintenance session is open, and that it is still due when
// the automatic session served the date without advancing it or the launch
// gates held the launch, with why; the System settings section's status line
// names the due date and the last automatic launch's outcome. A developer's
// Start session with the cycle's invocation runs through the ordinary dialog
// on a served date, and a pushed revision that advances the date clears both.
// Real start, launch, installed reporting command, store and gh path; Claude,
// GitHub and the notification sender are fakes. Checks run every 100 ms,
// except where a quiet report must be shown before the next check.

import { markDone } from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { dayFromToday } from "./support/feedbackMaintenanceDue.ts";
import {
  afterFurtherChecks,
  invocation,
  launchedInput,
  maintenanceRecords,
  pushWatchList,
  serverOn,
  turnOn,
  watchListDue,
  watchListReads,
} from "./support/feedbackMaintenanceServer.ts";
import { reportingThrough } from "./support/reportedLaunch.ts";
import { startOrigin } from "./support/startOrigin.ts";
import {
  row,
  settingsLine,
  openDashboard,
  openSettings,
} from "./feedbackMaintenanceDuePage.ts";

test("the row says running while the automatic session is open and, once it ends without the date advancing, that it is still due; a developer's Start session with the invocation runs, and an advanced date clears both lines", async ({
  page,
  github,
}) => {
  test.setTimeout(180_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const due = dayFromToday(-1);
  const served = pushWatchList(moving, watchListDue(due));
  const server = await serverOn(origin, github, "preview");
  try {
    server.claudeScenario("launched");
    turnOn(origin);
    const input = await launchedInput(server);

    await openDashboard(page, server);
    await expect(row(page)).toHaveText("Feedback maintenance is running");
    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Due since ${due}. Last automatic launch: running (due ${due}).`,
    );

    // The cycle reports quietly without advancing its due date.
    await reportingThrough(origin, input)({ message: "" });
    await expect
      .poll(async () => (await maintenanceRecords(server))[0]?.doneAt)
      .toEqual(expect.any(String));
    await afterFurtherChecks(moving);
    await openDashboard(page, server);
    await expect(row(page)).toHaveText(
      `Feedback maintenance due since ${due}; its automatic session did not complete`,
    );
    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Due since ${due}. Last automatic launch: did not complete (due ${due}).`,
    );

    // The developer starts the cycle by hand through the ordinary dialog.
    await openDashboard(page, server);
    await startSession(page, "Open Dough").click();
    const dialog = startSessionDialog(page, "Open Dough");
    await startSessionField(dialog).fill(invocation);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect.poll(() => server.claudeLaunchCalls().length).toBe(2);
    await expect
      .poll(async () => (await maintenanceRecords(server)).length)
      .toBe(2);
    // The developer's own launch, which serves no due date.
    const manual = (await maintenanceRecords(server)).find(
      ({ request }) =>
        request.workflow === "ad-hoc" && request.maintenance === undefined,
    );
    expect(manual?.request).toMatchObject({
      workflow: "ad-hoc",
      instruction: invocation,
    });
    await openDashboard(page, server);
    await expect(row(page)).toHaveText("Feedback maintenance is running");

    // The manual run is marked done and the cycle's advanced date published.
    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: manual?.session.sessionId,
        })
      ).status,
    ).toBe(200);
    const next = dayFromToday(6);
    const advanced = pushWatchList(moving, watchListDue(next));
    await expect.poll(() => watchListReads(moving)).toEqual([served, advanced]);
    await afterFurtherChecks(moving);
    await openDashboard(page, server);
    await expect(row(page)).toHaveCount(0);
    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Next due ${next}. Last automatic launch: done (due ${due}).`,
    );
    expect(server.claudeLaunchCalls()).toHaveLength(2);
    expect(server.notifierCalls()).toEqual([]);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

test("a cycle that publishes its advanced date and reports quietly is done on the row and in settings before the next check reads the date", async ({
  page,
  github,
}) => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const due = dayFromToday(-1);
  const served = pushWatchList(moving, watchListDue(due));
  // Authorized before the server starts, so its first check launches; the
  // next check comes after the test.
  turnOn(origin);
  const server = await serverOn(
    origin,
    github,
    "preview",
    undefined,
    3_600_000,
  );
  try {
    server.claudeScenario("launched");
    const input = await launchedInput(server);

    pushWatchList(moving, watchListDue(dayFromToday(6)));
    await reportingThrough(origin, input)({ message: "" });
    await expect
      .poll(async () => (await maintenanceRecords(server))[0]?.doneAt)
      .toEqual(expect.any(String));

    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Due since ${due}. Last automatic launch: done (due ${due}).`,
    );
    // The done session's card in Recently done comes from the same sessions
    // answer as the row.
    await openDashboard(page, server);
    await expect(
      page.getByRole("article", {
        name: "Ad hoc session for Feedback maintenance",
      }),
    ).toBeVisible();
    await expect(row(page)).toHaveCount(0);
    expect(watchListReads(moving)).toEqual([served]);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

test("an automatic session that ended unavailable without a done mark is, after a restart, due and incomplete on the row and in settings, and is not launched again", async ({
  page,
  github,
}) => {
  test.setTimeout(180_000);
  const origin = await startOrigin();
  const moving = await publishMovingOrigin(github);
  const due = dayFromToday(-1);
  pushWatchList(moving, watchListDue(due));
  let server = await serverOn(origin, github, "preview");
  try {
    server.claudeScenario("launched");
    turnOn(origin);
    await launchedInput(server);
    const [record] = await maintenanceRecords(server);
    const session = record?.session.sessionId ?? "";

    // The session ends without a report or a done mark, and the dashboard
    // restarts on its port, forgetting what it last read.
    server.claudeSessionBecomes(session, "forgotten");
    const port = Number(new URL(server.origin).port);
    await server.close();
    server = await serverOn(origin, github, "preview", port);
    server.claudeScenario("launched");
    await afterFurtherChecks(moving);

    await openDashboard(page, server);
    await expect(row(page)).toHaveText(
      `Feedback maintenance due since ${due}; its automatic session did not complete`,
    );
    await openSettings(page, server);
    await expect(settingsLine(page)).toHaveText(
      `Due since ${due}. Last automatic launch: did not complete (due ${due}).`,
    );
    expect((await maintenanceRecords(server))[0]?.doneAt).toBeUndefined();
    await afterFurtherChecks(moving);
    expect(server.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    await server.close();
    origin.cleanup();
  }
});

import "./feedbackMaintenanceDueHeldCases.ts";
