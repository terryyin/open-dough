import { reviewRegion } from "../../dashboard/test-support/support/reviewControls.ts";
import { reviewChanges } from "../../dashboard/test-support/storyCardControls.ts";
import { filesColumn } from "../../dashboard/test-support/intentModePage.ts";
import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
// A Done story's historical source comes from its landing, even after trunk
// changes tests and removes settings. Unrecoverable history never borrows the
// current tree; an available saved coverage report remains independently useful.
// Real CLI completion and publication: ../../dashboard/test-support/support/intentCompletedStory.ts.
// Changed-file overlay and Review equality: ./intent-story-completed.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  completedChanges as changed,
  selectCompletedStoryInIntent,
} from "../../dashboard/test-support/support/intentCompletedStory.ts";
import { intentStory } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { lines } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";

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
  const story = intentStory(intent);
  await story.chooseTab("Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  await expect(story.file(changed.modified)).toBeVisible();
  await expect(story.file(changed.added)).toBeVisible();
  await expect(story.file(changed.deleted)).toBeVisible();
  await expect(story.file("dashboard/tests/later.spec.ts")).toHaveCount(0);
  await expect(story.file("dashboard/tests/current-a.spec.ts")).toHaveCount(0);
  expect(locations).toContain(completion);
  await story.file("dashboard/tests/boundary/kept.spec.ts").click();
  await expect(purposeRegion(intent)).toContainText("kept 11");
  await expect(purposeRegion(intent)).not.toContainText(
    "rewritten after landing",
  );
  await expect(
    sourceRevision(intent, "dashboard/tests/boundary/kept.spec.ts"),
  ).toContainText(`at revision ${completion.slice(0, 7)}`);
  expect(await story.diff(changed.modified)).toContain("completed");
  expect(await story.diff(changed.added)).toContain("added");
  expect(await story.diff(changed.deleted)).toContain("gone 0");
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
  const story = intentStory(intent);
  const scoped = story.summary;
  await expect(story.title).toHaveText("Story A");
  await expect(scoped.getByRole("status")).toHaveText(
    "No comparison is available.",
  );
  const detail = await story.headerDetail();
  await expect(
    detail.getByRole("heading", { name: "Intent coverage" }),
  ).toHaveCount(0);
  const problem = detail.locator(".intent-story-problem");
  await expect(problem).toHaveText(
    `${unrecoverable} The story's historical test source is unavailable.`,
  );
  await expect(scoped.getByRole("button", { name: "Retry" })).toHaveCount(0);
  await expect(story.header.revisions).toHaveCount(0);
  await expect(story.storyOnly()).toHaveCount(0);
  await expect(intent.locator("[data-kind]")).toHaveCount(0);
  await expect(story.outside).toHaveCount(0);
  await expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0);
  await story.chooseTab("Changed tests");
  await expect(filesColumn(intent)).toHaveCount(0);
  await expect(
    intent.getByRole("tabpanel", { name: "Changed tests" }),
  ).toContainText(
    "The story's historical Intent locations and test source are unavailable: its landed result could not be established.",
  );
  await story.chooseTab("Intent coverage");
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
