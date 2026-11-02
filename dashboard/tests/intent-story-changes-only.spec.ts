// Example 2 and 4: "Selected story only" over a selected story's overlay
// (./support/intentStoryWorktree.ts). Off at first; on, only the in-scope
// changed files and their folders remain, expanded; off again, the whole
// tree, with the changed folders open and the rest collapsed, however they
// were arranged by hand in between. Intent unmounts while hidden, so a story
// selected in Development applies its expansion, with the toggle off, the
// next time Intent opens. A story that changed only product code says no
// test file in a location changed, with the count outside. The highlighted
// journey: ./intent-story-changes.spec.ts.

import type { Locator } from "@playwright/test";
import { parts } from "./dashboardPage.ts";
import { intentGroupToggle } from "./intentPerspectivePage.ts";
import { expectSelected } from "./storyCardSelection.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  folderCaret,
  folderRow,
  intentFile,
  lens,
  selectTakenStoryInIntent,
  storyOnly,
} from "./support/intentStoryPage.ts";
import { changed, changeProductOnly } from "./support/intentStoryWorktree.ts";

test.setTimeout(120_000);

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
    await expect(folderCaret(intent, name, true)).toBeVisible();
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
    await folderCaret(intent, "boundary", true).click();
    await folderCaret(intent, "other", false).click();
    await toggle.check();
    await expectStoryExpansion(intent);
    for (const name of changedInFirstLocation)
      await expect(intentFile(intent, name)).toBeVisible();
    for (const name of [kept, other])
      await expect(intentFile(intent, name)).toHaveCount(0);
    await expect(folderRow(intent, "other")).toHaveCount(0);
    await expect(intent.locator(".intent-story-outside")).toContainText(
      "2 changed files outside Intent locations",
    );
    await expect(intent.locator(".intent-story-none")).toHaveCount(0);
  });

  await test.step("off, the whole tree shows with changed folders open and the rest collapsed", async () => {
    await folderCaret(intent, "out", true).click();
    await toggle.uncheck();
    await expectStoryExpansion(intent);
    await expect(folderCaret(intent, "other", false)).toBeVisible();
    await expect(intentFile(intent, kept)).toBeVisible();
    await expect(intentFile(intent, other)).toBeHidden();
    for (const name of changedInFirstLocation)
      await expect(intentFile(intent, name)).toBeVisible();
  });

  await test.step("a story selected while Intent is hidden applies when Intent opens, the toggle off", async () => {
    await folderCaret(intent, "other", false).click();
    await toggle.check();
    const { development, intentChoice, backlog } = parts(page);
    await development.click();
    await backlog
      .getByRole("article", { name: "Story B" })
      .getByRole("heading", { level: 3 })
      .click();
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-B#b");
    await expect(lens(intent).locator(".intent-story-problem")).toBeVisible();
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
    await expect(toggle).not.toBeChecked();
    await expectStoryExpansion(intent);
    await expect(folderCaret(intent, "other", false)).toBeVisible();
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
  const outside = intent.locator(".intent-story-outside");
  const none = intent.locator(".intent-story-none");
  await expect(lens(intent).locator(".intent-story-revisions")).toBeVisible();
  const toggle = storyOnly(intent);
  await expect(toggle).not.toBeChecked();
  await expect(outside).toHaveText(
    "1 changed file outside Intent locations is shown in Review changes. Review changes",
  );
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
  await expect(outside).toHaveText(
    "1 changed file outside Intent locations is shown in Review changes. Review changes",
  );
  await expect(intent.locator("section.intent-location")).toHaveCount(0);

  await toggle.uncheck();
  await expect(none).toHaveCount(0);
  await expect(intent.locator("section.intent-location")).toHaveCount(2);
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
