import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { scopeToggle } from "./intent-browser-page.ts";
import { intentViewTab } from "./intent-candidates-page.ts";
import { developmentCard } from "./intent-ci-development-card-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import {
  changed,
  keptPath,
  modifiedPath,
  openStoryChanges,
  storyChanges,
} from "./intent-story-changes-fixtures.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";

const panel = (name: string) =>
  page.getByRole("tabpanel", { name, exact: true });

async function showsUsablePublishedTree() {
  const story = intentStoryCompare();
  await expect.element(story.onlyChangedFiles).not.toBeInTheDocument();
  await expect.element(story.outsideGroup).not.toBeInTheDocument();
  await expect
    .element(panel("Changes").getByText(/No test files|no changes/i))
    .not.toBeInTheDocument();
  await scopeToggle("dashboard/tests").click();
  await scopeToggle("boundary").click();
  await expect.element(story.file(keptPath)).toBeVisible();
  await story.file(modifiedPath).click();
  await intentFileReading(modifiedPath).shows("a 11");
  expect(
    panel("Changes")
      .element()
      .querySelectorAll("[data-kind], [data-contains-changes]"),
  ).toHaveLength(0);
}

test("a story with no published changes explains that no comparison is available and leaves the tree usable", async () => {
  await openStoryChanges({ hasWorkspace: false });
  const story = intentStoryCompare();
  await expect
    .element(
      story.header.getByRole("heading", { name: "Story A", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(story.header.getByRole("status"))
    .toHaveTextContent("No comparison is available.");
  await expect
    .poll(story.headerText)
    .toContain(
      "No comparison is available for this story: no published changes are recorded. Intent shows the published tree without the story's changes.",
    );
  await expect
    .element(story.header.getByRole("button", { name: "Retry" }))
    .not.toBeInTheDocument();
  expect(story.revisions()).toBe("");
  await story.chooseTab("Changes");
  await showsUsablePublishedTree();
});

test("a failed comparison read explains itself with a retry that then shows the story's changes", async () => {
  let attempts = 0;
  await openStoryChanges({
    review: () => {
      attempts += 1;
      return attempts === 1
        ? Promise.reject(
            new Error("The published comparison could not be read."),
          )
        : Promise.resolve(storyChanges());
    },
  });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");
  await expect
    .poll(story.alertText)
    .toBe("The story's changes could not be read. Retry");
  await expect
    .poll(story.headerText)
    .toContain(
      "The published comparison could not be read. Intent shows the published tree without them.",
    );
  expect(story.revisions()).toBe("");
  await showsUsablePublishedTree();

  await story.retry();
  await expect.poll(story.revisions).toContain("Published story branch");
  await expect.element(story.alert).not.toBeInTheDocument();
  await expect.element(story.onlyChangedFiles).not.toBeChecked();
  for (const name of [changed.product, changed.notes])
    await expect.element(story.outsideFile(name)).toBeVisible();
  for (const name of [changed.modified, changed.added])
    await expect.element(story.file(name)).toBeVisible();
  expect(attempts).toBe(2);
});

test("without configured Intent locations the header names the selected story, CI comparison shows its CI status, Changes the explanation, and Project Intent main's CI status beside it", async () => {
  const mounted = await openStoryChanges({
    hasWorkspace: false,
    hasLocations: false,
  });
  const story = intentStoryCompare();
  const showsExplanation = (view: string) =>
    expect
      .poll(() => panel(view).query()?.textContent)
      .toContain("No Intent locations are configured for Open Dough.");

  await expect
    .element(
      story.header.getByRole("heading", { name: "Story A", exact: true }),
    )
    .toBeVisible();
  await expect
    .element(story.header.getByRole("status"))
    .toHaveTextContent("No comparison is available.");
  await expect
    .element(story.header.getByText("SEED-A#a", { exact: true }))
    .toBeVisible();
  expect(story.header.element().parentElement?.firstElementChild).toBe(
    story.header.element(),
  );
  await expect.element(story.onlyChangedFiles).not.toBeInTheDocument();
  await expect
    .element(story.viewTab("CI comparison"))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(
      panel("CI comparison").getByRole("region", {
        name: "CI status",
        exact: true,
      }),
    )
    .toBeVisible();

  await story.chooseTab("Changes");
  await showsExplanation("Changes");
  await expect
    .element(
      panel("Changes").getByRole("region", { name: "CI status", exact: true }),
    )
    .not.toBeInTheDocument();

  await story.projectIntent.click();
  await expect.element(story.header).not.toBeInTheDocument();
  await showsExplanation("CI status");
  await expect
    .element(
      panel("CI status").getByRole("heading", {
        name: "CI status of main",
        exact: true,
      }),
    )
    .toBeVisible();
  await intentViewTab("Optimization Candidates").click();
  await showsExplanation("Optimization Candidates");

  await story.backToStory.click();
  await expect.element(story.header).toBeVisible();
  await showsExplanation("Changes");

  await mounted.showDevelopment();
  const card = developmentCard("Story A");
  await card.toggle();
  await card.isSelected(false);
  await mounted.showIntent();
  await expect.element(story.header).not.toBeInTheDocument();
  await expect.element(story.backToStory).not.toBeInTheDocument();
  await expect
    .element(intentViewTab("CI status"))
    .toHaveAttribute("aria-selected", "true");
  await showsExplanation("CI status");
  await expect
    .element(
      panel("CI status").getByRole("heading", {
        name: "CI status of main",
        exact: true,
      }),
    )
    .toBeVisible();
});
