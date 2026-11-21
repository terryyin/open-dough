// The selected story's changed files outside every Intent location, listed
// after the locations in their repository folders, each read as Purpose like a
// located file and kept under "Selected story only"; a Done story lists its
// published completion's the same way. The real Git overlay is observed in
// ../../../e2e/intent/intent-story-changes.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import {
  putFrontendIntentStory,
  answerFrontendIntentChanges,
} from "../../test-support/support/frontendIntentStory.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openStoryIntent } from "../../test-support/intentModePage.ts";
import { prepareFrontendDoneReview } from "../../test-support/support/frontendDoneReview.ts";
import { selectDoneStoryInIntent } from "../../test-support/support/selectDoneStoryInIntent.ts";

const app = "Modified dashboard/src/App.tsx";
const notes = "Renamed docs/notes.md → docs/renamed-notes.md";

test("the changed files outside every Intent location follow the locations, once each, in their open folders", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices);
  await answerFrontendIntentChanges(page);
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);

  await test.step("Given the story's Changed tests", async () => {
    await story.chooseTab("Changed tests");
  });

  await test.step("Then the outside group comes last, listing each outside file once", async () => {
    await expect(story.groups.last()).toHaveText(/^Outside Intent locations/);
    for (const name of [app, notes])
      await expect(story.outsideFile(name)).toBeVisible();
  });

  await test.step("And each row carries its change marker", async () => {
    await expect(story.outsideRow(app)).toHaveAttribute(
      "data-kind",
      "modified",
    );
    await expect(story.outsideRow(notes)).toHaveAttribute(
      "data-kind",
      "renamed",
    );
  });

  await test.step("And their folders holding changes are open", async () => {
    await expect(story.folderToggle("docs", true)).toBeVisible();
  });
});

test("a file outside every Intent location reads its diff as Purpose and stays selected under Selected story only", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices);
  const review = await answerFrontendIntentChanges(page, [
    makeMe.aReviewedFile
      .with({ kind: "modified", path: "dashboard/src/App.tsx" })
      .please(),
  ]);
  review.answerFile(
    frontendFileDiff("dashboard/src/App.tsx", ["+product change"]),
    "dashboard/src/App.tsx",
  );
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);

  await test.step("Given the story's Changed tests", async () => {
    await story.chooseTab("Changed tests");
  });

  await test.step("When the outside file is selected", async () => {
    await story.outsideFile(app).click();
  });

  await test.step("Then its diff reads as Purpose", async () => {
    await expect(story.diffReading.name).toHaveText(app);
    await expect(story.diffReading.container).toContainText("product change");
  });

  await test.step("When Selected story only is turned on", async () => {
    await story.storyOnly().check();
  });

  await test.step("Then the file stays selected with its diff", async () => {
    await expect(story.outsideFile(app)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(story.diffReading.name).toHaveText(app);
  });
});

test("a Done story lists its published completion's product code outside the locations, its diff read as Purpose", async ({
  page,
  frontendServices,
}) => {
  const { review } = await prepareFrontendDoneReview(
    page,
    frontendServices,
    "completed historical test",
  );
  review.answerFile(
    frontendFileDiff("dashboard/src/App.tsx", ["+app change"]),
    "dashboard/src/App.tsx",
  );
  const { intent } = await selectDoneStoryInIntent(page);
  const story = intentStory(intent);

  await test.step("Given the Done story's Changed tests", async () => {
    await story.chooseTab("Changed tests");
  });

  await test.step("Then the outside file's diff reads as Purpose", async () => {
    expect(await story.diff(app)).toContain("app change");
  });
});
