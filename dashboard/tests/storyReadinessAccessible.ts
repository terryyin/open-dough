// Accessibility observations for story readiness: keyboard detail, identity
// focus across a newly read snapshot, narrow/zoomed reading, badge contrast,
// reduced-motion settling, and polite announcements. CLI-committed fixtures.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  expectFocusedAndIndicated,
  expectImmediateMotion,
  expectReadableContrast,
  politeRegionsOfferedThenMarked,
  zoomedWindow,
} from "./accessibleReading.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import type { CommittedOrigin } from "./committedOrigin.ts";
import {
  expectMembership,
  shortRevision,
  parts,
  shownProjectControl,
} from "./dashboardPage.ts";
import { showColumn } from "./boardPage.ts";
import { noConnection } from "./originAnswers.ts";
import {
  compactProjectSelectCut,
  expectNoSidewaysScrollAndWholeText,
} from "./pageLayout.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
import {
  canonicalRecord,
  hideDetail,
  inspectedDetail,
  slicePlanLink,
  storyCard,
} from "./storyCardControls.ts";
import { badge, expectBadges } from "./storyCardFacts.ts";
import {
  plannedBlocked,
  plannedReady,
  type ReadinessRepo,
  unrefined,
} from "./storyReadinessFixture.ts";
import {
  publishDropUnrefined,
  publishRestoreUnrefined,
} from "./storyReadinessPublications.ts";

export async function expectKeyboardOpensAndClosesDetail(
  page: Page,
  taken: Locator,
) {
  const readyCard = storyCard(taken, plannedReady.title);
  const inspect = readyCard.getByRole("button", { name: "Inspect story" });
  await inspect.focus();
  await expectFocusedAndIndicated(page, inspect);

  await page.keyboard.press("Space");
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  await expect(detail).toBeVisible();
  await expect(
    readyCard.getByRole("button", { name: "Hide detail" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(detail).toContainText("0 of 5 slices recorded complete");
  await expect(detail).toContainText("Prospective proof recipe:");

  await page.keyboard.press("Space");
  await expect(detail).toHaveCount(0);
  await expect(readyCard).toBeFocused();
  await expectFocusedAndIndicated(page, readyCard);
  await expect(
    readyCard.getByRole("button", { name: "Inspect story" }),
  ).toHaveAttribute("aria-expanded", "false");
}

export async function expectNewSnapshotPreservesOrAnnouncesIdentity(
  page: Page,
  backlog: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
) {
  const { notice, board } = parts(page);
  expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
    true,
    true,
  ]);

  // The plan link is in the story's detail, which stays open across snapshots.
  const blockedCard = storyCard(backlog, plannedBlocked.title);
  const queuedPlan = slicePlanLink(await inspectedDetail(blockedCard));
  // Finish the opening snapshot's detail asks before the paused clock advances
  // into a check; otherwise a wait-bound interruption arms recovery.
  await untilPageRequestsAnswered(page);
  const keptRevision = publishDropUnrefined(openDough);
  origin.advanceTo(keptRevision);
  // Focus stays on the plan while the next snapshot is read, and its identity
  // focus is restored once that snapshot replaces the shown one.
  await queuedPlan.focus();
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(keptRevision),
  );

  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [plannedBlocked.title],
  });
  // The derived plan retains its work identity and stable navigation role.
  await expect(queuedPlan).toBeFocused();
  await expect(notice).toBeEmpty();
  // Membership and its derived plan can arrive before the independent fact
  // reads finish. This origin answers only its current revision, so finish
  // this snapshot before publishing the next one.
  await untilPageRequestsAnswered(page);

  const restored = publishRestoreUnrefined(openDough);
  origin.advanceTo(restored);
  await passTimeUntilChecked(page);
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [unrefined.title, plannedBlocked.title],
  });
  await untilPageRequestsAnswered(page);

  const unrefinedCard = storyCard(backlog, unrefined.title);
  const removedRevision = publishDropUnrefined(openDough);
  origin.advanceTo(removedRevision);
  await unrefinedCard.focus();
  await expect(notice).toBeEmpty();
  await passTimeUntilChecked(page);
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [plannedBlocked.title],
  });
  await expect(board).toBeFocused();
  await expect(notice).toHaveText(
    `${unrefined.title} is no longer listed in the published work.`,
  );
  await expect(notice).toHaveAttribute("data-known", "[aria-live='polite']");
  await untilPageRequestsAnswered(page);
}

export async function expectNarrowZoomKeepsLabelsEvidenceAndFailure(
  page: Page,
  taken: Locator,
  backlog: Locator,
  origin: CommittedOrigin,
) {
  await page.setViewportSize(zoomedWindow);

  const readyCard = storyCard(taken, plannedReady.title);
  await showColumn(page, "Taken");
  const detail = await inspectedDetail(readyCard);
  await expect(detail).toContainText("Assessment: Ready");
  await expect(detail).toContainText("Changed since readiness review");
  await expect(detail).toContainText("0 of 5 slices recorded complete");
  await expect(canonicalRecord(detail)).toBeVisible();

  // The blocked story's detail opens beside the ready story's, which stays
  // open; its links follow Hide detail in reading order.
  const blockedCard = storyCard(backlog, plannedBlocked.title);
  await expectBadges(blockedCard, { shown: ["Not ready"] });
  await showColumn(page, "Backlog");
  const blockedDetail = await inspectedDetail(blockedCard);
  await expect(detail).toBeVisible();
  const queuedPlan = slicePlanLink(blockedDetail);
  await queuedPlan.scrollIntoViewIfNeeded();
  await canonicalRecord(blockedDetail).focus();
  await page.keyboard.press("Tab");
  await expect(queuedPlan).toBeInViewport({ ratio: 1 });
  await expectFocusedAndIndicated(page, queuedPlan);
  await parts(page).preparationHelp.click();
  const legend = page.getByRole("dialog", { name: "Preparation badges" });
  await expect(legend).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  await legend.getByRole("button", { name: "Close" }).click();

  const restore = origin.answerWith("main", noConnection);
  await passTimeUntilChecked(page, 502);
  const { problem } = parts(page);
  await expect(problem).toContainText("Published work could not be read");
  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toBeInViewport();
  await expect(shownProjectControl(page)).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page, compactProjectSelectCut);
  restore();
  await passTimeUntilChecked(page);
  await expect(problem).toHaveCount(0);
}

export async function expectBadgeTextContrastAndReducedMotion(
  page: Page,
  taken: Locator,
  backlog: Locator,
) {
  await page.emulateMedia({ reducedMotion: "reduce" });

  const readyCard = storyCard(taken, plannedReady.title);
  const blockedCard = storyCard(backlog, plannedBlocked.title);
  const readyLabels = [
    "Slice planned",
    "Ready for execution",
    "Changed since readiness review",
  ];
  await expectBadges(readyCard, { shown: readyLabels });
  await expectBadges(blockedCard, { shown: ["Not ready"] });
  for (const label of readyLabels)
    await expectReadableContrast(badge(readyCard, label));
  await expectReadableContrast(badge(blockedCard, "Not ready"));
  await parts(page).preparationHelp.click();
  const legend = page.getByRole("dialog", { name: "Preparation badges" });
  await expectReadableContrast(
    legend.getByText("Not refined", { exact: true }),
  );
  await expectImmediateMotion(legend);
  await legend.getByRole("button", { name: "Close" }).click();

  await expectImmediateMotion(readyCard);
  const detail = await inspectedDetail(readyCard);
  await expectImmediateMotion(detail);
  await hideDetail(readyCard);
  await expect(readyCard).toBeFocused();
  await expect(detail).toHaveCount(0);
}
