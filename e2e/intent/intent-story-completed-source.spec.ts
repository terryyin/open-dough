import { reviewRegion } from "../../dashboard/tests/support/storyReviewMark.ts";
import { reviewChanges } from "../../dashboard/tests/storyCardControls.ts";
import { filesColumn } from "../../dashboard/tests/intentModePage.ts";
import { sourceRevision } from "../../dashboard/tests/intentCodeBrowsePage.ts";
// A Done story's historical source comes from its landing, even after trunk
// changes tests and removes settings. Unrecoverable history never borrows the
// current tree; an available saved coverage report remains independently useful.
// Real CLI completion and publication: ../../dashboard/tests/support/intentCompletedStory.ts.
// Changed-file overlay and Review equality: ./intent-story-completed.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import {
  completedChanges as changed,
  selectCompletedStoryInIntent,
} from "../../dashboard/tests/support/intentCompletedStory.ts";
import {
  chooseStoryTab,
  intentDiff,
  intentFile,
  outsideCount,
  storyHeaderDetail,
  storyOnly,
  storySummary,
  storyTitle,
  storyHeaderReading,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import { lines } from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";

// Why a shallow checkout's published history yields no comparison.
const unrecoverable =
  "Published execution history does not establish a complete claim and its attributed commits for this completion.";

test("a Done story keeps landing locations, inventory and unchanged source after trunk renames and deletes tests and removes settings", async ({
  page,
  origin,
}) => {
  const later = makeMe.aRepository
    .withRevision("later", {
      backlog: null,
      remove: [
        ".planning/open-dough.json",
        "dashboard/tests/a.spec.ts",
        "dashboard/tests/boundary/b.spec.ts",
        "dashboard/tests/other/c.spec.ts",
      ],
      files: {
        "dashboard/tests/current-a.spec.ts": `${lines("a")}current only\n`,
        "dashboard/tests/later.spec.ts": "later-only test\n",
        "dashboard/tests/boundary/kept.spec.ts": "rewritten after landing\n",
      },
    })
    .please().revisions[0];
  const locations: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    )
      locations.push(url.searchParams.get("revision") ?? "");
  });
  const { intent, completion } = await selectCompletedStoryInIntent(
    page,
    origin,
    { later },
  );
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await expect(intentFile(intent, changed.modified)).toBeVisible();
  await expect(intentFile(intent, changed.added)).toBeVisible();
  await expect(intentFile(intent, changed.deleted)).toBeVisible();
  await expect(intentFile(intent, "dashboard/tests/later.spec.ts")).toHaveCount(
    0,
  );
  await expect(
    intentFile(intent, "dashboard/tests/current-a.spec.ts"),
  ).toHaveCount(0);
  expect(locations).toContain(completion);
  await intentFile(intent, "dashboard/tests/boundary/kept.spec.ts").click();
  await expect(purposeRegion(intent)).toContainText("kept 11");
  await expect(purposeRegion(intent)).not.toContainText(
    "rewritten after landing",
  );
  await expect(
    sourceRevision(intent, "dashboard/tests/boundary/kept.spec.ts"),
  ).toContainText(`at revision ${completion.slice(0, 7)}`);
  expect(await intentDiff(intent, changed.modified)).toContain("completed");
  expect(await intentDiff(intent, changed.added)).toContain("added");
  expect(await intentDiff(intent, changed.deleted)).toContain("gone 0");
});

test("a completed story whose comparison cannot be recovered keeps saved coverage and explains unavailable historical source without substituting current tests", async ({
  page,
  origin,
}) => {
  const report =
    "Outcome: Caught\nEvidence: The saved report remains readable without historical test source.\n";
  const saved = makeMe.aDoneRecord.withIntentCoverage({ report }).please();
  if (saved.intentCoverage === undefined)
    throw new Error("The completed story fixture needs its saved assessment.");
  const { card, intent } = await selectCompletedStoryInIntent(page, origin, {
    history: "shallow",
    intentCoverage: saved.intentCoverage,
  });
  const scoped = storySummary(intent);
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(scoped.getByRole("status")).toHaveText(
    "No comparison is available.",
  );
  const detail = await storyHeaderDetail(intent);
  await expect(
    detail.getByRole("heading", { name: "Intent coverage" }),
  ).toHaveCount(0);
  const problem = detail.locator(".intent-story-problem");
  await expect(problem).toHaveText(
    `${unrecoverable} The story's historical test source is unavailable.`,
  );
  await expect(scoped.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(storyHeaderReading(intent).revisions).toHaveCount(0);
  await expect(storyOnly(intent)).toHaveCount(0);
  await expect(intent.locator("[data-kind]")).toHaveCount(0);
  await expect(outsideCount(intent)).toHaveCount(0);
  await expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0);
  await chooseStoryTab(intent, "Changed tests");
  await expect(filesColumn(intent)).toHaveCount(0);
  await expect(
    intent.getByRole("tabpanel", { name: "Changed tests" }),
  ).toContainText(
    "The story's historical Intent locations and test source are unavailable: its landed result could not be established.",
  );
  await chooseStoryTab(intent, "Intent coverage");
  await expect(
    intent
      .getByRole("region", { name: "Intent coverage" })
      .locator(".intent-story-coverage-text"),
  ).toHaveText(report);
  // Review changes gives the completed story the same explanation.
  const { development } = parts(page);
  await development.click();
  await reviewChanges(card).click();
  await expect(reviewRegion(page)).toContainText(unrecoverable);
});
