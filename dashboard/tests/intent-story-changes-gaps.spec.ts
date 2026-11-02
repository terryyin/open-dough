// Example 6 and a failed read: a selected story whose comparison Intent
// cannot show never reads as a story without changes. An active story with
// no workspace on this machine says no comparison is available; a review
// read that fails says so with a retry, which then shows the story's
// changes. Either way the published tree stays usable beneath, without
// change marks, an outside count, or a "Selected story only" toggle, which
// would have no changes to show only; the retried read offers it, off. The
// highlighted journey:
// ./intent-story-changes.spec.ts.

import type { Locator } from "@playwright/test";
import { storyReviewEndpoint } from "../src/storyReviewContract.ts";
import { parts } from "./dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { expectSelected } from "./storyCardSelection.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  intentFile,
  lens,
  selectTakenStoryInIntent,
  storyOnly,
} from "./support/intentStoryPage.ts";
import { changed, publishIntentTrunk } from "./support/intentStoryWorktree.ts";
import { openBacklog } from "./support/sessionDialog.ts";

test.setTimeout(120_000);

// The published tree shows as without a story: no change marks, no outside
// count, no toggle, no claim that nothing changed, and a file reads its
// source.
async function expectPublishedTreeUsable(intent: Locator) {
  await expect(storyOnly(intent)).toHaveCount(0);
  await expect(intent.locator("[data-kind]")).toHaveCount(0);
  await expect(intent.locator("[data-contains-changes]")).toHaveCount(0);
  await expect(intent.locator(".intent-story-outside")).toHaveCount(0);
  await expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0);
  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  await expect(
    intentFile(intent, "dashboard/tests/boundary/kept.spec.ts"),
  ).toBeVisible();
  await intentFile(intent, "dashboard/tests/a.spec.ts").click();
  await expect(intent.getByRole("region", { name: "Purpose" })).toContainText(
    "a 11",
  );
}

test("an active story with no workspace explains that no comparison is available and leaves the tree usable", async ({
  page,
  origin,
}) => {
  publishIntentTrunk(origin.project);
  const card = await openBacklog(page, origin);
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  const scoped = lens(intent);
  await expect(scoped.locator(".intent-story-name")).toHaveText(
    "Story Story A SEED-A#a",
  );
  await expect(scoped.locator(".intent-story-problem")).toHaveText(
    "No comparison is available for this story: no workspace on this machine holds it. Intent shows the published tree without the story's changes.",
  );
  await expect(scoped.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(scoped.locator(".intent-story-revisions")).toHaveCount(0);
  await expectPublishedTreeUsable(intent);
});

test("a failed comparison read explains itself with a retry that then shows the story's changes", async ({
  page,
  origin,
}) => {
  let failing = true;
  await page.route(
    (url) => url.pathname === storyReviewEndpoint,
    async (route) => {
      if (!failing) {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "The worktree could not be read." }),
      });
    },
  );
  const { intent } = await selectTakenStoryInIntent(page, origin);
  const scoped = lens(intent);
  const problem = scoped.getByRole("alert");
  await expect(problem).toHaveText(
    "The story's changes could not be read: The worktree could not be read. Intent shows the published tree without them. Retry",
  );
  await expect(scoped.locator(".intent-story-revisions")).toHaveCount(0);
  await expectPublishedTreeUsable(intent);

  failing = false;
  await problem.getByRole("button", { name: "Retry" }).click();
  await expect(scoped.locator(".intent-story-revisions")).toBeVisible();
  await expect(problem).toHaveCount(0);
  await expect(storyOnly(intent)).not.toBeChecked();
  await expect(intent.locator(".intent-story-outside")).toContainText(
    "2 changed files outside Intent locations",
  );
  await expect(intentFile(intent, changed.modified)).toBeVisible();
  await expect(intentFile(intent, changed.added)).toBeVisible();
});
