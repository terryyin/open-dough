// Proof of a changed file outside every Intent location
// (../../src/IntentFileProofView.tsx): with the story's CI comparison usable,
// it names that comparison and says the file has no file-level CI evidence.
// Its scrolled diff keeps its place through Proof and through the story's CI
// comparison (../../src/IntentFileReading.tsx). A changed test's Proof is
// intent-summary-story-comparison-file.spec.ts's.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  comparisonLabels,
  expectEvidenceLabels,
} from "../../test-support/ciEvidenceLabelsPage.ts";
import {
  fileReadingTab,
  proofRegion,
} from "../../test-support/intentPerspectivePage.ts";
import {
  chooseReadingTabInPlace,
  intentReadingScroll,
  scrollIntentReadingHalfway,
} from "../../test-support/intentReadingPlacePage.ts";
import { untilPageReadsAnswered } from "../../test-support/pageRequestNotes.ts";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { prepareFrontendDoneIntent } from "../../test-support/support/frontendIntentDoneStory.ts";
import { frontendFileDiff } from "../../test-support/support/frontendStoryReview.ts";
import { intentStory } from "../../test-support/support/intentStoryPage.ts";
import { selectDoneStoryForChangedTests } from "../../test-support/support/selectDoneStoryForSummaryComparison.ts";

const landing = "dashboard/src/landing.ts";
const landingFile = `Modified ${landing}`;

test("an outside file's Proof names the story's CI comparison and says it has no file-level CI evidence, and its scrolled diff keeps its place", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const setup = await prepareFrontendDoneIntent(
    page,
    frontendServices,
    undefined,
    {
      comparison: (story) =>
        story.withChanged(
          makeMe.aReviewedFile
            .with({ kind: "modified", path: landing })
            .please(),
        ),
    },
  );
  setup.review.answerFile(
    frontendFileDiff(
      landing,
      [...Array(200).keys()].map((at) => `landing line ${String(at)}`),
    ),
    landing,
  );
  const { intent } = await selectDoneStoryForChangedTests(page);
  const story = intentStory(intent);
  let offset = 0;

  await test.step("Given the outside file's diff scrolled halfway", async () => {
    await story.outsideDiff(landingFile);
    offset = await scrollIntentReadingHalfway(intent);
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });

  await test.step("When its Proof is read", async () => {
    await chooseReadingTabInPlace(intent, "Proof");
    await untilPageReadsAnswered(page);
  });

  await test.step("Then Proof names the story's CI comparison and says the file has no file-level CI evidence", async () => {
    await expectEvidenceLabels(
      comparisonLabels(proofRegion(intent), setup.identity),
      ["Baseline No build aaaaaaa", "Branch bbbbbbb", "Landed ccccccc"],
    );
    await expect(proofRegion(intent)).toContainText(
      "No file-level CI evidence for this file.",
    );
    await expect(proofRegion(intent).getByRole("table")).toHaveCount(0);
  });

  await test.step("When Purpose is chosen again", async () => {
    await chooseReadingTabInPlace(intent, "Purpose");
  });

  await test.step("Then the diff shows the same place", async () => {
    await expect(story.diffReading.name).toHaveText(landingFile);
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });

  await test.step("When the story's CI comparison is read and Changed tests chosen again", async () => {
    await story.chooseTab("CI comparison");
    await story.chooseTab("Changed tests");
  });

  await test.step("Then the same file's diff shows the same place", async () => {
    await expect(fileReadingTab(intent, "Purpose")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(story.diffReading.name).toHaveText(landingFile);
    await expect.poll(() => intentReadingScroll(intent)).toBe(offset);
  });
});
