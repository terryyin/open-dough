import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { intentBrowser } from "./intent-browser-page.ts";
import { heldRead } from "./intent-ci-status-fixtures.ts";
import {
  firstCompletion,
  freshRevision,
  locationsOf,
  openDoneReading,
  projectRevision,
  storyA,
} from "./intent-done-reading-fixture.ts";
import { focus, intentPage } from "./intent-file-layout-page.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const path = "dashboard/tests/boundary/deep/long.spec.ts";
const report = "Outcome: Caught\nEvidence: The saved historical assessment.\n";
const historical = [...Array<unknown>(120).keys()].map(
  (line) => `historical ${line + 1}`,
);

test("project refresh returns the same Done historical Purpose file and reading place after cycling all Done tabs, then Proof survives a later Project Intent visit", async () => {
  const reviews: string[] = [];
  const locations: string[] = [];
  const historicalReview = makeMe.aStoryReview
    .published(firstCompletion)
    .adding(path, historical.length)
    .please();
  const refreshComparison = heldRead<typeof historicalReview>();
  const freshLocations = heldRead<ReturnType<typeof locationsOf>>();
  const done = await openDoneReading({
    coverage: report,
    review: ({ identity }) => {
      if (identity !== storyA.identity)
        throw new Error(
          `No Done review arranged for ${identity ?? "an unidentified story"}`,
        );
      reviews.push(identity);
      return reviews.length === 1
        ? Promise.resolve(historicalReview)
        : refreshComparison.ask();
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
  await story.chooseTab("Changes");
  await expect.element(selected).toBeVisible();
  expect(locations).toEqual([firstCompletion]);
  await story.projectIntent.click();
  await browser.isAt(projectRevision);
  await story.backToStory.click();
  await story.chooseTab("Changes");
  await selected.click();
  await expect.poll(story.diffCode).toContain("historical 120");
  const originalDiff = story.diffCode();
  const endpoints = story.revisions();
  expect(endpoints).toContain(`Completion ${firstCompletion}`);
  const offset = await browser.scrollHalfway();

  await done.showFreshWork();
  for (const tab of ["CI comparison", "Intent coverage", "Changes"] as const)
    await story.chooseTab(tab);
  await expect.element(showLatest).not.toBeInTheDocument();
  await expect
    .element(intentPage)
    .toHaveAttribute("data-selected-story", storyA.identity);
  await expect.element(selected).toHaveAttribute("aria-pressed", "true");
  await expect.poll(story.diffCode).toBe(originalDiff);
  await browser.isScrolledTo(offset);
  expect(reviews).toEqual([storyA.identity]);
  expect(locations.filter((revision) => revision !== projectRevision)).toEqual([
    firstCompletion,
  ]);

  await story.projectIntent.click();
  await browser.isAt(projectRevision);
  await showLatest.click();
  await expect.poll(freshLocations.asked).toBe(true);
  focus(story.backToStory);
  await userEvent.keyboard("{Enter}");
  await expect.element(story.projectIntent).toHaveFocus();
  await expect.element(selected).toHaveAttribute("aria-pressed", "true");
  await expect
    .element(readingTab("Purpose"))
    .toHaveAttribute("aria-selected", "true");
  await expect.poll(story.diffCode).toBe(originalDiff);
  await browser.isScrolledTo(offset);
  expect(story.revisions()).toBe(endpoints);
  expect(refreshComparison.asked()).toBe(false);

  freshLocations.resolve(
    locationsOf("dashboard/tests", "dashboard/tests/new.spec.ts"),
  );
  await story.chooseProof();
  await expect
    .element(intentPage.getByRole("region", { name: "Proof", exact: true }))
    .toBeVisible();
  await story.projectIntent.click();
  await browser.isAt(freshRevision);
  await expect.element(showLatest).not.toBeInTheDocument();
  await story.backToStory.click();
  await expect.element(selected).toHaveAttribute("aria-pressed", "true");
  await expect
    .element(readingTab("Proof"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(intentPage.getByRole("region", { name: "Proof", exact: true }))
    .toBeVisible();
  await story.chooseTab("Intent coverage");
  await expect
    .poll(
      () =>
        intentPage.element().querySelector(".intent-story-coverage-text")
          ?.textContent,
    )
    .toBe(report);
  expect(reviews).toEqual([storyA.identity]);
  expect(locations).toEqual([firstCompletion, projectRevision, freshRevision]);
});
