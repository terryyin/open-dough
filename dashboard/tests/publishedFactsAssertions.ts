// The same published canonical, story-card-assignment, and done facts must survive
// both independent arrivals and failures. These assertions observe rendered
// evidence; raw published records remain in publishedFactsArrival.ts.

import type { Locator, Page } from "@playwright/test";
import { parts } from "./dashboardParts.ts";
import { inspectedDetail } from "./storyCardControls.ts";
import { expect } from "./dashboardTest.ts";
import { preparer, preparingPath, purpose } from "./publishedFactsArrival.ts";
import { executed } from "./recentlyDoneRecords.ts";
import { planPath, repository, revision } from "./sliceClockRecords.ts";

export async function expectCanonicalFacts(queuedCard: Locator) {
  await expect(
    queuedCard.getByText("Slice planned", { exact: true }),
  ).toBeVisible();
  // A Ready assessment behind its blocking dependency is not yet eligible.
  await expect(
    queuedCard.getByText("Blocked by 1 dependency", { exact: true }),
  ).toBeVisible();
  await expect(queuedCard.locator(".badge-ready")).toHaveCount(0);
  const detail = await inspectedDetail(queuedCard);
  await expect(detail.locator(".story-purpose")).toHaveText(purpose);
  await expect(detail).toContainText("Assessment: Ready");
  await expect(detail).not.toContainText("Ready for execution");
  await expect(detail).toContainText("1 of 2 slices recorded complete");
  await expect(
    detail.getByRole("link", { name: /^Slice plan/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${revision}/${planPath("preparing")}`,
  );
  await expect(
    detail.getByRole("link", { name: /^Canonical record/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${revision}/${preparingPath}#preparing`,
  );
  const dependencies = queuedCard.locator(".story-dependencies");
  await dependencies
    .getByText("Dependencies · 1 blocking", { exact: true })
    .click();
  await expect(dependencies).toContainText(
    "The consumer needs the supplier's canonical contract.",
  );
  await expect(dependencies).toContainText(
    "The supplier's contract is integrated and verified.",
  );
  await dependencies
    .getByText("Dependencies · 1 blocking", { exact: true })
    .click();
}

export async function expectStoryCardAssignments(
  branchCard: Locator,
  queuedCard: Locator,
) {
  await expect(
    branchCard.locator(".story-card-owner .owner-line"),
  ).toContainText("Akiho-chan · Fixture Committer · Claude Code");
  await expect(queuedCard.locator(".story-card-preparing")).toContainText(
    `PreparingKirara-chan · ${preparer} · Codex`,
  );
}

// Every fact group has settled: none is still shown as being read.
export async function expectNoOrphanReading(page: Page) {
  for (const reading of [
    "Reading preparation…",
    "Reading agent profile…",
    "Reading plan slices…",
    "Reading current slice time…",
    "Reading human developer…",
  ]) {
    await expect(page.getByText(reading, { exact: true })).toHaveCount(0);
  }
  await expect(parts(page).reading).toHaveCount(0);
}

export async function expectDoneFacts(doneCard: Locator) {
  await expect(doneCard).toContainText(executed.identity);
  await expect(doneCard).toContainText("Terry Yin");
}
