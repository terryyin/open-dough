// A journey's first card check after an open waits for the page's
// published-work read to answer or fail (`untilPublishedWorkRead` in
// ../../test-support/pageRequestNotes.ts, through `expectMembership` in ../../test-support/dashboardPage.ts),
// not for an `expect`'s own 5 s. The page and its local authenticated read
// boundary are the usual ones. The open follows a held Git transfer; a
// missing trunk ends it for good.

import { readFileSync } from "node:fs";
import { expect, githubFor, test } from "../../test-support/dashboardTest.ts";
import { test as machineTest } from "../../test-support/support/pageTest.ts";
import { expectMembership, parts } from "../../test-support/dashboardPage.ts";
import {
  givePageItsTurns,
  untilPublishedWorkRead,
} from "../../test-support/pageRequestNotes.ts";
import {
  readsBesideChecks,
  restMembershipReads,
} from "../../test-support/originObservation.ts";
import { commitPublishedOrigin } from "../../test-support/support/publishedOrigin.ts";
import { publishMovingHistory } from "../../test-support/publishedMovingOrigin.ts";
import {
  backlogA,
  dashboardStory,
  refreshHistory,
  titlesOfA,
} from "../../test-support/refreshJourney.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { expectServedHomesReach } from "../../test-support/support/fixtureOriginRoute.ts";
import { defaultRepository } from "../../test-support/publishedOriginBasics.ts";
import { homeReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import {
  bareReview,
  heldUploadPack,
  readUntilClosed,
  signalFifo,
} from "../review/verifiedOriginTrunkCase.ts";

// Longer than an `expect` waits for a card (5 s, Playwright's default, which
// playwright.config.ts leaves alone) and well inside a test's 30 s: how long
// this held Git transfer keeps the open back once the page is open. The time
// is the precondition itself -- a check bounded by 5 s can only be outlasted
// by an answer later than that -- and the test waits on the read, never on it.
const slowAnswerMs = 6_000;

const restMembership = (calls: Parameters<typeof readsBesideChecks>[0]) =>
  restMembershipReads(readsBesideChecks(calls));

test("a membership check right after an open waits for a published-work read slower than an expect's bound", async ({
  page,
  dashboard,
}) => {
  const published = commitPublishedOrigin({
    branch: "main",
    backlog: backlogA,
  });
  const pack = heldUploadPack(
    dashboard.home,
    homeReviewRepository(dashboard.home),
    published.origin,
  );
  const held = readUntilClosed(pack.heldFifo);
  await page.goto("/");
  await expect(held).resolves.toBe("held\n");
  expect(readFileSync(pack.log, "utf8")).toBe("call\ncall\nheld\n");
  const answering = setTimeout(() => {
    void signalFifo(pack.releaseFifo, true);
  }, slowAnswerMs);
  try {
    await expectMembership(page, titlesOfA);
  } finally {
    clearTimeout(answering);
    await signalFifo(pack.releaseFifo, false);
  }
  await expect(parts(page).reading).toHaveCount(0);
  expect(restMembership(githubFor(page).calls)).toEqual([]);
});

test("a published-work read that fails for good ends the wait, and the membership check then fails at once naming the titles", async ({
  page,
  dashboard,
}) => {
  // An absent main is a missing trunk. The page does not read again on its
  // own: it says to reload, and it asks GitHub for no membership.
  const absent = commitPublishedOrigin({ branch: "absent", backlog: null });
  bareReview(homeReviewRepository(dashboard.home), absent.origin);
  const { problem, board } = parts(page);

  await page.goto("/");
  await expect(problem).toContainText(
    `The published trunk is unavailable: origin has no branch for main of ${defaultRepository}.`,
  );
  await expect(problem).toContainText("Reload the page to read again.");
  expect(restMembership(githubFor(page).calls)).toEqual([]);

  // Nothing is on its way and the page reads no more on its own, so the
  // check fails without waiting out an expectation's bound: it is over
  // before an expectation that was started first and can only end at that
  // bound, the board appearing.
  const bound = expect(board)
    .toHaveCount(1)
    .then(
      () => "the bound",
      () => "the bound",
    );
  const failure = expectMembership(page, titlesOfA).then(
    () => undefined,
    (error: unknown) => error,
  );
  expect(
    await Promise.race([failure.then(() => "the membership check"), bound]),
  ).toBe("the membership check");
  const failed = await failure;
  expect(failed).toBeInstanceOf(Error);
  for (const title of [...titlesOfA.taken, ...titlesOfA.backlog]) {
    expect((failed as Error).message).toContain(title);
  }
  await bound;
});

test("a held detail read does not hold a membership check back", async ({
  page,
  github,
  afterGitHubStops,
}) => {
  const origin = await publishMovingHistory(
    page,
    refreshHistory(),
    "A",
    afterGitHubStops,
  );
  expectServedHomesReach(github, defaultRepository, origin.revisions.A);
  const release = origin.hold(".planning/seeds/SEED-021-progress.md");
  try {
    await page.goto("/");
    await expectMembership(page, titlesOfA);
    await expect(
      parts(page).backlog.getByRole("article", { name: dashboardStory }),
    ).toContainText("Reading preparation…");
  } finally {
    release();
  }
});

// A journey that starts its own dashboard server, on the page every dashboard
// spec runs under (../../test-support/support/pageTest.ts), waits the same way.
machineTest(
  "a page of a journey that starts its own dashboard waits for its published-work read too",
  async ({ page }) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: sharedDashboardBuild,
    });
    const published = commitPublishedOrigin({
      branch: "main",
      backlog: backlogA,
    });
    const pack = heldUploadPack(
      server.home,
      homeReviewRepository(server.home),
      published.origin,
    );
    const held = readUntilClosed(pack.heldFifo);
    const { status, board } = parts(page);
    try {
      await page.goto(server.baseURL);
      await expect(held).resolves.toBe("held\n");
      await expect(status).toHaveText("Reading published work…");

      // The wait is seen pending after more page turns, asked for after it,
      // than a wait with nothing to wait for takes to return.
      let returned = false;
      const waited = untilPublishedWorkRead(page).then(() => {
        returned = true;
      });
      for (let asked = 0; asked < 4; asked += 1) {
        await givePageItsTurns(page);
      }
      await expect(status).toHaveText("Reading published work…");
      expect(returned).toBe(false);

      await signalFifo(pack.releaseFifo, true);
      await waited;
      await expect(board.getByRole("article").first()).toBeVisible();
      expect(restMembership(server.github.calls)).toEqual([]);
    } finally {
      await signalFifo(pack.releaseFifo, false);
      await server.close();
    }
  },
);
