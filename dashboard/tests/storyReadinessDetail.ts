// Detail observations for the story-readiness journey: purpose, recorded
// completion counts, accepted evidence versus prospective proof, and planless
// absence. Assertions stay at the accessible detail region.

import { expect, type Locator, type Page } from "@playwright/test";
import type { CommittedOrigin } from "./committedOrigin.ts";
import { shortRevision, parts } from "./dashboardPage.ts";
import {
  plannedReady,
  planless,
  type ReadinessRepo,
} from "./storyReadinessFixture.ts";
import { reloadUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";
import {
  canonicalRecord,
  inspectedDetail,
  storyCard,
} from "./storyCardControls.ts";

export async function expectReadyDetailZeroComplete(
  taken: Locator,
  origin: CommittedOrigin,
) {
  const before = origin.requests.length;
  const detail = await inspectedDetail(storyCard(taken, plannedReady.title));
  await expect(detail.getByRole("heading", { name: "Purpose" })).toBeVisible();
  await expect(detail).toContainText(
    "Show recorded slice progress for a Taken story",
  );
  await expect(detail).toContainText("0 of 5 slices recorded complete");
  await expect(detail).toContainText("Establish shared plan reading");
  await expect(detail).toContainText("Pin source links beside progress");
  await expect(detail).toContainText("Status: planned");
  await expect(detail).toContainText("Prospective proof recipe:");
  await expect(detail.getByText("Accepted evidence:")).toHaveCount(0);
  await expect(canonicalRecord(detail)).toBeVisible();
  await expect(detail.getByRole("link", { name: /Slice plan/ })).toBeVisible();
  expect(origin.requests.length).toBe(before);
}

export async function expectReadyDetailTwoCompleteAfterPublish(
  page: Page,
  taken: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  publishTwoSlicesDone: (repo: ReadinessRepo) => string,
) {
  const nextRevision = publishTwoSlicesDone(openDough);
  origin.advanceTo(nextRevision);
  origin.requests.splice(0, origin.requests.length);

  await reloadUntilRead(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(nextRevision),
  );
  await untilPageReadsAnswered(page);

  // Its detail may still be open from earlier.
  const detail = await inspectedDetail(storyCard(taken, plannedReady.title));
  await expect(detail).toContainText("2 of 5 slices recorded complete");
  await expect(detail).toContainText("Status: done (recorded complete)");
  await expect(detail).toContainText("Accepted evidence:");
  await expect(detail).toContainText("Shared plan reader unit checks passed");
  await expect(detail).toContainText(
    "Dashboard detail shows two of five recorded complete",
  );
  await expect(detail).toContainText("Prospective proof recipe:");
  await expect(detail.getByText("Accepted evidence is absent")).toHaveCount(0);
  await expect(
    detail.locator(".slice-proof", {
      hasText: "Shared reader interprets ordered slices",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Unpushed local edit that must stay invisible"),
  ).toHaveCount(0);
}

export async function expectPlanlessDetailAbsentPlan(backlog: Locator) {
  const planlessDetail = await inspectedDetail(
    storyCard(backlog, planless.title),
  );
  await expect(planlessDetail).toContainText("Approach: Planless");
  await expect(planlessDetail).toContainText("No associated plan is recorded");
}
