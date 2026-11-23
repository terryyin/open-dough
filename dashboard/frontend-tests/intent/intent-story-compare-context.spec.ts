import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { shortRevision } from "../../src/publishedWork.ts";
import { intentStoryCompare } from "./intent-story-compare-page.ts";
import { openStoryAComparison } from "./intent-story-compare-stories.ts";

test("Intent names the workspace and the trunk baseline less the story's published commits, with its full revision available", async () => {
  const trunk = "d9c8b7a6".repeat(5);
  const snapshot = makeMe.aStoryReview
    .modifying("dashboard/tests/a.spec.ts")
    .subtractingPublishedCommits(2, trunk)
    .please();
  if (snapshot.kind !== "snapshot") throw new Error("Expected a workspace.");
  const { branch, workspace } = snapshot;
  await openStoryAComparison({ review: () => Promise.resolve(snapshot) });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");

  const context = story.workspaceContext;
  const baseline = `Baseline ${trunk} where ${branch} meets origin/main, less the story's 2 published commits`;
  await expect
    .element(context)
    .toHaveAccessibleName(`Branch ${branch} ${baseline} Worktree ${workspace}`);
  await expect.element(context).toHaveAttribute("aria-expanded", "false");
  await expect
    .element(context.getByText(shortRevision(trunk), { exact: true }))
    .toBeVisible();
  await expect
    .poll(() => context.element().textContent)
    .toContain("origin/main less 2 story commits");

  await context.click();
  await expect.element(context).toHaveAttribute("aria-expanded", "true");
  await expect.element(context.getByText(trunk, { exact: true })).toBeVisible();
  await expect.poll(() => context.element().textContent).toContain(baseline);
});

test("Intent names the baseline older Git retains and explains which changes it shows", async () => {
  const snapshot = makeMe.aStoryReview
    .modifying("dashboard/tests/a.spec.ts")
    .keepingPublishedCommits(2)
    .please();
  if (snapshot.kind !== "snapshot") throw new Error("Expected a workspace.");
  const { branch, baseline, workspace } = snapshot;
  await openStoryAComparison({ review: () => Promise.resolve(snapshot) });
  const story = intentStoryCompare();
  await story.chooseTab("Changes");

  const context = story.workspaceContext;
  const kept = story.header.getByText(
    "This machine's Git cannot take the story's 2 published commits out of trunk, so All changes shows only what is not yet published.",
  );
  await expect
    .element(context)
    .toHaveAccessibleName(
      `Branch ${branch} Baseline ${baseline} where ${branch} meets origin/main Worktree ${workspace}`,
    );
  await expect.element(context).toHaveAttribute("aria-expanded", "false");
  await expect
    .element(context.getByText(shortRevision(baseline), { exact: true }))
    .toBeVisible();
  await expect.element(kept).toBeVisible();

  await context.click();
  await expect.element(context).toHaveAttribute("aria-expanded", "true");
  await expect
    .element(context.getByText(baseline, { exact: true }))
    .toBeVisible();
  await expect.element(kept).toBeVisible();
});
