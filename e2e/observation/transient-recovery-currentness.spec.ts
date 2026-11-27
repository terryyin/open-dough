// Recovery publishes only current observation facts and obeys check/admission
// gates: revision or project replacement abandons obsolete answers; outstanding
// transient recovery excludes checks; a standing rate limit postpones recovery
// demand. Visibility and shared-wait lease:
// ./transient-recovery-lifecycle.spec.ts. The page, local boundary, and `gh`
// are production; only GitHub's answers are supplied. Page time is paused.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { keepingOrigin } from "../../dashboard/test-support/support/publishedRepository.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import {
  checksAskedWhilePassing,
  contentReads,
  headsChecks,
  passTimeUntilChecked,
  setPageVisibility,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { selectSettledDoughnut } from "../../dashboard/test-support/doughnutJourney.ts";
import {
  filesBesideUnreachable,
  opened as limitedOpened,
  plannedTitle,
  repository,
  titlesBesideUnreachable,
  unreachableGap,
  unreachableSeed,
  unreachableTitle,
} from "../../dashboard/test-support/limitedReadingRecords.ts";
import {
  isContent,
  limiting,
} from "../../dashboard/test-support/limitedReadingJourney.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { noConnection } from "../../dashboard/test-support/originAnswers.ts";
import { httpErrorAnswer } from "../../dashboard/test-support/publishedOrigin.ts";
import {
  dashboardStory,
  refreshHistory,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/test-support/refreshJourney.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import {
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import {
  detailRecovery,
  openThenFailCheck,
} from "../../dashboard/test-support/transientRecoveryPage.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");

test("recovery discovering a new revision replaces the snapshot with current facts", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingHistory(
    page,
    refreshHistory(),
    "A",
    afterGitHubStops,
  );
  const { A: revisionA, B: revisionB } = origin.revisions;
  const routedTrunk = () =>
    remoteBranchHead(
      gitHubRepositoryUrl("terryyin/open-dough"),
      "refs/heads/main",
      { cwd: dashboard.home, env: { HOME: dashboard.home }, maxBuffer: 4096 },
    );
  expect(await routedTrunk()).toBe(revisionA);
  const restoreMain = await openThenFailCheck(
    page,
    origin,
    titlesOfA,
    httpErrorAnswer(503),
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
  );
  restoreMain();
  origin.advanceTo("B");
  expect(await routedTrunk()).toBe(revisionB);
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);
  await expectSettledPage(page, titlesOfB);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(revisionB),
  );
  await expect(parts(page).problem).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("as published at A");
});

test("switching projects abandons a late detail answer from the previous observation", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingHistory(
    page,
    refreshHistory(),
    "A",
    afterGitHubStops,
  );
  const releaseDetail = origin.hold(".planning/seeds/SEED-021-progress.md");
  await page.goto("/");
  await expectMembership(page, titlesOfA);
  await expect
    .poll(() =>
      contentReads(githubFor(page).calls).some((read) =>
        read.includes("SEED-021-progress.md"),
      ),
    )
    .toBe(true);
  const card = storyCard(parts(page).backlog, dashboardStory);
  await inspectedDetail(card);
  await expect(card).toContainText("Reading preparation…");

  const shown = await selectSettledDoughnut(page);
  releaseDetail();
  await expect(parts(page).readRevision).toContainText(
    shortRevision(shown.revision),
  );
  await expect(shown.link).toBeFocused();
  await expect(page.locator("body")).not.toContainText(dashboardStory);
  await expect(page.locator("body")).not.toContainText("as published at A");
  await expect(parts(page).notice).toBeEmpty();
});

test("outstanding detail recovery excludes revision checks until it settles", async ({
  page,
}) => {
  await pausePageClockAt(page, limitedOpened);
  let withholdFails = true;
  const published = publishes({ files: filesBesideUnreachable });
  githubFor(page).serve(
    repository,
    keepingOrigin((call) => {
      if (
        withholdFails &&
        call.request.kind === "content" &&
        call.request.path === unreachableSeed
      ) {
        return Promise.resolve(noConnection);
      }
      return published(call);
    }, published),
  );
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  const { backlog, problem, readRevision } = parts(page);
  const unreachableCard = storyCard(backlog, unreachableTitle);
  await expect(unreachableCard).toContainText(unreachableGap);
  await expect(problem).toContainText(detailRecovery);
  await untilPageReadsAnswered(page);
  const askedBeforeChecks = githubFor(page).calls.length;

  await test.step("while transient recovery stands, no revision check is asked before the due recovery", async () => {
    expect(await checksAskedWhilePassing(page, 14_000)).toBe(0);
    expect(headsChecks(githubFor(page).calls.slice(askedBeforeChecks))).toEqual(
      [],
    );
    await expect(readRevision).toContainText(shortRevision(published.revision));
    await expect(storyCard(backlog, plannedTitle)).toBeVisible();
  });

  await test.step("due recovery heals the gap and then checks may resume", async () => {
    withholdFails = false;
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    await expect(unreachableCard).not.toContainText(unreachableGap);
    await expect(problem).toHaveCount(0);
    expect(await checksAskedWhilePassing(page, 16_000)).toBe(1);
  });
});

test("a rate limit during transient recovery postpones recovery demand until the wait ends", async ({
  page,
}) => {
  await pausePageClockAt(page, limitedOpened);
  let withholdFails = true;
  const published = publishes({ files: filesBesideUnreachable });
  const answers = limiting(
    page,
    (call) => {
      if (
        withholdFails &&
        call.request.kind === "content" &&
        call.request.path === unreachableSeed
      ) {
        return Promise.resolve(noConnection);
      }
      return published(call);
    },
    2,
  );
  githubFor(page).serve(repository, keepingOrigin(answers.answer, published));
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  await expect(parts(page).problem).toContainText(detailRecovery);
  await untilPageReadsAnswered(page);

  // Recovery will ask the unanswered seed; GitHub answers it as limited.
  answers.limit(isContent(unreachableSeed));
  withholdFails = false;
  await page.clock.runFor(15_250);
  await expect(parts(page).problem).toContainText("GitHub limited the rate");
  const afterLimit = githubFor(page).calls.length;
  await setPageVisibility(page, "hidden");
  await setPageVisibility(page, "visible");
  expect(await checksAskedWhilePassing(page, 2_500)).toBe(0);
  expect(githubFor(page).calls.slice(afterLimit)).toEqual([]);
});
