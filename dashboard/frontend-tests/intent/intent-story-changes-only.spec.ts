import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { showLatestRevision } from "../../tests/intentReadRecoveryPage.ts";
// The full app keeps changed-tree filtering, expansion and reading across
// story view switches, hidden selection and a Project Intent refresh.
// Explicit service answers own presentation; the real Git overlay remains
// observed in ../../../e2e/intent/intent-story-changes.spec.ts and its siblings.

import type { Locator } from "@playwright/test";
import { parts } from "../../tests/dashboardPage.ts";
import {
  intentGroupToggle,
  revisionNotice,
} from "../../tests/intentPerspectivePage.ts";
import { emptyArea, expectSelected } from "../../tests/storyCardSelection.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import { intentStory } from "../../tests/support/intentStoryPage.ts";
import { changed } from "../../tests/support/intentStoryWorktree.ts";
import { shortRevision } from "../../tests/dashboardParts.ts";
import {
  putFrontendIntentStory,
  answerFrontendIntentChanges,
} from "../../tests/support/frontendIntentStory.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { preholdRevisionStreamSlots } from "../../tests/support/revisionStreamSlots.ts";
import { answerFrontendIntentCi } from "../../tests/support/frontendIntentCi.ts";
import { passTimeUntilChecked } from "../../tests/autoRefreshJourney.ts";
import { untilPageReadsAnswered } from "../../tests/pageRequestNotes.ts";
import {
  openProjectIntent,
  returnToStory,
  openStoryIntent,
} from "../../tests/intentModePage.ts";

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
  const story = intentStory(intent);
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(intentGroupToggle(intent, "tests")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  for (const name of ["arriving", "boundary", "out"])
    await expect(story.folderToggle(name, true)).toBeVisible();
}

test("Selected story only shows just the story's changed files, expanded, and off again the whole tree with its changed folders open", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices);
  await answerFrontendIntentChanges(page);
  const { card, intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  await story.chooseTab("Changed tests");
  const toggle = story.storyOnly();
  const kept = "dashboard/tests/boundary/kept.spec.ts";
  const other = "dashboard/tests/other/c.spec.ts";

  await test.step("on, only the changed files and their folders remain, expanded", async () => {
    await expect(toggle).not.toBeChecked();
    // Arranged by hand, which the toggle's expansion replaces.
    await story.folderToggle("boundary", true).click();
    await story.folderToggle("other", false).click();
    await toggle.check();
    await expectStoryExpansion(intent);
    for (const name of changedInFirstLocation)
      await expect(story.file(name)).toBeVisible();
    for (const name of [kept, other])
      await expect(story.file(name)).toHaveCount(0);
    await expect(story.folderRow("other")).toHaveCount(0);
    await story.expectOutsideCount(2);
    await expect(intent.locator(".intent-story-none")).toHaveCount(0);
  });

  await test.step("visiting Intent coverage and returning keeps the selected file, its reading, the open folders, and the choice", async () => {
    const file = story.file(changed.modified);
    await file.click();
    const diffName = story.diffReading.name;
    await expect(diffName).toHaveText(changed.modified);
    const expectKept = async () => {
      await expect(file).toHaveAttribute("aria-pressed", "true");
      await expect(diffName).toHaveText(changed.modified);
      await expectStoryExpansion(intent);
      await expect(toggle).toBeChecked();
    };
    await expectKept();
    await story.chooseTab("Intent coverage");
    await expect(file).toBeHidden();
    await story.chooseTab("Changed tests");
    await expectKept();
  });

  await test.step("off, the whole tree shows with changed folders open and the rest collapsed", async () => {
    await story.folderToggle("out", true).click();
    await toggle.uncheck();
    await expectStoryExpansion(intent);
    await expect(story.folderToggle("other", false)).toBeVisible();
    await expect(story.file(kept)).toBeVisible();
    await expect(story.file(other)).toBeHidden();
    for (const name of changedInFirstLocation)
      await expect(story.file(name)).toBeVisible();
  });

  await test.step("a story selected while Intent is hidden applies when Intent opens, the toggle off", async () => {
    await story.folderToggle("other", false).click();
    await toggle.check();
    const { development, intentChoice, backlog } = parts(page);
    await development.click();
    await backlog
      .getByRole("article", { name: "Story B" })
      .getByRole("heading", { level: 3 })
      .click();
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-B#b");
    await story.expectTab("CI comparison");
    await story.chooseTab("Changed tests");
    await expect(story.header.status).toHaveText("No comparison is available.");
    await expect(toggle).toHaveCount(0);
    await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await development.click();
    await emptyArea(card).click();
    await expectSelected(card, true);
    await intentChoice.click();
    await expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a");
    await story.expectTab("CI comparison");
    await story.chooseTab("Changed tests");
    await story.expectComparisonRead();
    await expect(toggle).not.toBeChecked();
    await expectStoryExpansion(intent);
    await expect(story.folderToggle("other", false)).toBeVisible();
    await expect(story.file(kept)).toBeVisible();
  });
});

test("a story that changed only product code says Selected story only has no test files in Intent locations, with the count outside", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices);
  await answerFrontendIntentChanges(page, [
    makeMe.aReviewedFile
      .with({ kind: "modified", path: "dashboard/src/App.tsx" })
      .please(),
  ]);
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  await story.chooseTab("Changed tests");
  const none = intent.locator(".intent-story-none");
  await story.headerDetail();
  await expect(story.header.revisions).toBeVisible();
  const toggle = story.storyOnly();
  await expect(toggle).not.toBeChecked();
  await story.expectOutsideCount(1);
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
  await story.expectOutsideCount(1);
  await expect(intent.locator("section.intent-location")).toHaveCount(0);

  await toggle.uncheck();
  await expect(none).toHaveCount(0);
  await expect(intent.locator("section.intent-location")).toHaveCount(2);
  await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("Selected story only stays on through a new trunk revision and refreshing Project Intent", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date("2026-11-05T08:00:00.000Z"));
  await preholdRevisionStreamSlots(page);
  putFrontendIntentStory(frontendServices);
  await answerFrontendIntentChanges(page);
  await answerFrontendIntentCi(page, frontendServices.revision);
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  await story.chooseTab("Changed tests");
  const toggle = story.storyOnly();
  await toggle.check();
  await expectStoryExpansion(intent);

  const later = "e5".repeat(20);
  Object.assign(frontendServices, {
    revision: later,
    locations: { ...frontendServices.locations, revision: later },
  });
  await passTimeUntilChecked(page);
  await untilPageReadsAnswered(page);
  await expect(parts(page).status).toContainText(
    `Published work read at revision ${shortRevision(later)}`,
  );
  const notice = revisionNotice(intent);
  await expect(notice).toHaveCount(0);
  await expect(toggle).toBeChecked();
  await expectStoryExpansion(intent);

  await openProjectIntent(intent);
  await expect(notice).toHaveCount(1);
  await showLatestRevision(notice).click();
  await expect(notice).toHaveCount(0);
  await returnToStory(intent);
  await story.expectTab("Changed tests");
  await expect(toggle).toBeChecked();
  await expectStoryExpansion(intent);
  await expect(story.file("dashboard/tests/other/c.spec.ts")).toHaveCount(0);
});
