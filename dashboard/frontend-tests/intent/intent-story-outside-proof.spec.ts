import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import {
  activateComparisonControl,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  doneIdentity,
  openDoneStoryComparison,
} from "./intent-story-compare-stories.ts";
import { comparisonLabels } from "./intent-summary-comparison-page.ts";
import { expectEvidenceLabels } from "./intent-summary-evidence-page.ts";

const landing = "dashboard/src/landing.ts";
const landingFile = `Modified ${landing}`;

test("an outside file's Proof names the story's CI comparison, explains missing file evidence and keeps the diff's reading place", async () => {
  await openDoneStoryComparison({
    viewport: { width: 1280, height: 800 },
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .published(doneCompletion)
          .modifying(landing)
          .please(),
      ),
    fileDiff: ({ path }) => {
      if (path !== landing)
        throw new Error(`Unexpected diff path: ${path ?? "missing"}`);
      return Promise.resolve(
        makeMe.aReviewedFileDiff
          .adding(
            path,
            ...Array.from(
              Array<unknown>(200).keys(),
              (index) => `landing line ${index}`,
            ),
          )
          .please(),
      );
    },
  });
  const story = intentStoryCompare();
  await story.browseFiles();
  await activateComparisonControl(story.outsideFile(landingFile));
  await expect.poll(story.diffName).toBe(landingFile);
  await expect.poll(story.diffCode).toContain("landing line 199");
  const offset = await story.scrollReadingHalfway();
  expect(offset).toBeGreaterThan(0);
  await expect.poll(story.readingOffset).toBe(offset);

  await story.chooseProof();
  const proof = page.getByRole("region", { name: "Proof", exact: true });
  await expectEvidenceLabels(comparisonLabels(proof, doneIdentity), [
    "Baseline No build aaaaaaa",
    "Branch bbbbbbb",
    "Landed ccccccc",
  ]);
  await expect
    .element(
      proof.getByText("No file-level CI evidence for this file.", {
        exact: true,
      }),
    )
    .toBeVisible();
  await expect.element(proof.getByRole("table")).not.toBeInTheDocument();

  await story.choosePurpose();
  await expect.poll(story.diffName).toBe(landingFile);
  await expect.poll(story.readingOffset).toBe(offset);
  await story.chooseTab("CI comparison");
  await story.chooseTab("Changes");
  await expect
    .element(page.getByRole("tab", { name: "Purpose", exact: true }))
    .toHaveAttribute("aria-selected", "true");
  await expect.poll(story.diffName).toBe(landingFile);
  await expect.poll(story.readingOffset).toBe(offset);
});
