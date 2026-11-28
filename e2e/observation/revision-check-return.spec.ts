// Fallback delivery proves receipt since return through its existing schedule.
// Real holds and captured requests stay outside the connection page object.
import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  checksAskedWhilePassing,
  openSettledAtA,
  passPageMs,
  passTimeUntilAsked,
  passTimeUntilChecked,
  setPageVisibility,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  givePageItsTurns,
  isCheck,
  untilPageRequestsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  isRevisionStream,
  openSecondStreamingAtA,
  openStreamingAtA,
  streamServerEnv,
} from "../../dashboard/test-support/revisionStreamJourney.ts";
import { titlesOfA } from "../../dashboard/test-support/refreshJourney.ts";
import { ConnectionMark } from "./connectionMark.ts";

test("fallback focus waits for an already outstanding response without adding a request", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (isCheck(request.url()) || isRevisionStream(request.url()))
      requests.push(request.url());
  });
  await openSettledAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await mark.shows("awaiting");
  await passTimeUntilChecked(page);
  await mark.shows("connected");
  const transfer = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  try {
    await passTimeUntilAsked(page);
    await transfer.untilHeld();
    const asked = [...requests];
    const retrieved = await parts(page).retrievedAt.getAttribute("datetime");
    await mark.focusSettings();
    await mark.returnFocus();
    await mark.shows("awaiting");
    await passPageMs(page, 1_000);
    await givePageItsTurns(page);
    expect(requests).toEqual(asked);
    transfer.release();
    await mark.shows("connected");
    await mark.keepsFocus();
    await expect(parts(page).retrievedAt).toHaveAttribute(
      "datetime",
      retrieved ?? "",
    );
    expect(requests).toEqual(asked);
    expect(requests.some(isRevisionStream)).toBe(false);
  } finally {
    transfer.release();
  }
});

test("fallback reveal keeps one prompt check and waits for its successful response", async ({
  page,
  afterGitHubStops,
}) => {
  await openSettledAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await passTimeUntilChecked(page);
  await mark.shows("connected");
  await setPageVisibility(page, "hidden");
  expect(await checksAskedWhilePassing(page, 60_000)).toBe(0);
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let asked = 0;
  await page.route(
    (url) => isCheck(url.toString()),
    async (route) => {
      asked += 1;
      await held;
      await route.continue();
    },
  );
  try {
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await expect.poll(() => asked).toBe(1);
    await mark.shows("awaiting");
    await expectMembership(page, titlesOfA);
    release();
    await mark.shows("connected");
    await untilPageRequestsAnswered(page);
    expect(asked).toBe(1);
  } finally {
    release();
  }
});

test("a failed fallback check is red and its ordinary next success restores green", async ({
  page,
  afterGitHubStops,
}) => {
  const origin = await openSettledAtA(page, afterGitHubStops);
  const mark = new ConnectionMark(page);
  await passTimeUntilChecked(page);
  await mark.shows("connected");
  const restore = origin.disconnectGit();
  await mark.returnFocus();
  await mark.shows("awaiting");
  await passTimeUntilChecked(page, 502);
  await mark.shows("disconnected");
  await expect(parts(page).problem).toContainText(
    "Published work could not be read",
  );
  await expectMembership(page, titlesOfA);
  restore();
  await passTimeUntilChecked(page);
  await mark.shows("connected");
  await expect(parts(page).problem).toHaveCount(0);
});

test.describe("stream-slot handover", () => {
  test.use({ preholdRevisionStreamSlots: false, extraEnv: streamServerEnv });
  test("a cancelled fallback answer cannot confirm a page waiting for its new stream", async ({
    page,
    afterGitHubStops,
    dashboard,
  }) => {
    const origin = await openStreamingAtA(page, afterGitHubStops);
    const second = await openSecondStreamingAtA(page, origin.revisions.A);
    const checker = await page.context().newPage();
    let releaseStream = () => {};
    const heldStream = new Promise<void>((resolve) => {
      releaseStream = resolve;
    });
    await checker.route(
      (url) => isRevisionStream(url.toString()),
      async (route) => {
        await heldStream;
        await route.continue();
      },
    );
    try {
      await checker.goto("/");
      await expectSettledPage(checker, titlesOfA);
      const mark = new ConnectionMark(checker);
      await passTimeUntilChecked(checker);
      await mark.shows("connected");
      const transfer = holdLaterTrunkTransfers(
        dashboard.home,
        defaultRepository,
      );
      try {
        const checking = checker.waitForRequest((request) =>
          isCheck(request.url()),
        );
        await passTimeUntilAsked(checker);
        const check = await checking;
        await transfer.untilHeld();
        await mark.returnFocus();
        await mark.shows("awaiting");
        const newStream = checker.waitForRequest((request) =>
          isRevisionStream(request.url()),
        );
        const cancelled = checker.waitForEvent(
          "requestfailed",
          (request) => request === check,
        );
        await setPageVisibility(page, "hidden");
        await Promise.all([newStream, cancelled]);
        const checkUrl = new URL(check.url());
        // A direct boundary request can observe the shared fallback answer
        // arriving after the browser has cancelled its own wait.
        const settled = checker.request.get(checkUrl.toString(), {
          headers: { Origin: checkUrl.origin },
        });
        transfer.release();
        await expect(await settled).toBeOK();
        await givePageItsTurns(checker);
        await mark.shows("awaiting");
        releaseStream();
        await mark.shows("connected");
      } finally {
        transfer.release();
      }
    } finally {
      releaseStream();
      await checker.close();
      await second.close();
    }
  });
});
