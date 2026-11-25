// The selected story's comparison summary names the agent a published
// comparison records, with that agent's portrait beside the name when the
// rotation knows it; a landed run, which records no agent, and an agent
// outside the rotation show their attribution without a portrait.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expectOneRow, fileLayout } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import {
  doneCompletion,
  openDoneStoryComparison,
  openStoryAComparison,
} from "./intent-story-compare-stories.ts";
import {
  landedRun,
  landedRunLaunched,
  openWithLandedRun,
} from "./intent-story-landed-run-stories.ts";

test("a published comparison by a rotation agent shows the agent's portrait beside its attribution", async () => {
  await openStoryAComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview.by("Kaoru-chan").adding("a.ts").please(),
      ),
  });
  const story = intentStoryCompare();

  await expect.poll(story.summaryText).toContain("Kaoru-chan");
  await expect.poll(story.summaryPortraitBeside).toBe("Kaoru-chan");
});

test("with landed runs offered at 1280 px, the files toggle, the choice, Include merged changes and the summary with the agent's portrait share one row", async () => {
  await openWithLandedRun({ agent: "Kaoru-chan" });
  await page.viewport(1280, 800);
  const story = intentStoryCompare();
  await expect.poll(story.summaryPortraitBeside).toBe("Kaoru-chan");

  expectOneRow(
    fileLayout().toggle,
    story.choice("Published completion"),
    story.includeMerged,
    story.summary,
  );
});

test("an agent outside the rotation shows its attribution without a portrait", async () => {
  await openDoneStoryComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .published(doneCompletion)
          .by("claude")
          .adding("a.ts")
          .please(),
      ),
  });
  const story = intentStoryCompare();

  await expect
    .poll(story.summaryText)
    .toContain("Published completion — 1 changed file");
  await expect.poll(story.summaryText).toContain("claude");
  expect(story.summaryPortraitBeside()).toBeUndefined();
});

test("a landed run records no agent: the summary names the run without a portrait", async () => {
  await openDoneStoryComparison({
    review: () =>
      Promise.resolve(
        makeMe.aStoryReview
          .landed()
          .adding("landed.txt")
          .onRun(landedRun)
          .please(),
      ),
  });
  const story = intentStoryCompare();

  await expect.poll(story.summaryText).toContain(landedRunLaunched);
  expect(story.summaryPortraitBeside()).toBeUndefined();
});
