import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../Distribution/tests/support/repository-revision-files.mjs";
import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
import { purposeRegion } from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  completedChanges,
  selectCompletedStoryInIntent,
} from "../../dashboard/test-support/support/intentCompletedStory.ts";
import { intentStory } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { push } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";

const guide = "docs/notes.md";

// Trunk drops its Intent locations before the story is claimed.
function publishWithoutLocations(project: string) {
  writeRevisionFiles(
    project,
    makeMe.aRepository
      .withRevision("without-locations", {
        backlog: null,
        remove: [".planning/open-dough.json"],
      })
      .please().revisions[0],
  );
  makeMe
    .theWorkspace(project)
    .commitAll("publish without Intent locations")
    .please();
  push(project);
}

test("a published story without Intent locations can browse unchanged source and its changed diff", async ({
  page,
  origin,
}) => {
  const { intent, completion, story } =
    await test.step("Given a Done story published without Intent locations", async () => {
      const selected = await selectCompletedStoryInIntent(page, origin, {
        beforeStory: publishWithoutLocations,
      });
      return { ...selected, story: intentStory(selected.intent) };
    });
  await test.step("When I browse the story's files", () => story.browseFiles());
  await test.step("Then the inventory says no Intent locations are configured", () =>
    expect(story.files).toContainText("No Intent locations are configured"));
  await test.step("When I open the unchanged guide from the repository listing", async () => {
    await story.listRevision();
    await story.expandFolderPath("docs");
    await story.file(guide).click();
  });
  await test.step("Then its Purpose reads the guide's source at the completion", async () => {
    await expect(purposeRegion(intent)).toContainText("notes 11");
    await expect(sourceRevision(intent, guide)).toContainText(
      completion.slice(0, 7),
    );
  });
  await test.step("And the changed test file's diff shows the completed change", async () => {
    await story.expandFolderPath("dashboard/tests");
    expect(await story.diff(completedChanges.modified)).toContain("completed");
  });
});
