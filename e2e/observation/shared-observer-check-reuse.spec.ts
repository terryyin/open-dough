// Staggered Board tabs share a settled Git observation within its reuse
// window. Count the routed origin's operations as each pace observes it.

import { holdLaterTrunkTransfers } from "../../dashboard/test-support/laterTrunkTransfers.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  callsSince,
  checkedAtOnce,
  contentReads,
  openSettledAtA,
  passTimeUntilChecked,
  setPageVisibility,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { untilPageRequestsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { checkReuseMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import {
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";

test.use({ revisionCheckReuseMs: checkReuseMs, observationClock: true });

test("staggered tabs share one Git observation per pace, see a new commit together, and a revealed tab reuses it", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  // Runs the server's clock past the reuse window so the next paced check
  // cannot reuse the observation that just settled (page time and server time
  // diverge under the fake page clock).
  const pastReuseWindow = () => {
    dashboard.advanceObservationClock(checkReuseMs);
  };
  const origin = await openSettledAtA(page, afterGitHubStops);
  const { A: revisionA, B: revisionB } = origin.revisions;
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(defaultRepository),
      "refs/heads/main",
      {
        cwd: dashboard.home,
        env: { HOME: dashboard.home },
        maxBuffer: 4096,
      },
    ),
  ).toBe(revisionA);
  await page.clock.runFor(7_000);
  const other = await page.context().newPage();
  await other.goto("/");
  await expectSettledPage(other, titlesOfA);
  await expect(parts(other).problem).toHaveCount(0);

  const transfers = holdLaterTrunkTransfers(dashboard.home, defaultRepository);
  transfers.release();
  pastReuseWindow();

  await test.step("two quiet paces cost two probes where four checks asked", async () => {
    // Page's first check (~8 s into this quiet span) asks; the other's first
    // (~15 s) reuses that observation.
    await passTimeUntilChecked(page);
    await passTimeUntilChecked(other);
    expect(transfers.held()).toBe(1);
    pastReuseWindow();
    // Page's second check asks again; the other's second reuses it.
    await passTimeUntilChecked(page);
    await passTimeUntilChecked(other);
    expect(transfers.held()).toBe(2);
    await expect(parts(page).problem).toHaveCount(0);
    await expect(parts(other).problem).toHaveCount(0);
    await expectSettledPage(page, titlesOfA);
    await expectSettledPage(other, titlesOfA);
  });

  await test.step("a commit published before the next check appears on both within one pace after one probe and fetch", async () => {
    pastReuseWindow();
    origin.advanceTo("B");
    expect(
      await remoteBranchHead(
        gitHubRepositoryUrl(defaultRepository),
        "refs/heads/main",
        {
          cwd: dashboard.home,
          env: { HOME: dashboard.home },
          maxBuffer: 4096,
        },
      ),
    ).toBe(revisionB);
    const before = githubFor(page).calls.length;
    await passTimeUntilChecked(page);
    await expectSettledPage(page, titlesOfB);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revisionB),
    );
    // The other's next check reuses the observation that found B.
    await passTimeUntilChecked(other);
    await expectSettledPage(other, titlesOfB);
    await expect(parts(other).readRevision).toContainText(
      shortRevision(revisionB),
    );
    await untilPageRequestsAnswered(page);
    await untilPageRequestsAnswered(other);
    await expect(parts(page).problem).toHaveCount(0);
    await expect(parts(other).problem).toHaveCount(0);
    const calls = callsSince(page, before);
    expect(transfers.held()).toBe(4);
    expect(
      contentReads(calls).filter((read) =>
        read.startsWith(".planning/PRODUCT-BACKLOG.md"),
      ),
    ).toEqual([]);
  });

  await test.step("a hidden tab revealed after the other's check settled reuses the observation", async () => {
    await setPageVisibility(other, "hidden");
    pastReuseWindow();
    await passTimeUntilChecked(page);
    expect(transfers.held()).toBe(5);
    await setPageVisibility(other, "visible");
    await checkedAtOnce(other);
    expect(transfers.held()).toBe(5);
    await expectSettledPage(other, titlesOfB);
    await expect(parts(other).readRevision).toContainText(
      shortRevision(revisionB),
    );
    await expect(parts(other).problem).toHaveCount(0);
  });
});
