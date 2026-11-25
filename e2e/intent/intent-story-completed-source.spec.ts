// A Done story's historical source comes from its landing, even after trunk
// changes tests and removes settings. Unrecoverable history never borrows the
// current tree; an available saved coverage report remains independently useful.
// Real CLI completion and publication: ../../dashboard/test-support/support/intentCompletedStory.ts.
// Changed-file overlay and Review equality: ./intent-story-completed.spec.ts.

import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
import { filesColumn } from "../../dashboard/test-support/intentModePage.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
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

const keptFile = "dashboard/tests/boundary/kept.spec.ts";
const laterFile = "dashboard/tests/later.spec.ts";
const renamedFile = "dashboard/tests/current-a.spec.ts";
const coverageReport =
  "Outcome: Caught\nEvidence: The saved report remains readable without historical test source.\n";

function trunkAfterCompletion() {
  return makeMe.aRepository
    .withRevision("later", {
      backlog: null,
      remove: [
        ".planning/open-dough.json",
        "dashboard/tests/a.spec.ts",
        "dashboard/tests/boundary/b.spec.ts",
        "dashboard/tests/other/c.spec.ts",
      ],
      files: {
        [renamedFile]: `${lines("a")}current only\n`,
        [laterFile]: "later-only test\n",
        [keptFile]: "rewritten after landing\n",
      },
    })
    .please().revisions[0];
}

function trackIntentLocationRevisions(page: Page) {
  const locations: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("intent") === "locations"
    )
      locations.push(url.searchParams.get("revision") ?? "");
  });
  return locations;
}

test("a Done story keeps landing locations, inventory and unchanged source after trunk renames and deletes tests and removes settings", async ({
  page,
  origin,
}) => {
  const later = await test.step(
    "Given trunk changes the tests and removes its settings after Story A completes",
    trunkAfterCompletion,
  );
  const locations =
    await test.step("And I track the revisions used to read Intent locations", () =>
      trackIntentLocationRevisions(page));
  const { intent, story, completion } =
    await test.step("When I open Story A in Intent", async () => {
      const { intent, completion } = await selectCompletedStoryInIntent(
        page,
        origin,
        { later },
      );
      return { intent, story: intentStory(intent), completion };
    });
  await test.step("And I expand dashboard tests in Changes", async () => {
    await story.chooseTab("Changes");
    await expandIntentGroup(intent, "dashboard/tests");
  });
  await test.step("Then the completion's modified, added, and deleted tests appear", async () => {
    await expect(story.file(changed.modified)).toBeVisible();
    await expect(story.file(changed.added)).toBeVisible();
    await expect(story.file(changed.deleted)).toBeVisible();
  });
  await test.step("And the test inventory excludes the later trunk paths", async () => {
    await expect(story.file(laterFile)).toHaveCount(0);
    await expect(story.file(renamedFile)).toHaveCount(0);
  });
  await test.step("And Intent reads locations at the completion revision", () => {
    expect(locations).toContain(completion);
  });
  await test.step("When I select the test that the story left unchanged", () =>
    story.file(keptFile).click());
  await test.step("Then its source is shown as it was at completion", async () => {
    await expect(purposeRegion(intent)).toContainText("kept 11");
    await expect(purposeRegion(intent)).not.toContainText(
      "rewritten after landing",
    );
    await expect(sourceRevision(intent, keptFile)).toContainText(
      `at revision ${completion.slice(0, 7)}`,
    );
  });
  await test.step("And the changed tests show the completion's diffs", async () => {
    expect(await story.diff(changed.modified)).toContain("completed");
    expect(await story.diff(changed.added)).toContain("added");
    expect(await story.diff(changed.deleted)).toContain("gone 0");
  });
});

test("a completed story whose comparison cannot be recovered keeps saved coverage and explains unavailable historical source without substituting current tests", async ({
  page,
  origin,
}) => {
  const intentCoverage =
    await test.step("Given Story A has saved Intent coverage", () => {
      const { intentCoverage } = makeMe.aDoneRecord
        .withIntentCoverage({ report: coverageReport })
        .please();
      if (intentCoverage === undefined)
        throw new Error(
          "The completed story fixture needs its saved assessment.",
        );
      return intentCoverage;
    });
  const { card, intent, story } =
    await test.step("When I open Story A from shallow history in Intent", async () => {
      const { card, intent } = await selectCompletedStoryInIntent(
        page,
        origin,
        { history: "shallow", intentCoverage },
      );
      return { card, intent, story: intentStory(intent) };
    });
  await test.step("Then the story reports that no comparison is available", async () => {
    await expect(story.title).toHaveText("Story A");
    await expect(story.summary.getByRole("status")).toHaveText(
      "No comparison is available.",
    );
  });
  const detail = await test.step("When I read the story details", () =>
    story.headerDetail());
  await test.step("Then the details explain why historical source is unavailable", async () => {
    await expect(
      detail.getByRole("heading", { name: "Intent coverage" }),
    ).toHaveCount(0);
    await expect(detail.locator(".intent-story-problem")).toHaveText(
      `${unrecoverable} The story's historical test source is unavailable.`,
    );
  });
  await test.step("And the summary offers no retry or comparison revisions", async () => {
    await expect(
      story.summary.getByRole("button", { name: "Retry" }),
    ).toHaveCount(0);
    await expect(story.header.revisions).toHaveCount(0);
  });
  await test.step("And no test inventory is rendered", async () => {
    await expect(story.storyOnly()).toHaveCount(0);
    await expect(intent.locator("[data-kind]")).toHaveCount(0);
    await expect(story.tree).toHaveCount(0);
  });
  await test.step("And no empty-inventory notice appears", () =>
    expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0));
  await test.step("When I open Changes", () => story.chooseTab("Changes"));
  await test.step("Then Changes explains why it cannot show the historical files", async () => {
    await expect(filesColumn(intent)).toHaveCount(0);
    await expect(story.panel("Changes")).toContainText(
      "The story's historical Intent locations and test source are unavailable: its landed result could not be established.",
    );
  });
  await test.step("When I open Intent coverage", () =>
    story.chooseTab("Intent coverage"));
  await test.step("Then I can still read the saved report", () =>
    expect(
      intent
        .getByRole("region", { name: "Intent coverage" })
        .locator(".intent-story-coverage-text"),
    ).toHaveText(coverageReport));
  await test.step("When I return to Development", () =>
    parts(page).development.click());
  const review = await test.step("And I open Review changes for Story A", () =>
    openIntentReviewChanges(page, card));
  await test.step("Then Review changes shows the history problem without offering a sync retry", async () => {
    await expect(story.panel("Changes")).toBeVisible();
    await review.expectText(unrecoverable);
    await review.expectRetrySyncUnavailable();
  });
});
