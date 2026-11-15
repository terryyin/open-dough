// Shown Recently done rows expose their linked story's outstanding local review.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { expectProjectChoice } from "../../tests/projectChoice.ts";
import { expectSessionReviewCue } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import {
  adHoc,
  cueSession,
  duplicateTitle,
  linked,
  localSessionTitle,
  localTitle,
  longSessionTitle,
  openFrontendReviewCueSessions,
  report,
  takenElsewhere,
} from "../../tests/support/frontendRecentlyDoneReviewCue.ts";
import { openFrontendSelectionPage } from "../../tests/support/frontendRecentlyDoneSelection.ts";
import { isPygardonCatalog } from "../../tests/pygardonCatalogReads.ts";
import { untilPageRequestsAnswered } from "../../tests/pageRequestNotes.ts";
import {
  doneCard,
  expectReviewed,
  markAsReviewed,
  unreviewStory,
} from "../../tests/recentlyDoneReviewState.ts";
import { box, tapWhereShown } from "../../tests/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../tests/touchLaunchPage.ts";
import { showColumn } from "../../tests/boardPage.ts";
import {
  finalReportPanel,
  finalReportText,
} from "../../tests/finalReportPages.ts";

test("an unselected cross-project done-story row exposes its review need while the Board stays put", async ({
  page,
  frontendServices,
}) => {
  const { shown } = await openFrontendSelectionPage(page, frontendServices);
  await expect(shown.reviewCue(linked.title)).toBeVisible();
  await expect(shown.select(linked.title)).toHaveAccessibleDescription(
    /Needs review/,
  );
  await expect(shown.select(linked.title)).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expectProjectChoice(page, "Open Dough");
});

test("equal identities use their own project's review state; every shown matching row shares successful card changes", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  let catalogs = 0;
  page.on("request", (request) => {
    if (isPygardonCatalog(new URL(request.url()))) catalogs += 1;
  });
  const { shown } = await openFrontendReviewCueSessions(page, frontendServices);
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
});

test("a newly revealed batch resolves the same published story without per-row catalog reads", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date());
  const older = Array.from(Array(24).keys(), (index) =>
    cueSession(`Older review session ${String(index)}`, index + 100),
  );
  let catalogs = 0;
  page.on("request", (request) => {
    if (isPygardonCatalog(new URL(request.url()))) catalogs += 1;
  });
  const { shown } = await openFrontendReviewCueSessions(
    page,
    frontendServices,
    {
      extra: older,
    },
  );
  await expect(shown.entries).toHaveCount(20);
  await expect(shown.row("Older review session 23")).toHaveCount(0);
  await shown.revealOlder();
  await expect(shown.entries).toHaveCount(30);
  await expectSessionReviewCue(shown.row("Older review session 23"), true);
  await untilPageRequestsAnswered(page);
  expect(catalogs).toBeLessThanOrEqual(2);
  await expectProjectChoice(page, "Open Dough");
});

test.describe("narrow touch review cue", () => {
  test.use({ viewport: phoneLaunchTouchViewport.portrait, hasTouch: true });
  test("a long title leaves Needs review and separate Select and Open usable", async ({
    page,
    frontendServices,
  }) => {
    const { shown } = await openFrontendReviewCueSessions(
      page,
      frontendServices,
      {
        extra: [cueSession(longSessionTitle, 0)],
        tap: tapWhereShown,
      },
    );
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
