// Accessibility observations for story readiness: keyboard detail, identity
// focus across a newly read snapshot, narrow/zoomed reading, badge text and
// contrast, reduced-motion settling, and polite announcements. Fixtures remain
// CLI-committed Git bytes.

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
import { expectMembership, parts } from "./dashboardPage.ts";
import { showColumn } from "./dashboardColumnsPage.ts";
import { noConnection } from "./originAnswers.ts";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
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
  const readyCard = taken.getByRole("article", { name: plannedReady.title });
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
  const { notice, stages } = parts(page);
  expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
    true,
    true,
  ]);

  // The plan link is in the story's detail, which stays open across snapshots.
  const blockedCard = backlog.getByRole("article", {
    name: plannedBlocked.title,
  });
  await blockedCard.getByRole("button", { name: "Inspect story" }).click();
  const queuedPlan = blockedCard
    .getByRole("region", { name: `Detail for ${plannedBlocked.title}` })
    .getByRole("link", { name: /^Slice plan / });
  const keptRevision = publishDropUnrefined(openDough);
  origin.advanceTo(keptRevision);
  // Focus stays on the plan while the next snapshot is read, and its identity
  // focus is restored once that snapshot replaces the shown one.
  await queuedPlan.focus();
  await passTimeUntilChecked(page);
  await expect(parts(page).source).toContainText(keptRevision);

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

  const unrefinedCard = backlog.getByRole("article", {
    name: unrefined.title,
  });
  const removedRevision = publishDropUnrefined(openDough);
  origin.advanceTo(removedRevision);
  await unrefinedCard.focus();
  await expect(notice).toBeEmpty();
  await passTimeUntilChecked(page);
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [plannedBlocked.title],
  });
  await expect(stages).toBeFocused();
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

  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  await showColumn(page, "Taken");
  await readyCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  await expect(detail).toBeVisible();
  await expect(detail.getByText("Ready for execution").first()).toBeVisible();
  await expect(detail).toContainText("Changed since readiness review");
  await expect(detail).toContainText("0 of 5 slices recorded complete");
  await expect(
    detail.getByRole("link", { name: /^Canonical record/ }),
  ).toBeVisible();

  await expect(
    backlog
      .getByRole("article", { name: plannedBlocked.title })
      .getByText("Not ready", { exact: true }),
  ).toBeVisible();
  // Inspecting the blocked story moves the detail to it; its links follow
  // Hide detail in reading order.
  const blockedCard = backlog.getByRole("article", {
    name: plannedBlocked.title,
  });
  await showColumn(page, "Backlog");
  await blockedCard.getByRole("button", { name: "Inspect story" }).click();
  await expect(detail).toHaveCount(0);
  const blockedDetail = blockedCard.getByRole("region", {
    name: `Detail for ${plannedBlocked.title}`,
  });
  const queuedPlan = blockedDetail.getByRole("link", { name: /^Slice plan / });
  await queuedPlan.scrollIntoViewIfNeeded();
  await blockedDetail.getByRole("link", { name: /^Canonical record / }).focus();
  await page.keyboard.press("Tab");
  await expect(queuedPlan).toBeInViewport({ ratio: 1 });
  await expectFocusedAndIndicated(page, queuedPlan);
  await parts(page).preparationHelp.click();
  const legend = page.getByRole("dialog", { name: "Preparation badges" });
  await expect(legend).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page);
  await legend.getByRole("button", { name: "Close" }).click();

  const restore = origin.answerWith("main", noConnection);
  await passTimeUntilChecked(page, 502);
  const { problem, source } = parts(page);
  await expect(problem).toContainText("Published work could not be read");
  await problem.scrollIntoViewIfNeeded();
  await expect(problem).toBeInViewport();
  await expect(source).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page);
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

  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  const blockedCard = backlog.getByRole("article", {
    name: plannedBlocked.title,
  });

  const slicePlanned = readyCard.getByText("Slice planned", { exact: true });
  const ready = readyCard.getByText("Ready for execution", { exact: true });
  const notReady = blockedCard.getByText("Not ready", { exact: true });
  await expect(slicePlanned).toBeVisible();
  await expect(ready).toBeVisible();
  await expect(notReady).toBeVisible();

  await expectReadableContrast(slicePlanned);
  await expectReadableContrast(ready);
  await expectReadableContrast(notReady);
  const changed = readyCard.getByText("Changed since readiness review", {
    exact: true,
  });
  await expect(changed).toBeVisible();
  await expectReadableContrast(changed);
  await parts(page).preparationHelp.click();
  const legend = page.getByRole("dialog", { name: "Preparation badges" });
  await expectReadableContrast(
    legend.getByText("Not refined", { exact: true }),
  );
  await expectImmediateMotion(legend);
  await legend.getByRole("button", { name: "Close" }).click();

  await expectImmediateMotion(readyCard);
  await readyCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  await expect(detail).toBeVisible();
  await expectImmediateMotion(detail);
  await readyCard.getByRole("button", { name: "Hide detail" }).click();
  await expect(readyCard).toBeFocused();
  await expect(detail).toHaveCount(0);
}
