// A selected Taken story's long title in the story's persistent header
// (../../src/IntentHeader.tsx) shows once, in full, wrapping rather
// than shortened, and stays above the story's views whichever is chosen; its
// Intent coverage says the assessment comes with wrap-up. The rest of the
// header: ./intent-story-changes.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";
import { storyA } from "../../../tests/support/queued-repository.mjs";
import { shortRevision } from "../dashboardParts.ts";
import { expectStackedInOrder } from "../partArrangement.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  chooseStoryTab,
  selectTakenStoryInIntent,
  storyHeaderDetail,
  storyTab,
  storyTitle,
} from "../support/intentStoryPage.ts";

test("a long story title shows once in full above the story's views, whichever is chosen", async ({
  page,
  origin,
}) => {
  await page.setViewportSize({ width: 900, height: 720 });
  const long =
    "Story A reads frontend tests in both projects and keeps every location's source beside the published revision";
  const { intent, baseline } = await selectTakenStoryInIntent(
    page,
    origin,
    undefined,
    undefined,
    makeMe.aBacklogEntry.with({ ...storyA, title: long }).please(),
  );
  const title = storyTitle(intent);
  await expect(title).toHaveText(long);
  await expect(intent.getByText(long, { exact: true })).toHaveCount(1);
  const box = await title.evaluate((element) => ({
    overflows: element.scrollWidth > element.clientWidth,
    lines: Math.round(
      element.getBoundingClientRect().height /
        parseFloat(getComputedStyle(element).lineHeight),
    ),
  }));
  expect(box.overflows).toBe(false);
  expect(box.lines).toBeGreaterThan(1);

  const detail = await storyHeaderDetail(intent);
  await expect(detail.locator(".record-identity")).toHaveText("SEED-A#a");
  await expect(detail.locator(".intent-story-revisions")).toContainText(
    `Compared ${shortRevision(baseline)} with worktree `,
  );

  for (const view of [
    "CI comparison",
    "Intent coverage",
    "Changed tests",
  ] as const) {
    await chooseStoryTab(intent, view);
    await expectStackedInOrder([title, storyTab(intent, view)]);
  }

  await chooseStoryTab(intent, "Intent coverage");
  await expect(
    intent.getByRole("region", { name: "Intent coverage" }).locator("p"),
  ).toHaveText([
    "The Intent Coverage assessment runs during feature story wrap-up, so it appears here once this story is completed.",
  ]);
});
