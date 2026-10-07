// Recovery publishes only current observation facts and obeys check/admission
// gates: revision or project replacement abandons obsolete answers; outstanding
// transient recovery excludes checks; a standing rate limit postpones recovery
// demand. Visibility and shared-wait lease:
// ./transient-recovery-lifecycle.spec.ts. The page, local boundary, and `gh`
// are production; only GitHub's answers are supplied. Page time is paused.

import {
  checksAskedWhilePassing,
  contentReads,
  headsChecks,
  recordsAt,
  setPageVisibility,
} from "./autoRefreshJourney.ts";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectMembership,
  expectProblemAndNoSnapshot,
  expectSettledPage,
  parts,
} from "./dashboardPage.ts";
import { selectSettledDoughnut } from "./doughnutJourney.ts";
import { revisionDoughnut } from "./doughnutProject.ts";
import {
  filesBesideUnreachable,
  opened as limitedOpened,
  plannedTitle,
  repository,
  revision,
  titlesBesideUnreachable,
  unreachableGap,
  unreachableSeed,
  unreachableTitle,
} from "./limitedReadingRecords.ts";
import { isContent, limiting } from "./limitedReadingJourney.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import { noConnection } from "./originAnswers.ts";
import { httpErrorAnswer, publishMovingOrigin } from "./publishedOrigin.ts";
import {
  backlogA,
  backlogB,
  dashboardStory,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";
import { publishes } from "./support/fakeGitHub.ts";
import { transientRecovery } from "./transientRecoveryPage.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");
const detailRecovery = "this page reads it";

test("recovery discovering a new revision replaces the snapshot with current facts", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  const restoreMain = origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    undefined,
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  restoreMain();
  origin.push(revisionB, backlogB, recordsAt("B"));
  await page.clock.runFor(15_250);
  await untilPageReadsAnswered(page);
  await expectSettledPage(page, titlesOfB);
  await expect(parts(page).source).toContainText(revisionB);
  await expect(parts(page).problem).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("as published at A");
});

test("switching projects abandons a late detail answer from the previous observation", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
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
  const card = parts(page).backlog.getByRole("article", {
    name: dashboardStory,
  });
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(card).toContainText("Reading preparation…");

  const shown = await selectSettledDoughnut(page);
  releaseDetail();
  await expect(parts(page).source).toContainText(revisionDoughnut);
  await expect(shown.link).toBeFocused();
  await expect(page.locator("body")).not.toContainText(dashboardStory);
  await expect(page.locator("body")).not.toContainText("as published at A");
  await expect(parts(page).notice).toBeEmpty();
});

test("outstanding detail recovery excludes revision checks until it settles", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await pausePageClockAt(page, limitedOpened);
  let withholdFails = true;
  const published = publishes({ revision, files: filesBesideUnreachable });
  githubFor(page).serve(repository, (call) => {
    if (
      withholdFails &&
      call.request.kind === "content" &&
      call.request.path === unreachableSeed
    ) {
      return Promise.resolve(noConnection);
    }
    return published(call);
  });
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  const { backlog, problem, source } = parts(page);
  const unreachableCard = backlog.getByRole("article", {
    name: unreachableTitle,
  });
  await expect(unreachableCard).toContainText(unreachableGap);
  await expect(problem).toContainText(detailRecovery);
  await untilPageReadsAnswered(page);
  const askedBeforeChecks = githubFor(page).calls.length;

  await test.step("while transient recovery stands, no revision check is asked before the due recovery", async () => {
    expect(await checksAskedWhilePassing(page, 14_000)).toBe(0);
    expect(headsChecks(githubFor(page).calls.slice(askedBeforeChecks))).toEqual(
      [],
    );
    await expect(source).toContainText(revision);
    await expect(
      backlog.getByRole("article", { name: plannedTitle }),
    ).toBeVisible();
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
  test.setTimeout(60_000);
  await pausePageClockAt(page, limitedOpened);
  let withholdFails = true;
  const published = publishes({ revision, files: filesBesideUnreachable });
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
  githubFor(page).serve(repository, answers.answer);
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
