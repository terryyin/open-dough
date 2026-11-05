// Example 6 and a failed read: a selected story whose comparison Intent
// cannot show never reads as a story without changes. Compact, the summary
// of an active story with no workspace on this machine says no comparison is
// available, and of a review read that fails says so with a retry, which
// then shows the story's changes; expanded, each gives its full
// explanation. Either way the published tree stays usable beneath, without
// change marks, an outside count, or a "Selected story only" toggle, which
// would have no changes to show only; the retried read offers it, off.
// Without configured locations the Intent tab names the story above the
// explanation, and Optimization Candidates and CI status show no summary. The
// highlighted journey:
// ./intent-story-changes.spec.ts.

import type { Locator } from "@playwright/test";
import { storyReviewEndpoint } from "../src/storyReviewContract.ts";
import { parts } from "./dashboardPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import {
  chooseOptimizationCandidates,
  expectIntentModeChosen,
  intentModeTab,
} from "./intentModePage.ts";
import { expectSelected } from "./storyCardSelection.ts";
import { expect, test } from "./support/preparationPage.ts";
import {
  expandStorySummary,
  intentFile,
  selectTakenStoryInIntent,
  storyDisclosure,
  storyOnly,
  storySummary,
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
  const scoped = storySummary(intent);
  await expect(storyDisclosure(intent)).toHaveText("Story Story A");
  await expect(scoped.getByRole("status")).toHaveText(
    "No comparison is available.",
  );
  await expect(scoped.locator(".intent-story-problem")).toBeHidden();
  const detail = await expandStorySummary(intent);
  await expect(detail.locator(".intent-story-problem")).toHaveText(
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
  const scoped = storySummary(intent);
  const problem = scoped.getByRole("alert");
  await expect(problem).toHaveText(
    "The story's changes could not be read. Retry",
  );
  const detail = await expandStorySummary(intent);
  await expect(detail.locator(".intent-story-problem")).toHaveText(
    "The worktree could not be read. Intent shows the published tree without them.",
  );
  await expect(scoped.locator(".intent-story-revisions")).toHaveCount(0);
  await expectPublishedTreeUsable(intent);

  failing = false;
  await problem.getByRole("button", { name: "Retry" }).click();
  await expect(detail.locator(".intent-story-revisions")).toBeVisible();
  await expect(problem).toHaveCount(0);
  await expect(storyOnly(intent)).not.toBeChecked();
  await expect(intent.locator(".intent-story-outside")).toContainText(
    "2 changed files outside Intent locations",
  );
  await expect(intentFile(intent, changed.modified)).toBeVisible();
  await expect(intentFile(intent, changed.added)).toBeVisible();
});

test("without configured Intent locations the Intent tab names the selected story above the explanation, and the other modes show no summary", async ({
  page,
  origin,
}) => {
  const card = await openBacklog(page, origin);
  await card.getByRole("heading", { level: 3 }).click();
  await expectSelected(card, true);
  const { intentChoice, intent } = parts(page);
  await intentChoice.click();
  const panel = intent.getByRole("tabpanel", { name: "Intent" });
  await expect(panel.locator(":scope > *")).toHaveCount(3);
  await expect(panel.locator(":scope > *").first()).toHaveAttribute(
    "aria-label",
    "Selected story",
  );
  await expect(panel.locator(":scope > *").nth(1)).toContainText(
    "No intent locations are configured",
  );
  await expect(panel.locator(":scope > *").nth(2)).toHaveAttribute(
    "aria-label",
    "CI status",
  );
  await expect(storyDisclosure(intent)).toHaveText("Story Story A");
  await expect(storySummary(intent).getByRole("status")).toHaveText(
    "No comparison is available.",
  );
  await expect(storyOnly(intent)).toHaveCount(0);
  await expect(intent.locator(".intent-story-outside")).toHaveCount(0);
  const detail = await expandStorySummary(intent);
  await expect(detail.locator(".intent-story-full-title")).toHaveText(
    "Story A SEED-A#a",
  );

  await chooseOptimizationCandidates(intent);
  await expect(
    intent.getByRole("tabpanel", { name: "Optimization Candidates" }),
  ).toContainText("No intent locations are configured");
  await expect(storySummary(intent)).toHaveCount(0);
  await intentModeTab(intent, "Intent").click();
  await expectIntentModeChosen(intent, "Intent");
  await expect(
    intent.getByRole("region", { name: "CI status", exact: true }),
  ).toBeVisible();
  await expect(storySummary(intent)).toBeVisible();
});
