import { shortRevision } from "../../dashboard/test-support/dashboardPage.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  commitAllAs,
  push,
  yui,
} from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import {
  openTaken,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import {
  git,
  storyWorktree,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { phoneLaunchTouchViewport } from "../../dashboard/test-support/touchLaunchPage.ts";

test.use({
  originRepository: trunkModeStory({ published: 2, unpublished: true }),
  viewport: phoneLaunchTouchViewport.portrait,
  hasTouch: true,
  reducedMotion: "reduce",
});

test("a Taken Trunk review opens attributed published files at touch width and keeps the selected file on refresh", async ({
  page,
  origin,
}) => {
  let review: IntentReviewChanges;
  const changedFile = "Modified src/a.ts";

  await test.step("Given the reader has no execution worktree", () => {
    git(
      origin.project,
      "worktree",
      "remove",
      "--force",
      storyWorktree(origin).workspace,
    );
  });
  await test.step("When I open the Taken story's Review changes", async () => {
    review = await openIntentReviewChanges(page, await openTaken(page, origin));
  });
  await test.step("Then the review identifies published trunk and its head", async () => {
    await review.expectText("Published trunk");
    await review.expectText(`Head ${shortRevision(origin.revision("s2"))}.`);
  });
  await test.step("And the file list contains only the story's contribution", async () => {
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md"]);
    expect(review.answer).toMatchObject({
      kind: "published-taken",
      mode: "trunk",
    });
  });
  await test.step("When I tap the file also edited by another developer", async () => {
    await review.files.choose(changedFile, "touch");
  });
  await test.step("Then its diff contains the story's line", async () => {
    await review.diffs.expectChangedLines(changedFile, {
      removed: ["-a 0"],
      added: ["+a one"],
    });
  });
  await test.step("When the agent publishes another story file", () => {
    writeAt(origin.project, "more.md", "another published change\n");
    commitAllAs(origin.project, "Continue Story A", yui);
    push(origin.project);
  });
  await test.step("And I refresh the review", async () => {
    review = await review.refreshAndAnswer("keyboard");
  });
  await test.step("Then Refresh keeps focus and the new published file appears", async () => {
    await review.expectRefreshFocused();
    await review.files.expectOutsideRows(["src", "  a.ts", "d.md", "more.md"]);
  });
  await test.step("And the selected file's diff stays open", async () => {
    await review.files.expectSelected(changedFile);
    await review.diffs.expectShows(changedFile, "+a one");
  });
});
