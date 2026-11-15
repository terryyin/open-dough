// A returning developer sees evidence from this return, while delivery keeps
// its own stream, pacing and snapshot. GitHub holds are independent evidence.
import { ConnectionMark } from "./connectionMark.ts";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  expectMembership,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { passPageMs } from "../../dashboard/tests/autoRefreshJourney.ts";
import {
  isRevisionStream,
  openStreamingAtA,
  setPageVisibility,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
  revisionA,
  titlesOfA,
  routeFailingRevisionStreams,
} from "../../dashboard/tests/revisionStreamJourney.ts";
import { revisionStreamSilenceMs } from "../../dashboard/src/revisionStreamSchedule.ts";
import {
  publishMovingOrigin,
  noConnection,
} from "../../dashboard/tests/publishedOrigin.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  revisionDoughnut,
  doughnutSharedTitle,
} from "../../dashboard/tests/doughnutProject.ts";
import { projectTab } from "../../dashboard/tests/projectChoice.ts";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/tests/transientRecoveryPage.ts";

test.use({ preholdRevisionStreamSlots: false, extraEnv: streamServerEnv });

test("focus return keeps the same stream and waits for a new unchanged message", async ({
  page,
}) => {
  const opened: string[] = [];
  const checked: string[] = [];
  page.on("request", (request) => {
    if (isRevisionStream(request.url())) opened.push(request.url());
    else if (new URL(request.url()).searchParams.has("since"))
      checked.push(request.url());
  });
  const origin = await openStreamingAtA(page);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  await mark.capture("green");
  await expect(parts(page).notice).toBeEmpty();
  const release = origin.hold("main");
  try {
    await untilMatchingRefsSince(page, githubFor(page).calls.length, 1);
    const streamsBefore = [...opened];
    const checksBefore = [...checked];
    const requestsBefore = origin.requests.length;
    const retrieved = await parts(page).retrievedAt.getAttribute("datetime");
    const geometry = await mark.mark().boundingBox();
    const buttons = await page.getByRole("button").count();
    await mark.focusSettings();
    await mark.returnFocus();
    await mark.shows("awaiting");
    await mark.capture("yellow");
    await passPageMs(page, 1_000);
    await mark.returnFocus();
    await mark.shows("awaiting");
    expect(opened).toEqual(streamsBefore);
    expect(checked).toEqual(checksBefore);
    expect(origin.requests.length).toBe(requestsBefore);
    release();
    await mark.shows("connected");
    await mark.keepsFocus();
    await expect(parts(page).notice).toBeEmpty();
    expect(await mark.mark().boundingBox()).toEqual(geometry);
    expect(await page.getByRole("button").count()).toBe(buttons);
    await expect(parts(page).retrievedAt).toHaveAttribute(
      "datetime",
      retrieved ?? "",
    );
    expect(opened).toEqual(streamsBefore);
  } finally {
    release();
  }
});

test("revealing a released stream stays yellow through opening until its first answer", async ({
  page,
}) => {
  const origin = await openStreamingAtA(page);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  await setPageVisibility(page, "hidden");
  const release = origin.hold("main");
  try {
    const beforeReveal = githubFor(page).calls.length;
    const opened = untilStreamingAt(page, revisionA);
    const established = page.waitForResponse((response) =>
      isRevisionStream(response.url()),
    );
    await setPageVisibility(page, "visible");
    await opened;
    expect((await established).headers()["content-type"]).toContain(
      "text/event-stream",
    );
    await untilMatchingRefsSince(page, beforeReveal, 1);
    await mark.shows("awaiting");
    await expect(parts(page).retrievedAt).toHaveAttribute(
      "datetime",
      retrieved,
    );
    await expectMembership(page, titlesOfA);
    release();
    await mark.shows("connected");
  } finally {
    release();
  }
});

test("the existing silence deadline makes the border red and recovery restores green", async ({
  page,
}) => {
  const origin = await openStreamingAtA(page);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  const release = origin.hold("main");
  try {
    await untilMatchingRefsSince(page, githubFor(page).calls.length, 1);
    await passPageMs(page, revisionStreamSilenceMs + 250);
    await mark.shows("disconnected");
    await mark.capture("red");
    await expect(parts(page).problem).toContainText("freshness was lost");
    await expectEarlierSnapshotKept(page, retrieved);
    await mark.returnFocus();
    await mark.shows("awaiting");
    release();
    await passPageMs(page, checkIntervalMs);
    await mark.shows("connected");
  } finally {
    release();
  }
});

test("failed stream transport is red and its paced recovery confirms only on data", async ({
  page,
}) => {
  const stopFailing = await routeFailingRevisionStreams(page);
  await openStreamingAtA(page);
  const mark = new ConnectionMark(page);
  await mark.shows("disconnected");
  await stopFailing();
  await mark.returnFocus();
  await mark.shows("awaiting");
  await passPageMs(page, checkIntervalMs);
  await mark.shows("connected");
});

test("an upstream failure message confirms delivery while keeping its own failure notice", async ({
  page,
}) => {
  const origin = await openStreamingAtA(page);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  origin.answerWith("main", noConnection);
  const release = origin.hold("main");
  try {
    await untilMatchingRefsSince(page, githubFor(page).calls.length, 1);
    await mark.returnFocus();
    await mark.shows("awaiting");
    release();
    await expect(parts(page).problem).toContainText(
      "Published work could not be read",
    );
    await mark.shows("connected");
    await expectEarlierSnapshotKept(page, retrieved);
  } finally {
    release();
  }
});

test("an old project's outstanding answer cannot confirm the newly selected project", async ({
  page,
}) => {
  const origin = await openStreamingAtA(page);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const releaseOld = origin.hold("main");
  await untilMatchingRefsSince(page, githubFor(page).calls.length, 1);
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  let releaseNext = () => {};
  const opening = new Promise<void>((resolve) => {
    releaseNext = resolve;
  });
  await page.route(
    (url) =>
      isRevisionStream(url.toString()) &&
      url.searchParams.get("source") === "doughnut",
    async (route) => {
      await opening;
      await route.continue();
    },
  );
  try {
    await projectTab(page, "Doughnut").check();
    await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
    await mark.shows("awaiting");
    releaseOld();
    await passPageMs(page, 1_000);
    await mark.shows("awaiting");
    releaseNext();
    await mark.shows("connected");
    await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
  } finally {
    releaseOld();
    releaseNext();
  }
});
