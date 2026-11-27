// An empty dashboard recovers from eligible temporary failures on its own: a
// visible page says when it will read again, waits 15, 30, 60, then 60 seconds
// after settlement, and opens the Board at the verified Git trunk when origin
// answers, never asking REST for membership. The page, local boundary, Git and
// `gh` invocations are the production ones; only origin is supplied. Page time
// is paused. Access and other non-retry cases live in
// ./transient-read-exclusions.spec.ts.

import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  expectWholeSnapshot,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  detailContentPaths,
  noConnection,
} from "../../dashboard/test-support/publishedOrigin.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  inspectDashboardStory,
  refreshHistory,
  titlesOfA,
} from "../../dashboard/test-support/refreshJourney.ts";
import { failedAt } from "../../dashboard/test-support/limitNotice.ts";
import {
  headsChecks,
  passTimeUntilChecked,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  expectRecoversAfter,
  noteColdOpens,
  openThenFailCheck,
  originUnreachable,
  transientRecovery,
} from "../../dashboard/test-support/transientRecoveryPage.ts";
import { holdTrunkTransfer } from "./heldTrunkTransfer.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");

const rawA = refreshHistory({ filesAtA: {} });

test("an empty page's unavailable origin waits 15, then 30, then 60, then 60 seconds after settlement, and a later answer opens the Board without reload", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingHistory(page, rawA, "A", afterGitHubStops);
  const { A: revisionA } = origin.revisions;
  const opens = noteColdOpens(page, "open-dough");
  const reconnect = origin.disconnectGit();
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    originUnreachable(),
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  expect(opens).toHaveLength(1);
  await expectRecoversAfter(page, await failedAt(page), 15);

  await test.step("the second attempt is not asked before 15 seconds", async () => {
    await page.clock.runFor(14_000);
    expect(opens).toHaveLength(1);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(opens).toHaveLength(2);
    await expectProblemAndNoSnapshot(
      page,
      originUnreachable(),
      transientRecovery,
    );
    await expectRecoversAfter(page, await failedAt(page), 30);
  });

  await test.step("the third attempt waits 30 seconds, then 60, then 60", async () => {
    await page.clock.runFor(29_000);
    expect(opens).toHaveLength(2);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(opens).toHaveLength(3);
    await expectRecoversAfter(page, await failedAt(page), 60);

    await page.clock.runFor(59_000);
    expect(opens).toHaveLength(3);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(opens).toHaveLength(4);
    await expectRecoversAfter(page, await failedAt(page), 60);
  });

  await test.step("origin's later answer is read on its own and the Board is shown", async () => {
    reconnect();
    await page.clock.runFor(61_250);
    await untilPageReadsAnswered(page);
    await inspectDashboardStory(page);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [],
    );
    await expect(parts(page).problem).toHaveCount(0);
    expect(restMembershipAsked(origin.requests)).toEqual([]);
  });
});

test("a lost connection is recovered on its own at the next check", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingHistory(page, rawA, "A", afterGitHubStops);
  const { A: revisionA } = origin.revisions;
  const reconnect = await openThenFailCheck(
    page,
    origin,
    titlesOfA,
    noConnection,
    "The local GitHub CLI could not reach GitHub while reading main of terryyin/open-dough.",
  );
  reconnect();
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);
  await expect(parts(page).problem).toHaveCount(0);
  await inspectDashboardStory(page);
  await expectWholeSnapshot(
    page,
    { revision: revisionA, titles: titlesOfA },
    [],
  );
});

test("a stalled read at the wait bound recovers on its own without a reload", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  await page.clock.install({ time: opened });
  const origin = await publishMovingHistory(page, rawA, "A", afterGitHubStops);
  const { A: revisionA } = origin.revisions;
  const transfer = holdTrunkTransfer(dashboard.home, "terryyin/open-dough");
  const opens = noteColdOpens(page, "open-dough");
  await page.goto("/");
  const { problem, status } = parts(page);
  await expect(status).toHaveText("Reading published work…");
  await transfer.held;
  await page.clock.pauseAt(new Date(opened.getTime() + 5_000));

  await test.step("before the bound the read is still awaited", async () => {
    await page.clock.runFor(20_000);
    await expect(status).toHaveText("Reading published work…");
    await expect(problem).toHaveCount(0);
  });

  await test.step("at the bound the wait ends as a read problem that says when it will read again", async () => {
    await page.clock.runFor(10_000);
    await expectProblemAndNoSnapshot(
      page,
      "GitHub did not answer within 30 seconds, so the read was given up.",
      transientRecovery,
    );
  });

  await test.step("the late first answer publishes nothing; the next read is asked after settlement", async () => {
    const failed = await failedAt(page);
    await expectRecoversAfter(page, failed, 15);
    await transfer.release();
    const remaining = failed + 15_000 - (await page.evaluate(() => Date.now()));
    await page.clock.runFor(Math.max(0, remaining - 1_000));
    expect(opens).toHaveLength(1);
    expect(headsChecks(githubFor(page).calls)).toEqual([]);
    await expect(problem).toBeVisible();
  });

  await test.step("the recovery read publishes the first snapshot without a reload", async () => {
    await page.clock.runFor(1_250);
    await inspectDashboardStory(page);
    await expectWholeSnapshot(
      page,
      { revision: revisionA, titles: titlesOfA },
      [],
    );
    await expect(problem).toHaveCount(0);
    expect(opens).toHaveLength(2);
    // Membership is Git's; detail is established absence, not lost.
    expect(restMembershipAsked(origin.requests)).toEqual([]);
    expect(detailContentPaths(githubFor(page).calls).sort()).toEqual(
      [
        `PLAN.md?ref=${revisionA}`,
        `SEED-021-progress.md?ref=${revisionA}`,
        `SEED-008-sync.md?ref=${revisionA}`,
        `open-dough.json?ref=${revisionA}`,
      ].sort(),
    );
  });
});
