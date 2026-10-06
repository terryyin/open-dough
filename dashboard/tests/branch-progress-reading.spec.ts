// The same visible reading place survives a moved story branch's progress
// enrichment as independently arriving fact groups. Raw published plans grow
// above a focused source link through the built preview's real local boundary.

import { inspectedDetail } from "./cardControls.ts";
import { expectView, rem, showColumn } from "./dashboardColumnsPage.ts";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { openedSettled } from "./branchRefreshJourney.ts";
import {
  onBranch,
  planPath,
  repository,
  revision,
  slicePlan,
  trunk,
} from "./branchProgressRecords.ts";
import { expectVisibleReadingFocus } from "./readingPlace.ts";

test("moved branch progress keeps a scrolled inspection and its visible focused link", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 54 * rem, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { origin, progress } = await openedSettled(page);
  await showColumn(page, "Recently done");
  const card = parts(page).taken.getByRole("article", { name: onBranch });
  const detail = await inspectedDetail(card);
  const link = detail.getByRole("link", { name: /^Canonical record/ });
  const before = await page.evaluate(() => scrollY);
  await link.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  await link.focus();
  await expectVisibleReadingFocus(page, link);
  await expectView(page, ["Taken", "Recently done"], ["Backlog 0 entries"]);
  const pinned = `https://github.com/${repository}/blob/${revision}/.planning/seeds/SEED-092-branch.md#on-branch`;
  await expect(link).toHaveAttribute("href", pinned);

  const movedHead = "e8".repeat(20);
  const now = await page.evaluate(() => Date.now());
  origin.moveBranch("story/example", {
    revision: movedHead,
    files: { ...trunk.files, [planPath("on-branch")]: slicePlan(12, 7) },
    committed: { [planPath("on-branch")]: new Date(now - 2 * 60_000) },
  });
  await passTimeUntilChecked(page);
  await expect(progress).toContainText("7 of 12 slices recorded complete");
  await expect(detail.locator(".progress-source")).toContainText(
    `From branch story/example at ${movedHead.slice(0, 7)}; not in trunk.`,
  );
  await expect(progress).toContainText("Current slice started 2 min ago");
  await expect(
    card.getByRole("button", { name: "Hide detail" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(detail.locator(".card-identity")).toHaveText(
    "SEED-092#on-branch",
  );
  await expect(link).toHaveAttribute("href", pinned);
  await expect(parts(page).source).toContainText(revision);
  await expectVisibleReadingFocus(page, link);
  await expectView(page, ["Taken", "Recently done"], ["Backlog 0 entries"]);
  expect(errors).toEqual([]);
});
