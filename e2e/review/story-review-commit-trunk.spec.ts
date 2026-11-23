// Ranges and individual merges leave trunk out and expose conflict resolutions.
import type { Page } from "@playwright/test";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  parentsConflict,
  sixth,
  trunkIntegrationRepository,
} from "../../dashboard/test-support/support/storyReviewTrunk.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";

// Story A's review opened on Commits.
async function openStoryCommits(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  keepLaunchRecord(dashboard, storyWorktree(origin).workspace);
  const review = await openIntentReviewChanges(
    page,
    await openBacklog(page, origin),
  );
  await review.comparison.choose("Commits");
  await review.expectRead();
  return review;
}

// The merge's commit range, two story rows with trunk integrated within.
async function openIntegratedRange(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const review = await openStoryCommits(page, dashboard, origin);
  await review.commits.expectRowCount(2);
  await review.commits.expectRangeSays("Trunk was integrated within the range");
  return review;
}

// Choosing the oldest story commit too leaves only the story's `src/c.ts`
// change from `c 5`, listed as `row`, named `file` and adding `added`.
async function expectRangeLeavesTrunkOut(
  review: IntentReviewChanges,
  { row, file, added }: { row: string; file: string; added: string },
) {
  const { commits, files, diffs } = review;
  await commits.choose("last");
  await commits.expectRange("Changes in 2 commits");
  await files.expectOutsideRows(["src", `  ${row}`]);
  await files.choose(file);
  await diffs.expectLines("removed", ["-c 5"]);
  await diffs.expectLines("added", [added]);
  await files.expectOutsideLacks("landed.txt", "README.md", "a.ts");
}

test.describe("with a clean trunk integration", () => {
  test.use({ originRepository: trunkIntegrationRepository() });

  test("a range across clean trunk integration leaves trunk out, and the merge alone changes nothing", async ({
    page,
    dashboard,
    origin,
  }) => {
    expect(parentsConflict(origin, "story changes c")).toBe(false);
    const review = await openIntegratedRange(page, dashboard, origin);
    await review.files.expectNone();
    await review.diffs.expectAbsent();
    await review.expectText("The chosen commits changed nothing.");

    await expectRangeLeavesTrunkOut(review, {
      row: "c.ts",
      file: "Modified src/c.ts",
      added: "+c story",
    });
  });
});

test.describe("with a conflicted trunk integration", () => {
  test.use({
    originRepository: trunkIntegrationRepository("c story and trunk"),
  });

  test("a range across conflicted trunk integration leaves trunk out, and the merge alone shows its own resolution", async ({
    page,
    dashboard,
    origin,
  }) => {
    expect(parentsConflict(origin, "story changes c")).toBe(true);
    const review = await openIntegratedRange(page, dashboard, origin);
    const { files, diffs } = review;
    await files.expectOutsideRows(["src", "  c.ts includes trunk's changes"]);
    const flagged = "Modified src/c.ts, includes trunk's changes";
    await files.choose(flagged);
    await diffs.expectLines("removed", ["-c story"]);
    await diffs.expectLines("added", ["+c story and trunk"]);

    await expectRangeLeavesTrunkOut(review, {
      row: "c.ts includes trunk's changes",
      file: flagged,
      added: "+c story and trunk",
    });
  });
});

test.describe("with an integration settled back to the oldest parent", () => {
  test.use({ originRepository: trunkIntegrationRepository("c 5") });

  test("an integration resolved back to the oldest parent stays flagged and is diffed from the destination baseline", async ({
    page,
    dashboard,
    origin,
  }) => {
    expect(parentsConflict(origin, "story changes c")).toBe(true);
    const review = await openStoryCommits(page, dashboard, origin);
    const { commits, files, diffs } = review;
    await commits.choose("last");
    await commits.expectRange("Changes in 2 commits");
    await files.expectOutsideRows(["src", "  c.ts includes trunk's changes"]);
    const flagged = "Modified src/c.ts, includes trunk's changes";
    await files.choose(flagged);
    await diffs.expectLines("removed", ["-c trunk"]);
    await diffs.expectLines("added", ["+c 5"]);
  });
});

// The story's `src/a.ts` edit, far from the sixth line trunk edits.
const withStoryLine = (a: string) => a.replace("a 0\n", "a story\n");

test.describe("with a story edit on a separate line of a file trunk changes", () => {
  // The story restores `src/c.ts`, so the selected commits leave only its
  // `src/a.ts` edit in the range.
  test.use({
    originRepository: trunkIntegrationRepository("c trunk", {
      story: {
        name: "story changes a on a separate line",
        files: {
          "src/c.ts": sixth("c"),
          "src/a.ts": withStoryLine(sixth("a")),
        },
      },
      merged: { "src/a.ts": withStoryLine(sixth("a", "a trunk")) },
    }),
  });

  test("a clean integration of disjoint changes in one file shows only the story edit without a flag", async ({
    page,
    dashboard,
    origin,
  }) => {
    expect(parentsConflict(origin, "story changes a on a separate line")).toBe(
      false,
    );
    const review = await openStoryCommits(page, dashboard, origin);
    const { commits, files, diffs } = review;
    await commits.choose("last");
    await commits.expectRange("Changes in 3 commits");
    await files.expectOutsideRows(["src", "  a.ts"]);
    await files.choose("Modified src/a.ts");
    await diffs.expectLines("removed", ["-a 0"]);
    await diffs.expectLines("added", ["+a story"]);
    await diffs.expectShows("Modified src/a.ts");
  });
});
