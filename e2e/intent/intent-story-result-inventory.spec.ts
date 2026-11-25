import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../Distribution/tests/support/repository-revision-files.mjs";
import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
import { purposeRegion } from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  completedChanges,
  selectCompletedStoryInIntent,
} from "../../dashboard/test-support/support/intentCompletedStory.ts";
import { intentStory } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { commitAll } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { push } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";

test("a published story without Intent locations can browse unchanged source and its changed diff", async ({
  page,
  origin,
}) => {
  const noLocations = makeMe.aRepository
    .withRevision("without-locations", {
      backlog: null,
      remove: [".planning/open-dough.json"],
    })
    .please().revisions[0];
  const { intent, completion } = await selectCompletedStoryInIntent(
    page,
    origin,
    {
      beforeStory(project) {
        writeRevisionFiles(project, noLocations);
        commitAll(project, "publish without Intent locations");
        push(project);
      },
    },
  );
  const story = intentStory(intent);
  const path = "docs/notes.md";
  await story.chooseTab("Changes");
  await expect(story.panel("Changes")).toContainText(
    "No Intent locations are configured",
  );
  await story.expandFolderPath("docs");
  await story.file(path).click();
  await expect(purposeRegion(intent)).toContainText("notes 11");
  await expect(sourceRevision(intent, path)).toContainText(
    completion.slice(0, 7),
  );
  await story.expandFolderPath("dashboard/tests");
  expect(await story.diff(completedChanges.modified)).toContain("completed");
});
