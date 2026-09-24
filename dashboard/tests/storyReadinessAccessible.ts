// Accessibility observations for story readiness: keyboard detail, identity
// focus across refresh, narrow/zoomed reading, badge text and contrast,
// reduced-motion settling, and polite announcements. Fixtures remain
// CLI-committed Git bytes.

import { expect, type Locator, type Page } from "@playwright/test";
import {
  expectFocusedAndIndicated,
  expectImmediateMotion,
  expectReadableContrast,
  politeRegionsOfferedThenMarked,
  zoomedWindow,
} from "./accessibleReading";
import type { CommittedOrigin } from "./committedOrigin";
import { expectMembership, parts } from "./dashboardPage";
import { rateLimitedAnswer } from "./originAnswers";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout";
import {
  plannedBlocked,
  plannedReady,
  type ReadinessRepo,
  unrefined,
} from "./storyReadinessFixture";
import {
  publishDropUnrefined,
  publishRestoreUnrefined,
} from "./storyReadinessPublications";

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

export async function expectRefreshPreservesOrAnnouncesIdentity(
  page: Page,
  backlog: Locator,
  refresh: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
) {
  const { notice, stages } = parts(page);
  expect(await page.evaluate(politeRegionsOfferedThenMarked)).toEqual([
    true,
    true,
  ]);

  const queuedPlan = backlog
    .getByRole("article", { name: plannedBlocked.title })
    .getByRole("link", { name: /^Slice plan / });
  const keptRevision = publishDropUnrefined(openDough);
  origin.advanceTo(keptRevision);
  // Same hold-then-focus pattern as refresh-focus: Refresh takes focus, then
  // identity focus is restored while the next snapshot is still held.
  const releaseKept = origin.hold("main");
  await refresh.click();
  await queuedPlan.focus();
  releaseKept();
  await expect(parts(page).source).toContainText(keptRevision);

  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [plannedBlocked.title],
  });
  // The derived plan retains its work identity and stable navigation role.
  await expect(queuedPlan).toBeFocused();
  await expect(notice).toBeEmpty();

  const restored = publishRestoreUnrefined(openDough);
  origin.advanceTo(restored);
  const releaseRestored = origin.hold("main");
  await refresh.click();
  releaseRestored();
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [unrefined.title, plannedBlocked.title],
  });

  const unrefinedCard = backlog.getByRole("article", {
    name: unrefined.title,
  });
  const removedRevision = publishDropUnrefined(openDough);
  origin.advanceTo(removedRevision);
  const releaseRemoved = origin.hold("main");
  await refresh.click();
  await unrefinedCard.focus();
  await expect(notice).toBeEmpty();
  releaseRemoved();
  await expectMembership(page, {
    taken: [plannedReady.title],
    backlog: [plannedBlocked.title],
  });
  await expect(stages).toBeFocused();
  await expect(notice).toHaveText(
    `${unrefined.title} is no longer listed in the published work.`,
  );
  await expect(notice).toHaveAttribute("data-known", "[aria-live='polite']");
}

export async function expectNarrowZoomKeepsLabelsEvidenceAndRetry(
  page: Page,
  taken: Locator,
  backlog: Locator,
  refresh: Locator,
  origin: CommittedOrigin,
) {
  await page.setViewportSize(zoomedWindow);

  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  await readyCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  await expect(detail).toBeVisible();
  await expect(detail.getByText("Ready for execution").first()).toBeVisible();
  await expect(detail).toContainText("0 of 5 slices recorded complete");
  await expect(
    detail.getByRole("link", { name: /^Canonical record/ }),
  ).toBeVisible();

  await expect(
    backlog
      .getByRole("article", { name: plannedBlocked.title })
      .getByText("Not ready", { exact: true }),
  ).toBeVisible();
  const queuedPlan = backlog
    .getByRole("article", { name: plannedBlocked.title })
    .getByRole("link", { name: /^Slice plan / });
  await queuedPlan.scrollIntoViewIfNeeded();
  await backlog
    .getByRole("article", { name: plannedBlocked.title })
    .getByRole("link", { name: /^Canonical record / })
    .focus();
  await page.keyboard.press("Tab");
  await expect(queuedPlan).toBeInViewport({ ratio: 1 });
  await expectFocusedAndIndicated(page, queuedPlan);
  await parts(page).preparationHelp.click();
  const legend = page.getByRole("dialog", { name: "Preparation badges" });
  await expect(legend).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page);
  await legend.getByRole("button", { name: "Close" }).click();

  const restore = origin.answerWith("main", rateLimitedAnswer());
  await refresh.click();
  const { retry, problem, source } = parts(page);
  await expect(problem).toContainText("Published work could not be read");
  await retry.scrollIntoViewIfNeeded();
  await expect(retry).toBeInViewport({ ratio: 1 });
  await expect(source).toBeVisible();
  await expectNoSidewaysScrollAndWholeText(page);
  restore();
  await retry.click();
  await expect(problem).toHaveCount(0);
  await expect(parts(page).refresh).toBeVisible();
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
