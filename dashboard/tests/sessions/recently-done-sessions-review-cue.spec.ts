// Shown Recently done rows expose their linked story's outstanding local review.
import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import { linked, openSelectionPage } from "../recentlyDoneSelectionJourney.ts";
import { expectProjectChoice } from "../projectChoice.ts";
import { expectSessionReviewCue } from "../recentlyDoneSessionsSidebarPage.ts";
import {
  cueSession,
  duplicateTitle,
  keepReviewCueProjects,
  localSessionTitle,
  localTitle,
  longSessionTitle,
  showReviewCueSessions,
} from "../recentlyDoneReviewCueJourney.ts";
import {
  adHoc,
  report,
  takenElsewhere,
} from "../recentlyDoneSelectionJourney.ts";
import { isPygardonCatalog } from "../pygardonCatalogReads.ts";
import { untilPageRequestsAnswered } from "../pageRequestNotes.ts";
import {
  doneCard,
  expectReviewed,
  markAsReviewed,
  unreviewStory,
} from "../recentlyDoneReviewState.ts";
import { keepMoreLaunchRecords } from "../support/launchStore.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import { phoneLaunchTouchViewport } from "../touchLaunchPage.ts";
import { showColumn } from "../boardPage.ts";
import { finalReportPanel, finalReportText } from "../finalReportPages.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });

test("an unselected cross-project done-story row exposes its review need while the Board stays put", async ({
  page,
  dashboard,
}) => {
  const { shown } = await openSelectionPage(page, dashboard);
  await expect(shown.reviewCue(linked.title)).toBeVisible();
  await expect(shown.select(linked.title)).toHaveAccessibleDescription(
    /Needs review/,
  );
  await expect(shown.select(linked.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expectProjectChoice(page, "Open Dough");
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("equal identities use their own project's review state; every shown matching row shares successful card changes", async ({
  page,
  dashboard,
}) => {
  // The shown rows' recurring catalog read waits for page time, so only the
  // reads the shown rows lead to are counted.
  await pausePageClockAt(page, new Date());
  await keepReviewCueProjects(page, dashboard);
  let catalogs = 0;
  page.on("request", (request) => {
    if (isPygardonCatalog(new URL(request.url()))) catalogs += 1;
  });
  const shown = await showReviewCueSessions(page);
  await expectSessionReviewCue(shown.row(linked.title), true);
  await expectSessionReviewCue(shown.row(duplicateTitle), true);
  for (const title of [
    localSessionTitle,
    adHoc.title,
    report.title,
    takenElsewhere.title,
  ])
    await expectSessionReviewCue(shown.row(title), false);
  await untilPageRequestsAnswered(page);
  expect(catalogs).toBe(1);
  await expectProjectChoice(page, "Open Dough");
  const card = doneCard(page, localTitle);
  await showColumn(page, "Recently done");
  await expectReviewed(card, true);
  await unreviewStory(card, "Unreview this story?", "mouse");
  await expectSessionReviewCue(shown.row(localSessionTitle), true);
  await expectSessionReviewCue(shown.row(linked.title), true);
  await markAsReviewed(card).click();
  await expectSessionReviewCue(shown.row(localSessionTitle), false);
  await expectSessionReviewCue(shown.row(linked.title), true);
  expect(dashboard.claudeAttaches()).toEqual([]);
});

test("a newly revealed batch resolves the same published story without per-row catalog reads", async ({
  page,
  dashboard,
}) => {
  // The shown rows' recurring catalog read waits for page time, so only the
  // reads the shown batches lead to are counted.
  await pausePageClockAt(page, new Date());
  await keepReviewCueProjects(page, dashboard);
  const older = Array.from(Array(24).keys(), (index) =>
    cueSession(dashboard, `Older review session ${String(index)}`, index + 100),
  );
  keepMoreLaunchRecords(dashboard, older, "pygardon");
  let catalogs = 0;
  page.on("request", (request) => {
    if (isPygardonCatalog(new URL(request.url()))) catalogs += 1;
  });
  const shown = await showReviewCueSessions(page);
  await expect(shown.entries).toHaveCount(20);
  await expect(shown.row("Older review session 23")).toHaveCount(0);
  await shown.revealOlder();
  await expect(shown.entries).toHaveCount(30);
  await expectSessionReviewCue(shown.row("Older review session 23"), true);
  await untilPageRequestsAnswered(page);
  // The second shown batch changes the observation context once, independent
  // of how many matching rows it adds.
  expect(catalogs).toBeLessThanOrEqual(2);
  await expectProjectChoice(page, "Open Dough");
});

test.describe("narrow touch review cue", () => {
  test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });
  test("a long title leaves Needs review and separate Select and Open usable", async ({
    page,
    dashboard,
  }) => {
    await keepReviewCueProjects(page, dashboard);
    keepMoreLaunchRecords(
      dashboard,
      [cueSession(dashboard, longSessionTitle, 0)],
      "pygardon",
    );
    const shown = await showReviewCueSessions(page);
    await expectSessionReviewCue(shown.row(longSessionTitle), true);
    const cue = shown.reviewCue(longSessionTitle);
    const bounds = await box(shown.row(longSessionTitle));
    const warning = await box(cue);
    expect(warning.x).toBeGreaterThanOrEqual(bounds.x);
    expect(warning.x + warning.width).toBeLessThanOrEqual(
      bounds.x + bounds.width,
    );
    for (const control of [
      shown.select(longSessionTitle),
      shown.open(longSessionTitle),
    ])
      expect((await box(control)).height).toBeGreaterThanOrEqual(44);
    await tapWhereShown(shown.select(longSessionTitle));
    await expect(shown.select(longSessionTitle)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expectSessionReviewCue(shown.row(longSessionTitle), true);
    await expect(finalReportPanel(page)).toHaveCount(0);
    await tapWhereShown(shown.open(longSessionTitle));
    await expect(finalReportText(page)).toHaveText(
      `Report for ${longSessionTitle}.`,
    );
  });
});
