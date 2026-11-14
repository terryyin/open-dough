// The same visible reading place survives a moved story branch's progress
// enrichment as independently arriving fact groups. Raw published plans grow
// above a focused source link through the built preview's real local boundary.

import { renderSlicePlan } from "../../../tests/support/published-plan.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  canonicalRecord,
  inspectedDetail,
  storyCard,
} from "../storyCardControls.ts";
import { progressSource } from "../storyCardFacts.ts";
import { expectView, rem, scrollYOf, showColumn } from "../boardPage.ts";
import { expect, test } from "../dashboardTest.ts";
import { shortRevision, parts } from "../dashboardPage.ts";
import { passTimeUntilChecked } from "../autoRefreshJourney.ts";
import { openedSettled } from "../branchRefreshJourney.ts";
import {
  onBranch,
  planPath,
  repository,
  revision,
  trunk,
} from "../branchProgressRecords.ts";
import { expectVisibleReadingFocus } from "../readingPlace.ts";

test("moved branch progress keeps a scrolled inspection and its visible focused link", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 54 * rem, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { origin, progress } = await openedSettled(page);
  await showColumn(page, "Recently done");
  const card = storyCard(parts(page).taken, onBranch);
  const detail = await inspectedDetail(card);
  const link = canonicalRecord(detail);
  const before = await scrollYOf(page);
  await link.scrollIntoViewIfNeeded();
  await expect.poll(() => scrollYOf(page)).toBeGreaterThan(before);
  await link.focus();
  await expectVisibleReadingFocus(page, link);
  await expectView(page, ["Taken", "Recently done"], ["Backlog 0 entries"]);
  const pinned = `https://github.com/${repository}/blob/${revision}/.planning/seeds/SEED-092-branch.md#on-branch`;
  await expect(link).toHaveAttribute("href", pinned);

  const movedHead = "e8".repeat(20);
  const now = await page.evaluate(() => Date.now());
  origin.moveBranch("story/example", {
    revision: movedHead,
    files: {
      ...trunk.files,
      [planPath("on-branch")]: renderSlicePlan(
        makeMe.aSlicePlan
          .withStatuses([
            "done",
            "done",
            "done",
            "done",
            "done",
            "done",
            "done",
            "planned",
            "planned",
            "planned",
            "planned",
            "planned",
          ])
          .please(),
        { heading: "Slices" },
      ),
    },
    committed: { [planPath("on-branch")]: new Date(now - 2 * 60_000) },
  });
  await passTimeUntilChecked(page);
  await expect(progress).toContainText("7 of 12 slices recorded complete");
  await expect(progressSource(detail)).toContainText(
    `From branch story/example at ${shortRevision(movedHead)}; not in trunk.`,
  );
  await expect(progress).toContainText("Current slice started 2 min ago");
  await expect(
    card.getByRole("button", { name: "Hide detail" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(detail.locator(".record-identity")).toHaveText(
    "SEED-092#on-branch",
  );
  await expect(link).toHaveAttribute("href", pinned);
  await expect(parts(page).readRevision).toContainText(shortRevision(revision));
  await expectVisibleReadingFocus(page, link);
  await expectView(page, ["Taken", "Recently done"], ["Backlog 0 entries"]);
  expect(errors).toEqual([]);
});
