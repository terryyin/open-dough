import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentFileReading } from "./intent-file-reading-page.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import { scopeToggle } from "./intent-browser-page.ts";
import {
  firstCompletion,
  locationsOf,
  openDoneReading,
  projectRevision,
  secondCompletion,
  selectSecondStoryInSidebar,
  storyA,
  storyB,
} from "./intent-done-reading-fixture.ts";
import { intentPage } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const firstPath = "dashboard/tests/a.spec.ts";
const secondPath = "second/tests/b.spec.ts";
const secondSource = "Story B historical source";

test("a newly selected Done story shows only its own historical source after held comparison and locations reads", async () => {
  const firstReview = makeMe.aStoryReview
    .published(firstCompletion)
    .modifying("dashboard/src/App.tsx")
    .please();
  const secondReview = makeMe.aStoryReview
    .published(secondCompletion)
    .adding(secondPath)
    .please();
  const heldComparison = heldRead<typeof secondReview>();
  const heldLocations = heldRead<ReturnType<typeof locationsOf>>();
  const revisions: string[] = [];
  await openDoneReading({
    withSecondStory: true,
    review: ({ identity }) => {
      if (identity === storyB.identity) return heldComparison.ask();
      expect(identity).toBe(storyA.identity);
      return Promise.resolve(firstReview);
    },
    readLocations: (...[, revision]) => {
      revisions.push(revision);
      return revision === secondCompletion
        ? heldLocations.ask()
        : Promise.resolve(locationsOf("dashboard/tests", firstPath));
    },
    readFile: (...[, path, revision]) => {
      expect({ path, revision }).toEqual({
        path: firstPath,
        revision: firstCompletion,
      });
      return Promise.resolve("a 11");
    },
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(secondPath, secondSource).please(),
      ),
    fileText: () =>
      Promise.resolve({ kind: "text", baseline: "", tree: secondSource }),
  });
  const story = intentStoryCompare();
  await expect
    .element(intentPage)
    .toHaveAttribute("data-selected-story", storyA.identity);
  await story.browseFiles();
  await scopeToggle("dashboard/tests").click();
  await story.file(firstPath).click();
  const initial = intentFileReading(firstPath);
  await initial.shows("a 11");
  await initial.isAt(firstCompletion);

  const files = () => intentPage.element().querySelector(".intent-locations");
  const purpose = intentPage.getByRole("region", {
    name: "Purpose",
    exact: true,
  });
  await selectSecondStoryInSidebar();
  await expect
    .element(intentPage)
    .toHaveAttribute("data-selected-story", storyB.identity);
  await expect
    .element(story.header.getByRole("heading", { name: storyB.title }))
    .toBeVisible();
  await expect.poll(heldComparison.asked).toBe(true);
  await story.browseFiles();
  await expect
    .element(story.filesReading)
    .toHaveTextContent("Reading the story's historical Intent locations…");
  expect(files()).toBeNull();
  await expect.element(purpose).not.toBeInTheDocument();
  expect(revisions.filter((revision) => revision !== projectRevision)).toEqual([
    firstCompletion,
  ]);

  heldComparison.resolve(secondReview);
  await expect.poll(heldLocations.asked).toBe(true);
  expect(files()).toBeNull();
  await expect.element(purpose).not.toBeInTheDocument();
  heldLocations.resolve(locationsOf("second/tests", secondPath));

  const secondLocation = scopeToggle("second/tests");
  await expect.element(secondLocation).toBeVisible();
  if (secondLocation.element().getAttribute("aria-expanded") === "false")
    await secondLocation.click();
  await expect.element(story.file(firstPath)).not.toBeInTheDocument();
  await story.file(`Added ${secondPath}`).click();
  await expect.poll(story.diffCode).toContain(secondSource);
  expect(story.purposeText()).not.toContain("a 11");
  expect(revisions.filter((revision) => revision !== projectRevision)).toEqual([
    firstCompletion,
    secondCompletion,
  ]);
});
