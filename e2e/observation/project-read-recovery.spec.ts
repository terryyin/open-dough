// A project's cold open can fail or end at the Board deadline, recover on
// reload, and retain its snapshot on a later failed check.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import {
  shortRevision,
  expectMembership,
  expectProblemAndNoSnapshot,
  openDirection,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import {
  originUnreachable,
  transientRecovery,
} from "../../dashboard/test-support/transientRecoveryPage.ts";
import { unansweredWithinReadWait } from "../../dashboard/src/readWaitBound.ts";
import { holdTrunkTransfer } from "../../dashboard/test-support/heldTrunkTransfer.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { Backlog } from "../../Distribution/tests/support/repositoryTestData.mjs";

const doughnutRepository = "nerds-odd-e/doughnut";
const pygardonRepository = "terryyin/pygardon";
const pygardonUnavailable = originUnreachable(pygardonRepository);

const publishedWith = (backlog: Backlog) =>
  makeMe.aRepository.withRevision("published", { backlog }).please();

const openDoughTitle = "Open Dough's own queued story";
const openDoughPublished = publishedWith({
  queued: [
    makeMe.aBacklogEntry
      .with({
        identity: "SEED-900#queued",
        title: openDoughTitle,
        href: "seeds/SEED-900-open-dough.md#queued",
      })
      .please(),
  ],
});

const doughnutTitle = "Doughnut's own queued story";
const doughnutPublished = publishedWith({
  queued: [
    makeMe.aBacklogEntry
      .with({
        identity: "SEED-901#queued",
        title: doughnutTitle,
        href: "seeds/SEED-901-doughnut.md#queued",
      })
      .please(),
  ],
});

const pygardonTakenTitle = "Pygardon's own taken story";
const pygardonQueuedTitle = "Pygardon's own queued story";
const pygardonDirection =
  "Recover from a failed read without losing project context.";
const pygardonPublished = publishedWith({
  direction: pygardonDirection,
  taken: [
    makeMe.aBacklogEntry
      .with({
        identity: "PYG-200#story",
        title: pygardonTakenTitle,
        href: "slice-plans/200-pygardon-story/PLAN.md",
      })
      .please(),
  ],
  queued: [
    makeMe.aBacklogEntry
      .with({
        identity: "PYG-201#queued",
        title: pygardonQueuedTitle,
        href: "seeds/SEED-200-pygardon.md#queued",
      })
      .please(),
  ],
});

test("an unavailable Pygardon read shows an actionable, project-specific failure while another project remains selectable; restoring origin and reloading reads Pygardon; a later failed check keeps only Pygardon's previous snapshot", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  await publishMovingHistory(
    page,
    openDoughPublished,
    "published",
    afterGitHubStops,
  );
  const doughnut = await publishMovingHistory(
    page,
    doughnutPublished,
    "published",
    afterGitHubStops,
    doughnutRepository,
  );
  const pygardonOrigin = await publishMovingHistory(
    page,
    pygardonPublished,
    "published",
    afterGitHubStops,
    pygardonRepository,
  );
  expect(
    await remoteBranchHead(
      gitHubRepositoryUrl(pygardonRepository),
      "refs/heads/main",
      { cwd: dashboard.home, env: { HOME: dashboard.home }, maxBuffer: 4096 },
    ),
  ).toBe(pygardonOrigin.revisions.published);
  const reconnect = pygardonOrigin.disconnectGit();

  await pausePageClock(page);
  await page.goto("/");
  const { direction, problem, readRevision } = parts(page);
  const pygardon = projectTab(page, "Pygardon");
  await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

  await test.step("selecting Pygardon while its origin is unavailable shows a recoverable failure and no snapshot", async () => {
    await pygardon.check();
    await expectProblemAndNoSnapshot(
      page,
      pygardonUnavailable,
      transientRecovery,
      "Pygardon",
    );
  });

  await test.step("another project remains selectable and fully readable", async () => {
    await projectTab(page, "Doughnut").check();
    await expectMembership(page, { taken: [], backlog: [doughnutTitle] });
    await expect(readRevision).toContainText(
      shortRevision(doughnut.revisions.published),
    );
    await expect(problem).toHaveCount(0);
  });

  await test.step("returning to Pygardon while its origin is still unavailable starts a fresh, still-failing read -- not stale Doughnut data", async () => {
    await pygardon.check();
    await expect(problem).toContainText(pygardonUnavailable);
    await expect(page.locator("body")).not.toContainText(doughnutTitle);
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  await test.step("restoring origin and reloading reads Pygardon's actual published work", async () => {
    reconnect();
    await page.reload();
    await expectMembership(page, {
      taken: [pygardonTakenTitle],
      backlog: [pygardonQueuedTitle],
    });
    await openDirection(page);
    await expect(direction).toContainText(pygardonDirection);
    await expect(readRevision).toContainText(
      shortRevision(pygardonOrigin.revisions.published),
    );
    await expect(problem).toHaveCount(0);
    expect(restMembershipAsked(pygardonOrigin.requests)).toEqual([]);
  });

  await test.step("a later failed check keeps only Pygardon's previous snapshot, with the failure reported alongside it", async () => {
    pygardonOrigin.disconnectGit();
    await passTimeUntilChecked(page, 502);
    await expect(problem).toContainText(
      "The published trunk is unavailable: Git could not read main of terryyin/pygardon from origin.",
    );
    await expect(problem).toContainText(
      "What is shown is the earlier snapshot, retrieved at",
    );
    await expectMembership(page, {
      taken: [pygardonTakenTitle],
      backlog: [pygardonQueuedTitle],
    });
    // Failed check: status names no revision; membership proves Pygardon's snapshot.
    await expect(page.locator("body")).not.toContainText(doughnutTitle);
    await expect(page.locator("body")).not.toContainText(openDoughTitle);
  });
});

test("a held Pygardon transfer ends at the Board deadline as the same recoverable failure as any other cause, and a reload after its release succeeds", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  await publishMovingHistory(
    page,
    openDoughPublished,
    "published",
    afterGitHubStops,
  );
  const pygardonOrigin = await publishMovingHistory(
    page,
    pygardonPublished,
    "published",
    afterGitHubStops,
    pygardonRepository,
  );
  const transfer = holdTrunkTransfer(dashboard.home, pygardonRepository);

  await page.clock.install();
  await page.goto("/");
  const { problem } = parts(page);
  await expectMembership(page, { taken: [], backlog: [openDoughTitle] });

  await projectTab(page, "Pygardon").check();
  await transfer.held;
  await page.clock.runFor(30_000);
  await expectProblemAndNoSnapshot(
    page,
    unansweredWithinReadWait,
    transientRecovery,
    "Pygardon",
  );

  await transfer.release();
  await page.reload();
  await expectMembership(page, {
    taken: [pygardonTakenTitle],
    backlog: [pygardonQueuedTitle],
  });
  await expect(problem).toHaveCount(0);
  expect(restMembershipAsked(pygardonOrigin.requests)).toEqual([]);
});
