import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  storyB,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { storyReviewSchema } from "../../dashboard/src/storyReviewContract.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  expectStoryTab,
  openProjectIntent,
  storyTab,
} from "../../dashboard/test-support/intentModePage.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { intentReviewFiles } from "../../dashboard/test-support/intentReviewFiles.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { holdStoryReviewOf } from "../../dashboard/test-support/support/holdReviewResponse.ts";
import { intentSettingsText } from "../../dashboard/test-support/support/intentSettingsFile.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { storyALaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  branch,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

const storyBBranch = "claude/story-b";
test.use({
  originRepository: queuedReadyRepository()
    .withRevision("intent location", {
      files: {
        ".planning/open-dough.json": intentSettingsText(
          makeMe.intentSettings
            .withLocations(
              makeMe.anIntentLocation
                .at("tests")
                .ofKind("typescript", ["*.spec.ts"])
                .please(),
            )
            .please(),
        ),
        "tests/kept.spec.ts": 'test("kept source", async () => {});\n',
      },
    })
    .withWorkspace(branch, { from: "intent location" })
    .withUnpublishedRevision("story A changes", {
      files: {
        "a-first.txt": "first from Story A\n",
        "a-kept.txt": "kept from Story A\n",
        "tests/changed.spec.ts": 'test("changed source", async () => {});\n',
      },
    })
    .withWorkspace(storyBBranch, { from: "intent location" })
    .withUnpublishedRevision("story B changes", {
      files: { "b-first.txt": "first from Story B\n" },
    })
    .please(),
});

test("a delayed card opening cannot choose a file for the next story", async ({
  page,
  dashboard,
  origin,
}) => {
  keepLaunchRecords(dashboard, [
    storyALaunchRecord(storyWorktree(origin).workspace),
    makeMe.aLaunchRecord
      .executing(storyB)
      .onStoryBranch({
        workspace: path.join(origin.project, ".worktrees", "story-b"),
        branch: storyBBranch,
      })
      .please(),
  ]);
  const a = await openBacklog(page, origin);
  const { backlog, development, intent } = parts(page);
  const b = backlog.getByRole("article", { name: storyB.title, exact: true });
  const firstReview = await openIntentReviewChanges(page, a);
  await firstReview.files.choose("Added a-kept.txt");
  await firstReview.diffs.expectLines("added", ["+kept from Story A"]);
  await development.click();

  const first = await holdStoryReviewOf(page, dashboard.origin, queuedIdentity);
  const second = await holdStoryReviewOf(
    page,
    dashboard.origin,
    storyB.identity,
  );
  try {
    await reviewChanges(a).press("Enter");
    await expectStoryTab(intent, "Changes");
    await expect(storyTab(intent, "Changes")).toBeFocused();
    const answer = storyReviewSchema.parse(await (await first.reached).json());
    expect(answer.kind).toBe("snapshot");
    if (answer.kind === "snapshot")
      expect(answer.files.map(({ path }) => path)).toEqual([
        "a-first.txt",
        "a-kept.txt",
        "tests/changed.spec.ts",
      ]);
    await firstReview.diffs.expectAbsent();
    await openProjectIntent(intent);
    await development.click();

    await reviewChanges(b).press("Enter");
    await firstReview.expectStory(storyB.title);
    await expectStoryTab(intent, "Changes");
    await second.reached;
    await first.releaseAndDrain();
    await firstReview.expectFeedback("Reading the story's changes…");
    await firstReview.files.expectNoSelection();
    await firstReview.diffs.expectAbsent();
    await expect(storyTab(intent, "Changes")).toBeFocused();
  } finally {
    await first.releaseAndDrain();
    await second.releaseAndDrain();
  }
  await firstReview.expectStory(storyB.title);
  await firstReview.files.expectSelected("Added b-first.txt");
  await firstReview.diffs.expectLines("added", ["+first from Story B"]);
  await expect(storyTab(intent, "Changes")).toBeFocused();
});

test("choosing a file while the card's comparison is reading keeps that file", async ({
  page,
  dashboard,
  origin,
}) => {
  keepLaunchRecords(dashboard, [
    storyALaunchRecord(storyWorktree(origin).workspace),
  ]);
  const card = await openBacklog(page, origin);
  const { intent } = parts(page);
  const files = intentReviewFiles(intent);
  const held = await holdStoryReviewOf(page, dashboard.origin, queuedIdentity);
  try {
    await reviewChanges(card).press("Enter");
    await expectStoryTab(intent, "Changes");
    await held.reached;
    await expandIntentGroup(intent, "tests");
    await files.choose("tests/kept.spec.ts", "keyboard");
    await files.expectSelected("tests/kept.spec.ts");
  } finally {
    await held.releaseAndDrain();
  }
  await files.expectSelected("tests/kept.spec.ts");
  await expect(purposeRegion(intent)).toContainText('test("kept source"');
  await expect(files.row("tests/kept.spec.ts")).toBeFocused();
});
