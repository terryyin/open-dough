// The same visible reading place survives a moved story branch's progress
// enrichment as independently arriving fact groups. Raw published plans grow
// above a focused source link through the built preview's real local boundary.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  canonicalRecord,
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { progressSource } from "../../dashboard/test-support/storyCardFacts.ts";
import {
  expectView,
  rem,
  scrollYOf,
  showColumn,
} from "../../dashboard/test-support/boardPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  branchPlanChange,
  openedSettled,
} from "../../dashboard/test-support/branchRefreshJourney.ts";
import {
  onBranch,
  planPath,
  repository,
} from "../../dashboard/test-support/branchProgressRecords.ts";
import { expectVisibleReadingFocus } from "../../dashboard/test-support/readingPlace.ts";

test("moved branch progress keeps a scrolled inspection and its visible focused link", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 54 * rem, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const plan = makeMe.aSlicePlan
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
    .please();
  const { origin, progress } = await openedSettled(page, afterGitHubStops, {
    advances: [
      {
        name: "moved",
        parent: "story/example",
        facts: { files: branchPlanChange(plan) },
      },
    ],
  });
  const { revision } = origin.at("trunk");
  const routed = (branch: string) =>
    remoteBranchHead(gitHubRepositoryUrl(repository), `refs/heads/${branch}`, {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routed("main")).toBe(revision);
  expect(await routed("story/example")).toBe(
    origin.at("story/example").revision,
  );
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

  const moved = origin.at("moved");
  const now = await page.evaluate(() => Date.now());
  origin.moveBranch("story/example", {
    ...moved,
    committed: { [planPath("on-branch")]: new Date(now - 2 * 60_000) },
  });
  expect(await routed("story/example")).toBe(moved.revision);
  await passTimeUntilChecked(page);
  await expect(progress).toContainText("7 of 12 slices recorded complete");
  await expect(progressSource(detail)).toContainText(
    `From branch story/example at ${shortRevision(moved.revision)}; not in trunk.`,
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
