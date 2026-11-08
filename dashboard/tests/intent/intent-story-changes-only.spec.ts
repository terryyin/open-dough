// Example 2 and 4: "Selected story only" over a selected story's overlay
// (../support/intentStoryWorktree.ts). Off at first; on, only the in-scope
// changed files and their folders remain, expanded; off again, the whole
// tree, with the changed folders open and the rest collapsed, however they
// were arranged by hand in between. Visiting another of the story's views
// and returning keeps the selected file and its reading, the open folders,
// and the choice. A story selected in Development opens at its CI comparison
// and starts the tree's kept arrangement afresh
// (../../src/pageIntentReading.tsx), so it applies its expansion, with the
// toggle off, the next time Changed tests shows. A story that changed only product code says no
// test file in a location changed, with the count outside. The choice stays
// through a new trunk revision and through **Show latest**
// (../../src/IntentRevisionNotice.tsx). The highlighted
// journey: ./intent-story-changes.spec.ts.

import type { Locator } from "@playwright/test";
import { parts } from "../dashboardPage.ts";
import {
  intentGroupToggle,
  purposeRegion,
  revisionNotice,
} from "../intentPerspectivePage.ts";
import { expectSelected } from "../storyCardSelection.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  folderToggle,
  folderRow,
  chooseStoryTab,
  expectOutsideCount,
  expectStoryTab,
  intentFile,
  selectTakenStoryInIntent,
  storyHeaderDetail,
  storyOnly,
  storySummary,
} from "../support/intentStoryPage.ts";
import {
  changed,
  changeIntentTests,
  changeProductOnly,
} from "../support/intentStoryWorktree.ts";
import { shortRevision } from "../dashboardParts.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "../autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";

const changedInFirstLocation = [
  changed.modified,
  changed.added,
  changed.deleted,
  changed.into,
  changed.outOf,
];

// The tree as the story's expansion leaves it: the first changed location
// open, its folders containing changes open, `other` collapsed.
async function expectStoryExpansion(intent: Locator) {
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(intentGroupToggle(intent, "tests")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  for (const name of ["arriving", "boundary", "out"])
    await expect(folderToggle(intent, name, true)).toBeVisible();
}

test("Selected story only shows just the story's changed files, expanded, and off again the whole tree with its changed folders open", async ({
  page,
  origin,
}) => {
  const { card, intent } = await selectTakenStoryInIntent(page, origin);
  const toggle = storyOnly(intent);
  const kept = "dashboard/tests/boundary/kept.spec.ts";
  const other = "dashboard/tests/other/c.spec.ts";

  await test.step("on, only the changed files and their folders remain, expanded", async () => {
    await expect(toggle).not.toBeChecked();
    // Arranged by hand, which the toggle's expansion replaces.
    await folderToggle(intent, "boundary", true).click();
    await folderToggle(intent, "other", false).click();
    await toggle.check();
    await expectStoryExpansion(intent);
    for (const name of changedInFirstLocation)
      await expect(intentFile(intent, name)).toBeVisible();
    for (const name of [kept, other])
      await expect(intentFile(intent, name)).toHaveCount(0);
    await expect(folderRow(intent, "other")).toHaveCount(0);
    await expectOutsideCount(intent, 2);
    await expect(intent.locator(".intent-story-none")).toHaveCount(0);
  });

  await test.step("visiting Intent coverage and returning keeps the selected file, its reading, the open folders, and the choice", async () => {
    const file = intentFile(intent, changed.modified);
    await file.click();
    const purpose = purposeRegion(intent);
    const diffName = purpose.locator(".intent-story-diff-name");
    await expect(diffName).toHaveText(changed.modified);
    const expectKept = async () => {
      await expect(file).toHaveAttribute("aria-pressed", "true");
      await expect(diffName).toHaveText(changed.modified);
      await expectStoryExpansion(intent);
      await expect(toggle).toBeChecked();
    };
    await expectKept();
    await chooseStoryTab(intent, "Intent coverage");
    await expect(file).toBeHidden();
    await chooseStoryTab(intent, "Changed tests");
    await expectKept();
  });

  await test.step("off, the whole tree shows with changed folders open and the rest collapsed", async () => {
    await folderToggle(intent, "out", true).click();
    await toggle.uncheck();
    await expectStoryExpansion(intent);
    await expect(folderToggle(intent, "other", false)).toBeVisible();
    await expect(intentFile(intent, kept)).toBeVisible();
    await expect(intentFile(intent, other)).toBeHidden();
    for (const name of changedInFirstLocation)
      await expect(intentFile(intent, name)).toBeVisible();
  });

  await test.step("a story selected while Intent is hidden applies when Intent opens, the toggle off", async () => {
    await folderToggle(intent, "other", false).click();
    await toggle.check();
    const { development, intentChoice, backlog } = parts(page);
    await development.click();
    await backlog
      .getByRole("article", { name: "Story B" })
      .getByRole("heading", { level: 3 })
      .click();
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-B#b");
    await expectStoryTab(intent, "CI comparison");
    await chooseStoryTab(intent, "Changed tests");
    await expect(storySummary(intent).getByRole("status")).toHaveText(
      "No comparison is available.",
    );
    await expect(toggle).toHaveCount(0);
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await development.click();
    await card.getByRole("heading", { level: 3 }).click();
    await expectSelected(card, true);
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await expectStoryTab(intent, "CI comparison");
    await chooseStoryTab(intent, "Changed tests");
    await expect(toggle).not.toBeChecked();
    await expectStoryExpansion(intent);
    await expect(folderToggle(intent, "other", false)).toBeVisible();
    await expect(intentFile(intent, kept)).toBeVisible();
  });
});

test("a story that changed only product code says Selected story only has no test files in Intent locations, with the count outside", async ({
  page,
  origin,
}) => {
  const { intent } = await selectTakenStoryInIntent(
    page,
    origin,
    changeProductOnly,
  );
  const none = intent.locator(".intent-story-none");
  await expect(
    (await storyHeaderDetail(intent)).locator(".intent-story-revisions"),
  ).toBeVisible();
  const toggle = storyOnly(intent);
  await expect(toggle).not.toBeChecked();
  await expectOutsideCount(intent, 1);
  await expect(none).toHaveCount(0);
  await expect(intent.locator("[data-kind]")).toHaveCount(0);
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "false",
  );

  await toggle.check();
  await expect(none).toHaveText(
    "No test files in Intent locations changed in this story",
  );
  await expectOutsideCount(intent, 1);
  await expect(intent.locator("section.intent-location")).toHaveCount(0);

  await toggle.uncheck();
  await expect(none).toHaveCount(0);
  await expect(intent.locator("section.intent-location")).toHaveCount(2);
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("Selected story only stays on through a new trunk revision and Show latest", async ({
  page,
  origin,
}) => {
  await pausePageClock(page);
  const { intent } = await selectTakenStoryInIntent(
    page,
    origin,
    changeIntentTests,
    true,
  );
  const toggle = storyOnly(intent);
  await toggle.check();
  await expectStoryExpansion(intent);

  writeAt(origin.project, "docs/later.md", "later\n");
  commitAll(origin.project, "a later trunk change");
  git(origin.project, "push", "--quiet", "origin", "main");
  const later = (await origin.originGit("rev-parse", "main")).trim();
  await passTimeUntilCheckedAfterSettled(page);
  await untilPageReadsAnswered(page);
  await expect(parts(page).status).toContainText(
    `Published work read at revision ${shortRevision(later)}`,
  );
  const notice = revisionNotice(intent);
  await expect(notice).toHaveCount(1);
  await expect(toggle).toBeChecked();
  await expectStoryExpansion(intent);

  await notice.getByRole("button", { name: "Show latest" }).click();
  await expect(notice).toHaveCount(0);
  await expect(toggle).toBeChecked();
  await expectStoryExpansion(intent);
  await expect(
    intentFile(intent, "dashboard/tests/other/c.spec.ts"),
  ).toHaveCount(0);
});
