// Detail observations for the story-readiness journey: purpose, recorded
// completion counts, accepted evidence versus prospective proof, and planless
// absence. Assertions stay at the accessible detail region.

import { expect, type Locator, type Page } from "@playwright/test";
import type { CommittedOrigin } from "./committedOrigin";
import {
  plannedReady,
  planless,
  type ReadinessRepo,
} from "./storyReadinessFixture";

export async function expectReadyDetailZeroComplete(
  taken: Locator,
  origin: CommittedOrigin,
) {
  const before = origin.requests.length;
  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  await readyCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  await expect(detail).toBeVisible();
  await expect(detail.getByRole("heading", { name: "Purpose" })).toBeVisible();
  await expect(detail).toContainText(
    "Show recorded slice progress for a Taken story",
  );
  await expect(detail).toContainText("0 of 5 recorded complete");
  await expect(detail).toContainText("Establish shared plan reading");
  await expect(detail).toContainText("Pin source links beside progress");
  await expect(detail).toContainText("Status: planned");
  await expect(detail).toContainText("Prospective proof recipe:");
  await expect(detail.getByText("Accepted evidence:")).toHaveCount(0);
  await expect(
    detail.getByRole("link", { name: /Canonical record/ }),
  ).toBeVisible();
  await expect(detail.getByRole("link", { name: /Slice plan/ })).toBeVisible();
  expect(origin.requests.length).toBe(before);
}

export async function expectReadyDetailTwoCompleteAfterPublish(
  page: Page,
  taken: Locator,
  source: Locator,
  refresh: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  publishTwoSlicesDone: (repo: ReadinessRepo) => string,
) {
  const nextRevision = publishTwoSlicesDone(openDough);
  origin.advanceTo(nextRevision);
  origin.requests.splice(0, origin.requests.length);

  await refresh.click();
  await expect(source).toContainText(nextRevision);

  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  if (!(await detail.isVisible())) {
    await readyCard.getByRole("button", { name: "Inspect story" }).click();
  }
  await expect(detail).toContainText("2 of 5 recorded complete");
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
  const planlessCard = backlog.getByRole("article", { name: planless.title });
  await planlessCard.getByRole("button", { name: "Inspect story" }).click();
  const planlessDetail = planlessCard.getByRole("region", {
    name: `Detail for ${planless.title}`,
  });
  await expect(planlessDetail).toContainText("Approach: Planless");
  await expect(planlessDetail).toContainText("No associated plan is recorded");
}
