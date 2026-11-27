import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentLocation } from "../../src/authenticatedIntentRead.ts";
import type { ReviewSource } from "../../src/reviewSource.ts";
import type { StoryReview } from "../../src/storyReviewContract.ts";
import { unanswered } from "../../test-support/support/waitUntil.ts";
import { scopeName, scopeToggle } from "./intent-browser-page.ts";
import { openDoughSource } from "./intent-ci-status-fixtures.ts";
import { intentReadsPublishing } from "./intent-revision-fixtures.ts";
import {
  activateComparisonControl,
  comparisonRead,
  intentStoryCompare,
} from "./intent-story-compare-page.ts";
import { mountStoryIntent } from "./intent-story-perspective.tsx";

async function mountStoryTree(
  location: IntentLocation,
  review: StoryReview,
  fileDiff: ReviewSource["fileDiff"] = unanswered,
) {
  const story = {
    identity: "SEED-1#folder-selection",
    title: "Folder selection",
    branch: "claude/folder-selection",
  };
  const { id: source } = openDoughSource;
  await mountStoryIntent({
    identity: story.identity,
    work: makeMe.aPublishedWork
      .of(openDoughSource)
      .at("a1".repeat(20))
      .taking(story)
      .please(),
    machine: makeMe.aMachineAnswer
      .holdingWorkspaces({
        source,
        identity: story.identity,
        agent: "claude",
        workspace: "/tmp/folder-selection",
        branch: story.branch,
      })
      .please(),
    reads: {
      intent: intentReadsPublishing(
        makeMe.anIntentLocationsAnswer.locating(location).please(),
        {},
      ),
      review: {
        review: () => Promise.resolve(review),
        fileDiff,
        fileText: unanswered,
      },
    },
  });
  return intentStoryCompare();
}

const heading = (name: string) =>
  page.getByRole("heading", { name, exact: true });
const summary = () =>
  page.getByRole("region", { name: "Summary", exact: true });
function folderSelected(name: string) {
  expect(scopeName(name).element()).toHaveAttribute("aria-pressed", "true");
}

function folderExpanded(name: string, expanded: boolean) {
  expect(scopeToggle(name).element()).toHaveAttribute(
    "aria-expanded",
    String(expanded),
  );
}

async function readFolder(name: string, path: string) {
  await activateComparisonControl(scopeName(name));
  await expect.element(heading(path), { interval: 5 }).toBeVisible();
  folderSelected(name);
}

async function readSummary(name: string, path: string, count: string) {
  await activateComparisonControl(scopeName(name));
  await expect
    .element(summary().getByText(path, { exact: true }), { interval: 5 })
    .toBeVisible();
  expect(summary().getByText(count, { exact: true }).element()).toBeVisible();
  folderSelected(name);
}

test("folder names select a reading by keyboard independently of their disclosure", async () => {
  const root = "dashboard/tests";
  const modified = `${root}/a.spec.ts`;
  const productPath = "dashboard/src/components/view/notes.txt";
  const story = await mountStoryTree(
    makeMe.anIntentLocation
      .at(root)
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting(modified, `${root}/boundary/kept.spec.ts`)
      .please(),
    makeMe.aStoryReview.modifying(modified).modifying(productPath).please(),
    () =>
      Promise.resolve(
        makeMe.aReviewedFileDiff.adding(productPath, "changed source").please(),
      ),
  );
  await activateComparisonControl(story.changesOnly);
  await activateComparisonControl(story.file(`Modified ${productPath}`));
  await comparisonRead(story.diffName).toBe(`Modified ${productPath}`);
  const revisions = story.revisions();

  const openDisclosure = story.folderToggle("src", true);
  await activateComparisonControl(openDisclosure);
  await expect
    .element(story.folderToggle("src", false), { interval: 5 })
    .toBeVisible();
  const folderName = scopeName("src");
  (folderName.element() as HTMLButtonElement).focus();
  // A real Enter exercises the folder name's native keyboard activation.
  await userEvent.keyboard("{Enter}");
  await expect.element(heading("dashboard/src"), { interval: 5 }).toBeVisible();
  folderSelected("src");
  expect(story.diffName()).toBe("");
  folderExpanded("src", false);

  await activateComparisonControl(story.folderToggle("src", false));
  await expect.element(openDisclosure, { interval: 5 }).toBeVisible();
  folderSelected("src");
  await readFolder("components", "dashboard/src/components");
  await readFolder("view", "dashboard/src/components/view");

  await readSummary(root, root, "2 files");
  await readSummary("boundary", `${root}/boundary`, "1 file");
  folderExpanded("boundary", false);
  expect(story.revisions()).toBe(revisions);
});

test("a configured root with no matching files still opens its Summary", async () => {
  const root = "tools/quality/checks";
  const story = await mountStoryTree(
    makeMe.anIntentLocation
      .at(root)
      .ofKind("typescript", ["**/*.spec.ts"])
      .selecting()
      .please(),
    makeMe.aStoryReview.modifying("tools/README.md").please(),
  );
  await activateComparisonControl(story.changesOnly);
  await readSummary(root, root, "0 files");
  folderExpanded(root, false);
});
