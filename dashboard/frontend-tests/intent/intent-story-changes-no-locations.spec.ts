// A project without configured Intent locations: the selected story's Changes
// still lists every changed file, all outside, in their repository folders,
// each reading its diff, under the explanation that no locations are
// configured. A Taken story no workspace here holds, or whose claim several
// worktrees hold, keeps its explanation, without a Retry as today. Settings
// problems and a failed read keep theirs:
// ./intent-gherkin-settings-problems.spec.ts and
// ./intent-story-changes-gaps.spec.ts.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import type { Page } from "@playwright/test";
import {
  frontendFileDiff,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import {
  putFrontendIntentStory,
  answerFrontendIntentChanges,
} from "../../test-support/support/frontendIntentStory.ts";
import { openStoryIntent } from "../../test-support/intentModePage.ts";

const app = "Modified dashboard/src/App.tsx";
const notes = "Renamed docs/notes.md → docs/renamed-notes.md";

test("without configured Intent locations the story's Changes lists its changed files, each reading its diff, beside the explanation", async ({
  page,
  frontendServices,
}) => {
  putFrontendIntentStory(frontendServices, { locations: false });
  const review = await answerFrontendIntentChanges(page);
  review.answerFile(
    frontendFileDiff("dashboard/src/App.tsx", ["+product change"]),
    "dashboard/src/App.tsx",
  );
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);

  await test.step("Given the story's Changes", async () => {
    await story.chooseTab("Changes");
  });

  await test.step("Then it still says no locations are configured", async () => {
    await expect(story.panel("Changes")).toContainText(
      "No intent locations are configured",
    );
  });

  await test.step("And lists the changed files in their repository folders", async () => {
    for (const name of [app, notes, "Modified dashboard/tests/a.spec.ts"])
      await expect(story.outsideFile(name)).toBeVisible();
    await expect(story.folderToggle("docs", true)).toBeVisible();
  });

  await test.step("And a selected file reads its diff", async () => {
    expect(await story.outsideDiff(app)).toContain("product change");
  });
});

// The selected story's Changes, opened.
async function openChanges(page: Page) {
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  await story.chooseTab("Changes");
  return story;
}

type StoryChanges = Awaited<ReturnType<typeof openChanges>>;

// The story's Changes header: its state, its full explanation, no Retry.
async function expectUnavailableChanges(
  story: StoryChanges,
  explanation: string,
) {
  await expect(story.header.status).toHaveText("No comparison is available.");
  const detail = await story.headerDetail();
  await expect(detail.locator(".intent-story-problem")).toHaveText(
    `${explanation} Intent shows the published tree without the story's changes.`,
  );
  await expect(
    story.summary.getByRole("button", { name: "Retry" }),
  ).toHaveCount(0);
}

test("a Taken story no workspace on this machine holds keeps its explanation in Changes", async ({
  page,
  frontendServices,
}) => {
  let story: StoryChanges;

  await test.step("Given a Taken story without a workspace here", () => {
    putFrontendIntentStory(frontendServices, { workspace: false });
  });

  await test.step("When its Changes opens", async () => {
    story = await openChanges(page);
  });

  await test.step("Then Changes explains that no comparison is available", async () => {
    await expectUnavailableChanges(
      story,
      "No comparison is available for this story: no workspace on this machine holds it.",
    );
  });
});

test("a story whose claim several worktrees hold keeps the review's explanation in Changes", async ({
  page,
  frontendServices,
}) => {
  const explanation =
    "Several worktrees on this machine hold this story's claim for Yui-chan: ~/a, ~/b. The review cannot choose one.";
  let story: StoryChanges;

  await test.step("Given the review refuses to choose a worktree", async () => {
    putFrontendIntentStory(frontendServices);
    await installFrontendStoryReview(page, {
      kind: "unavailable",
      explanation,
    });
  });

  await test.step("When its Changes opens", async () => {
    story = await openChanges(page);
  });

  await test.step("Then Changes shows its explanation", async () => {
    await expectUnavailableChanges(story, explanation);
  });
});
