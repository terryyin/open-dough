// A returning developer sees evidence from this return, while delivery keeps
// its own stream, pacing and snapshot. GitHub holds are independent evidence.
import { ConnectionMark } from "./connectionMark.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import { passPageMs } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isRevisionStream,
  openStreamingAtA,
  setPageVisibility,
  streamServerEnv,
  untilStreamingAt,
  titlesOfA,
  routeFailingRevisionStreams,
} from "../../dashboard/test-support/revisionStreamJourney.ts";
import { revisionStreamSilenceMs } from "../../dashboard/src/revisionStreamSchedule.ts";
import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { serveDoughnut } from "../../dashboard/test-support/doughnutJourney.ts";
import { doughnutSharedTitle } from "../../dashboard/test-support/doughnutProject.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { expectEarlierSnapshotKept } from "../../dashboard/test-support/transientRecoveryPage.ts";

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: { ...streamServerEnv, DOUGH_REVISION_CHECK_REUSE_MS: "0" },
});

test("focus return keeps the same stream and waits for a new unchanged message", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const opened: string[] = [];
  const checked: string[] = [];
  page.on("request", (request) => {
    if (isRevisionStream(request.url())) opened.push(request.url());
    else if (new URL(request.url()).searchParams.has("since"))
      checked.push(request.url());
  });
  const origin = await openStreamingAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  await mark.capture("green");
  await expect(parts(page).notice).toBeEmpty();
  const held = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  const release = held.release;
  try {
    await held.untilHeld();
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
  dashboard,
  afterGitHubStops,
}) => {
  const origin = await openStreamingAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  await setPageVisibility(page, "hidden");
  const held = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  const release = held.release;
  try {
    const opened = untilStreamingAt(page, origin.revisions.A);
    const established = page.waitForResponse((response) =>
      isRevisionStream(response.url()),
    );
    await setPageVisibility(page, "visible");
    await opened;
    expect((await established).headers()["content-type"]).toContain(
      "text/event-stream",
    );
    await held.untilHeld();
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
  dashboard,
  afterGitHubStops,
}) => {
  await openStreamingAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  const held = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  const release = held.release;
  try {
    await held.untilHeld();
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
  afterGitHubStops,
}) => {
  const stopFailing = await routeFailingRevisionStreams(page);
  await openStreamingAtA(page, afterGitHubStops);
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
  dashboard,
  afterGitHubStops,
}) => {
  await openStreamingAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const retrieved =
    (await parts(page).retrievedAt.getAttribute("datetime")) ?? "";
  const held = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  const release = held.release;
  try {
    await held.untilHeld();
    await mark.returnFocus();
    await mark.shows("awaiting");
    held.fail();
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
  dashboard,
  afterGitHubStops,
}) => {
  await openStreamingAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await mark.shows("connected");
  const heldOld = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  const releaseOld = heldOld.release;
  await heldOld.untilHeld();
  const revision = serveDoughnut(page);
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
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revision),
    );
  } finally {
    releaseOld();
    releaseNext();
  }
});
