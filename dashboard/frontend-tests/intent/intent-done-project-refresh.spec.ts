import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  chooseWholeProject,
  intentRecentStories,
} from "./intent-recent-stories-page.ts";
import { heldRead, openDoughSource } from "./intent-ci-status-fixtures.ts";
import {
  firstCompletion,
  freshRevision,
  locationsOf,
  openDoneReading,
  projectRevision,
  storyA,
} from "./intent-done-reading-fixture.ts";
import { intentPage } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const path = "dashboard/tests/boundary/deep/long.spec.ts";
const report = "Outcome: Caught\nEvidence: The saved historical assessment.\n";
const historical = [...Array<unknown>(120).keys()].map(
  (line) => `historical ${line + 1}`,
);

test("Done Purpose and Proof keep their historical revision through tab changes while Whole project follows its own revision", async () => {
  const reviews: string[] = [];
  const locations: string[] = [];
  const historicalReview = makeMe.aStoryReview
    .published(firstCompletion)
    .adding(path, historical.length)
    .please();
  const freshLocations = heldRead<ReturnType<typeof locationsOf>>();
  const done = await openDoneReading({
    coverage: report,
    review: ({ identity }) => {
      if (identity !== storyA.identity)
        throw new Error(
          `No Done review arranged for ${identity ?? "an unidentified story"}`,
        );
      reviews.push(identity);
      return Promise.resolve(historicalReview);
    },
    readLocations: (...[, revision]) => {
      locations.push(revision);
      if (revision === freshRevision) return freshLocations.ask();
      return Promise.resolve(
        revision === firstCompletion
          ? locationsOf("dashboard/tests", path)
          : locationsOf("dashboard/tests", "dashboard/tests/current.spec.ts"),
      );
    },
    readFile: () =>
      Promise.reject(
        new Error("The historical diff must not read published text"),
      ),
    fileDiff: () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(path, ...historical).please(),
      ),
    fileText: () =>
      Promise.resolve({
        kind: "text",
        baseline: "",
        tree: historical.join("\n"),
      }),
  });
  const story = intentStoryCompare();
  const browser = intentBrowser();
  const selected = story.file(`Added ${path}`);
  const showLatest = intentPage.getByRole("button", {
    name: "Show latest",
    exact: true,
  });
  const readingTab = (name: string) =>
    intentPage.getByRole("tab", { name, exact: true });
  await story.browseFiles();
  await expect.element(selected).toBeVisible();
  await expect.poll(() => locations).toEqual([firstCompletion]);
  await chooseWholeProject();
  await browser.isAt(projectRevision);
  await intentRecentStories(openDoughSource).chooseRow(storyA.identity);
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await story.browseFiles();
  await selected.click();
  await expect.poll(story.diffCode).toContain("historical 120");
  const originalDiff = story.diffCode();
  const endpoints = story.revisions();
  expect(endpoints).toContain(`Completion ${firstCompletion}`);
  const offset = await browser.scrollHalfway();
  const storyReads = [...reviews];
  const locationReads = [...locations];

  await done.showFreshWork();
  await expect.element(showLatest).not.toBeInTheDocument();
  await expect
    .element(intentPage)
    .toHaveAttribute("data-selected-story", storyA.identity);
  await expect.element(selected).toHaveAttribute("aria-pressed", "true");
  await expect.poll(story.diffCode).toBe(originalDiff);
  await browser.isScrolledTo(offset);
  expect(reviews).toEqual(storyReads);
  expect(locations).toEqual(locationReads);
  await expect
    .element(readingTab("Purpose"))
    .toHaveAttribute("aria-selected", "true");
  expect(story.revisions()).toBe(endpoints);

  await story.chooseProof();
  await story.chooseTab("Intent coverage");
  await expect
    .poll(
      () =>
        intentPage.element().querySelector(".intent-story-coverage-text")
          ?.textContent,
    )
    .toBe(report);
  await selected.click();
  await expect.element(selected).toHaveAttribute("aria-pressed", "true");
  await expect
    .element(readingTab("Proof"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(intentPage.getByRole("region", { name: "Proof", exact: true }))
    .toBeVisible();
  expect(reviews).toEqual(storyReads);

  await chooseWholeProject();
  await browser.isAt(projectRevision);
  await showLatest.click();
  await expect.poll(freshLocations.asked).toBe(true);
  freshLocations.resolve(
    locationsOf("dashboard/tests", "dashboard/tests/new.spec.ts"),
  );
  await browser.isAt(freshRevision);
  await expect.element(showLatest).not.toBeInTheDocument();
  expect(locations).toEqual([...locationReads, freshRevision]);
});
