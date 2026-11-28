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
  noteColdOpens,
  openThenFailCheck,
  originUnreachable,
  transientRecovery,
} from "../../dashboard/test-support/transientRecoveryPage.ts";
import { restMembershipAsked } from "../../dashboard/test-support/originObservation.ts";
import { unansweredWithinReadWait } from "../../dashboard/src/readWaitBound.ts";
import { holdTrunkTransfer } from "../../dashboard/test-support/heldTrunkTransfer.ts";

const opened = new Date("2026-09-20T08:30:00.000Z");

const rawA = refreshHistory({ filesAtA: {} });

test("a hidden page asks no recovery, retains its due time through hide/reveal, and recovers once when due", async ({
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
  const failed = await failedAt(page);
  await expectRecoversAfter(page, failed, 15);
  expect(opens).toHaveLength(1);

  await test.step("repeated hide/reveal before the due time does not reset the backoff step", async () => {
    await setPageVisibility(page, "hidden");
    await page.clock.runFor(5_000);
    await setPageVisibility(page, "visible");
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    expect(opens).toHaveLength(1);
    await expectRecoversAfter(page, failed, 15);
  });

  await test.step("hidden across the due time, the page asks nothing and keeps the recovery notice", async () => {
    await setPageVisibility(page, "hidden");
    await page.clock.runFor(15_000);
    expect(opens).toHaveLength(1);
    await expect(parts(page).problem).toContainText(transientRecovery);
    await expectRecoversAfter(page, failed, 15);
  });

  await test.step("seen again when due, one recovery is asked and heals without reload", async () => {
    reconnect();
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await untilPageReadsAnswered(page);
    expect(opens).toHaveLength(2);
    await inspectDashboardStory(page);
    await expectSettledPage(page, titlesOfA);
    await expect(parts(page).readRevision).toContainText(
      shortRevision(revisionA),
    );
    await expect(parts(page).problem).toHaveCount(0);
    expect(restMembershipAsked(origin.requests)).toEqual([]);
  });
});

test("two pages share a recovery read: one hides while the other finishes; the first recovers once when seen again", async ({
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
  const transfer = holdTrunkTransfer(dashboard.home, "terryyin/open-dough");
  const other = await page.context().newPage();
  const opens = [page, other].map((tab) => noteColdOpens(tab, "open-dough"));
  await Promise.all([page.goto("/"), other.goto("/")]);
  await transfer.held;
  // Each page's wait bound starts when it sends its cold open; both must have
  // sent it before page time passes the bound.
  await expect.poll(() => opens.map((asked) => asked.length)).toEqual([1, 1]);
  await page.clock.runFor(30_000);
  for (const tab of [page, other])
    await expectProblemAndNoSnapshot(
      tab,
      unansweredWithinReadWait,
      transientRecovery,
    );
  await page.clock.runFor(15_250);

  await test.step("both pages' recovery waits reach the held transfer", async () => {
    await expect.poll(() => opens.map((asked) => asked.length)).toEqual([2, 2]);
  });

  await test.step("hiding one page leaves the other to finish the shared read", async () => {
    await setPageVisibility(page, "hidden");
    await transfer.release();
    await expectSettledPage(other, titlesOfA);
    await expect(parts(other).problem).toHaveCount(0);
    await expect(parts(page).problem).toBeVisible();
  });

  await test.step("the hidden page recovers once when seen again", async () => {
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await untilPageReadsAnswered(page);
    await expectSettledPage(page, titlesOfA);
    await expect(parts(page).problem).toHaveCount(0);
    expect(opens[0]).toHaveLength(3);
    expect(restMembershipAsked(origin.requests)).toEqual([]);
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
  await openThenFailCheck(page, openDough, titlesOfA);

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
