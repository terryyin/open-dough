// Recovery keeps its visibility, shared waiter, and project boundaries.

import { keepingOrigin } from "../../dashboard/test-support/support/publishedRepository.ts";
import { publishMovingHistory } from "../../dashboard/test-support/publishedMovingOrigin.ts";
import { setPageVisibility } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  expectSettledPage,
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutHistory,
  doughnutRepository,
  doughnutSharedTitle,
} from "../../dashboard/test-support/doughnutProject.ts";
import {
  failedAt,
  limitSaid,
} from "../../dashboard/test-support/limitNotice.ts";
import {
  isContent,
  limiting,
} from "../../dashboard/test-support/limitedReadingJourney.ts";
import {
  filesBesideUnreachable,
  opened as limitedOpened,
  repository,
  titlesBesideUnreachable,
  withheldSeed,
  withheldTitle,
} from "../../dashboard/test-support/limitedReadingRecords.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { httpErrorAnswer } from "../../dashboard/test-support/publishedOrigin.ts";
import {
  inspectDashboardStory,
  refreshHistory,
  titlesOfA,
} from "../../dashboard/test-support/refreshJourney.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { projectTab } from "../../dashboard/test-support/projectChoice.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { preparationFacts } from "../../dashboard/test-support/storyCardFacts.ts";
import {
  expectRecoversAfter,
  mainReads,
  openThenFailCheck,
  transientRecovery,
} from "../../dashboard/test-support/transientRecoveryPage.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");

const rawA = refreshHistory({ filesAtA: {} });

test("a hidden page asks no recovery, retains its due time through hide/reveal, and recovers once when due", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const origin = await publishMovingHistory(page, rawA, "A", afterGitHubStops);
  const { A: revisionA } = origin.revisions;
  const restore = origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  const failed = await failedAt(page);
  await expectRecoversAfter(page, failed, 15);
  expect(mainReads(origin)).toBe(1);

  await test.step("repeated hide/reveal before the due time does not reset the backoff step", async () => {
    await setPageVisibility(page, "hidden");
    await page.clock.runFor(5_000);
    await setPageVisibility(page, "visible");
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    expect(mainReads(origin)).toBe(1);
    await expectRecoversAfter(page, failed, 15);
  });

  await test.step("hidden across the due time, the page asks nothing and keeps the recovery notice", async () => {
    await setPageVisibility(page, "hidden");
    await page.clock.runFor(15_000);
    expect(mainReads(origin)).toBe(1);
    await expect(parts(page).problem).toContainText(transientRecovery);
    await expectRecoversAfter(page, failed, 15);
  });

  await test.step("seen again when due, one recovery is asked and heals without reload", async () => {
    restore();
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await untilPageReadsAnswered(page);
    expect(mainReads(origin)).toBe(2);
    await inspectDashboardStory(page);
    await expectSettledPage(page, titlesOfA);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revisionA),
    );
    await expect(parts(page).problem).toHaveCount(0);
  });
});

test("two pages share a recovery read: one hides while the other finishes; the first recovers once when seen again", async ({
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
  const restore = origin.answerWith("main", httpErrorAnswer(503));
  await page.goto("/");
  await expectProblemAndNoSnapshot(
    page,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    transientRecovery,
  );
  await untilPageReadsAnswered(page);
  const other = await page.context().newPage();
  await other.goto("/");
  await expectProblemAndNoSnapshot(
    other,
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
    transientRecovery,
  );
  await untilPageReadsAnswered(other);
  restore();
  const releaseMain = origin.hold("main");
  await page.clock.runFor(15_250);

  await test.step("both pages' recovery waits reach the held ref", async () => {
    await expect.poll(() => mainReads(origin)).toBeGreaterThanOrEqual(3);
  });

  await test.step("hiding one page leaves the other to finish the shared read", async () => {
    await setPageVisibility(page, "hidden");
    releaseMain();
    await expectSettledPage(other, titlesOfA);
    await expect(parts(other).problem).toHaveCount(0);
    await expect(parts(page).problem).toBeVisible();
  });

  await test.step("the hidden page recovers once when seen again", async () => {
    const before = mainReads(origin);
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await untilPageReadsAnswered(page);
    await expectSettledPage(page, titlesOfA);
    await expect(parts(page).problem).toHaveCount(0);
    expect(mainReads(origin)).toBeGreaterThan(before);
  });
});

test("switching projects clears project-local recovery while a standing login limit remains", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, limitedOpened);
  const published = publishes({
    files: filesBesideUnreachable,
  });
  const answers = limiting(page, published, 2);
  githubFor(page).serve(repository, keepingOrigin(answers.answer, published));
  answers.limit(isContent(withheldSeed));
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  answers.lift();
  await expect(parts(page).problem).toContainText(limitSaid);
  const withheldCard = storyCard(parts(page).backlog, withheldTitle);
  await expect(preparationFacts(withheldCard)).toContainText(
    `GitHub's rate limit withheld ${withheldSeed} at ${published.revision}.`,
  );
  await publishMovingHistory(
    page,
    doughnutHistory,
    "published",
    afterGitHubStops,
    doughnutRepository,
  );
  const beforeSwitch = githubFor(page).calls.length;

  await projectTab(page, "Doughnut").check();
  await expect(parts(page).problem).toContainText(limitSaid);
  await expect(projectTab(page, "Doughnut")).toBeChecked();
  // Login-wide limit: Doughnut is not asked of GitHub while it stands.
  expect(
    githubFor(page)
      .calls.slice(beforeSwitch)
      .filter(({ request }) => {
        if (request.kind === "unknown") return false;
        return request.repository === doughnutRepository;
      }),
  ).toEqual([]);
});

test("an ordinary transient failure does not hold back another project's reads", async ({
  page,
  afterGitHubStops,
}) => {
  await pausePageClockAt(page, opened);
  const openDough = await publishMovingHistory(
    page,
    rawA,
    "A",
    afterGitHubStops,
  );
  const doughnut = await publishMovingHistory(
    page,
    doughnutHistory,
    "published",
    afterGitHubStops,
    doughnutRepository,
  );
  await openThenFailCheck(
    page,
    openDough,
    titlesOfA,
    httpErrorAnswer(503),
    "GitHub answered HTTP 503 to the local GitHub CLI while reading main of terryyin/open-dough.",
  );

  await projectTab(page, "Doughnut").check();
  await expectSettledPage(page, {
    taken: [],
    backlog: [doughnutSharedTitle],
  });
  await expect(parts(page).problem).toHaveCount(0);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(doughnut.revisions.published),
  );
});
