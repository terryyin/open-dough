// A comparison chosen in Intent's Compare that cannot be read is explained
// where the header explains the story's comparison, never as a story without
// changes, while the other choices stay offered; a failed read offers Retry,
// which reads it again. Explicit service answers own the Git judgment.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  chooseStoryTab,
  intentStory,
} from "../../test-support/support/intentStoryPage.ts";
import {
  putFrontendIntentStory,
  frontendIntentChanges,
} from "../../test-support/support/frontendIntentStory.ts";
import {
  frontendReviewSnapshot,
  installFrontendStoryReview,
} from "../../test-support/support/frontendStoryReview.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { selectDoneStoryForCiComparison } from "../../test-support/support/selectDoneStoryForCiComparison.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openStoryIntent } from "../../test-support/intentModePage.ts";
import {
  storyReviewEndpoint,
  storyReviewRangeEndpoint,
  type StoryReview,
} from "../../src/storyReviewContract.ts";
import type { Page } from "@playwright/test";

const [first, second] = [
  makeMe.aReviewCommit.numbered(1, "first change").please(),
  makeMe.aReviewCommit.numbered(2, "second change").please(),
];
const missing = "The story's commit objects are missing from this machine.";
const unreadable = "The chosen changes could not be read.";

async function openTakenStoryOnCommits(
  page: Page,
  frontendServices: Parameters<typeof putFrontendIntentStory>[0],
) {
  putFrontendIntentStory(frontendServices);
  const review = await installFrontendStoryReview(
    page,
    frontendReviewSnapshot({
      files: frontendIntentChanges,
      commits: [second, first],
    }),
  );
  const { intent } = await openStoryIntent(page, "Story A");
  const story = intentStory(intent);
  await story.chooseTab("Changes");
  await story.headerDetail();
  return { review, story, compare: story.compare() };
}

test("an unavailable commit range is explained in the header, not as a story without changes, and All changes stays offered", async ({
  page,
  frontendServices,
}) => {
  const { review, story, compare } = await openTakenStoryOnCommits(
    page,
    frontendServices,
  );
  review.answerRange({ kind: "unavailable", explanation: missing });

  await test.step("Commits is explained without Retry, not as a story without changes", async () => {
    await compare.choose("Commits");
    await expect(story.header.alert).toHaveText(unreadable);
    await expect(
      story.header.alert.getByRole("button", { name: "Retry" }),
    ).toHaveCount(0);
    await expect(story.header.region).toContainText(missing);
    await expect(story.header.region).not.toContainText(
      "No comparison is available",
    );
  });

  await test.step("CI comparison and Intent coverage say they describe the whole story", async () => {
    for (const name of ["CI comparison", "Intent coverage"] as const) {
      await story.chooseTab(name);
      await expect(story.wholeStoryNote(story.panel(name)), name).toHaveText(
        "Describes the whole story, not the chosen comparison.",
      );
    }
    await story.chooseTab("Changes");
  });

  await test.step("All changes again compares the story", async () => {
    await compare.choose("All changes");
    await expect(story.header.alert).toHaveCount(0);
    await expect(story.header.revisions).toContainText("Compared");
  });
});

test("a failed read of a chosen commit range offers Retry, which reads it again", async ({
  page,
  frontendServices,
}) => {
  const { review, story, compare } = await openTakenStoryOnCommits(
    page,
    frontendServices,
  );
  review.answerRange({
    kind: "comparison",
    from: first.fromTree,
    tree: second.tree,
    trunkIntegrated: false,
    files: frontendIntentChanges,
  });
  await review.failNextRange();
  const rangeAsks = () => review.queriesAsked(storyReviewRangeEndpoint).length;

  await test.step("Commits whose read fails explains the failure", async () => {
    await compare.choose("Commits");
    await expect(story.header.alert).toContainText(unreadable);
    await expect(story.header.region).toContainText(
      "The chosen commits could not be read:",
    );
  });

  await test.step("Retry reads the range again and shows it", async () => {
    const asked = rangeAsks();
    await story.header.alert.getByRole("button", { name: "Retry" }).click();
    await expect(compare.range).toContainText("second change");
    await expect(story.header.alert).toHaveCount(0);
    expect(rangeAsks()).toBeGreaterThan(asked);
  });
});

const run = makeMe.aReviewRun
  .keyed("capture-chosen-run")
  .launchedAt("2026-01-02T12:00:00.000Z")
  .comparing("3".repeat(40), "4".repeat(40))
  .please();

// A Done story offering one captured landed run, its Changes header shown.
async function openDoneStoryWithRun(
  page: Page,
  frontendServices: Parameters<typeof prepareFrontendDoneIntent>[1],
  runAnswer: StoryReview,
) {
  const setup = await prepareFrontendDoneIntent(page, frontendServices);
  setup.review.answerHistoricalSnapshot(setup.identity, {
    ...setup.review.snapshot(),
    runs: [run],
  });
  setup.review.answerRunSnapshot(run.key, runAnswer);
  const { intent } = await selectDoneStoryForCiComparison(page);
  const story = intentStory(intent);
  await chooseStoryTab(intent, "Changes");
  await story.headerDetail();
  return { setup, story, compare: story.compare() };
}

test("a Done story's landed run whose objects are missing is explained, and Published completion stays offered", async ({
  page,
  frontendServices,
}) => {
  const { setup, story, compare } = await openDoneStoryWithRun(
    page,
    frontendServices,
    {
      kind: "unavailable",
      explanation: "The landed run's objects are missing from this machine.",
    },
  );

  await test.step("Landed runs is explained, not as a story without changes", async () => {
    await compare.choose("Landed runs");
    await expect(story.header.alert).toHaveText(unreadable);
    await expect(story.header.region).toContainText(
      "The landed run's objects are missing from this machine.",
    );
    await expect(story.header.region).not.toContainText(
      "No comparison is available",
    );
  });

  await test.step("CI comparison and Intent coverage say they describe the whole story at the measured build", async () => {
    for (const name of ["CI comparison", "Intent coverage"] as const) {
      await story.chooseTab(name);
      const note = story.wholeStoryNote(story.panel(name));
      await expect(note, name).toContainText("Describes the whole story");
      await expect(note.locator("code"), name).toHaveText(
        setup.completion.slice(0, 7),
      );
    }
    await story.chooseTab("Changes");
  });

  await test.step("Published completion again names the completion", async () => {
    await compare.choose("Published completion");
    await expect(story.header.alert).toHaveCount(0);
    await expect(story.header.revisions).toContainText(
      setup.completion.slice(0, 7),
    );
  });
});

test("a failed read of a chosen landed run offers Retry, which reads that run again", async ({
  page,
  frontendServices,
}) => {
  const { setup, story, compare } = await openDoneStoryWithRun(
    page,
    frontendServices,
    makeMe.aStoryReview
      .landed()
      .adding("chosen.txt")
      .onRun(run, [run])
      .please(),
  );
  const runAsks = () =>
    setup.review
      .queriesAsked(storyReviewEndpoint)
      .filter((query) => query.run === run.key).length;
  await setup.review.failNextRunSnapshot(run.key);

  await test.step("Landed runs whose read fails explains the failure", async () => {
    await compare.choose("Landed runs");
    await expect(story.header.alert).toContainText(unreadable);
    await expect(story.header.region).toContainText(
      "The review could not be read:",
    );
  });

  await test.step("Retry reads that run again and lists its changes", async () => {
    const asked = runAsks();
    await story.header.alert.getByRole("button", { name: "Retry" }).click();
    await expect(story.outside).toContainText("chosen.txt");
    await expect(story.header.alert).toHaveCount(0);
    expect(runAsks()).toBeGreaterThan(asked);
  });
});
