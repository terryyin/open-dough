// Ranges and individual merges leave trunk out and expose conflict resolutions.
import type { Locator, Page } from "@playwright/test";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  commitRangeHeading,
  chooseCommit,
} from "../../dashboard/test-support/support/storyReviewCommitChoice.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import { reviewRegion } from "../../dashboard/test-support/support/reviewControls.ts";
import {
  parentsConflict,
  sixth,
  trunkIntegrationRepository,
} from "../../dashboard/test-support/support/storyReviewTrunk.ts";
import {
  showCommits,
  openStoryReview,
} from "../../dashboard/test-support/support/reviewRead.ts";
import {
  expectTreeRows,
  changedFilesList,
  fileLineCounts,
  listedFile,
} from "../../dashboard/test-support/support/reviewTreeRows.ts";
import { storyWorktree } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";

// Story A's review opened on Commits, with its story commit rows.
async function openStoryCommits(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  keepLaunchRecord(dashboard, storyWorktree(origin).workspace);
  await openStoryReview(page, await openBacklog(page, origin));
  const review = reviewRegion(page);
  await showCommits(review);
  const rows = review
    .getByRole("list", { name: "Story commits", exact: true })
    .getByRole("button");
  return { review, rows };
}

// The merge's commit range, two story rows with trunk integrated within.
async function openIntegratedRange(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const opened = await openStoryCommits(page, dashboard, origin);
  await expect(opened.rows).toHaveCount(2);
  await expect(commitRangeHeading(opened.review)).toContainText(
    "Trunk was integrated within the range",
  );
  return opened;
}

// Choosing the oldest story commit too leaves only the story's `src/c.ts`
// change from `c 5`, listed as `row`, named `file` and adding `added`.
async function expectRangeLeavesTrunkOut(
  review: Locator,
  rows: Locator,
  { row, file, added }: { row: string; file: string; added: string },
) {
  await chooseCommit(review, rows.last());
  await expect(
    review.getByRole("heading", { name: "Changes in 2 commits" }),
  ).toBeVisible();
  const files = changedFilesList(review, "1 changed file", { exact: true });
  await expectTreeRows(files, ["src", `  ${row}`]);
  await listedFile(files, file, { exact: true }).click();
  await expect(review.locator(".story-review-removed")).toHaveText(["-c 5"]);
  await expect(review.locator(".story-review-added")).toHaveText([added]);
  await expect(fileLineCounts(files)).toHaveText("+1 −1", {
    useInnerText: true,
  });
  await expect(review).not.toContainText("landed.txt");
  await expect(files).not.toContainText("README.md");
  await expect(files).not.toContainText("a.ts");
}

test.describe("with a clean trunk integration", () => {
  test.use({ originRepository: trunkIntegrationRepository() });

  test("a range across clean trunk integration leaves trunk out, and the merge alone changes nothing", async ({
    page,
    dashboard,
    origin,
  }) => {
    expect(parentsConflict(origin, "story changes c")).toBe(false);
    const { review, rows } = await openIntegratedRange(page, dashboard, origin);
    await expect(review).toContainText("The chosen commits changed nothing.");
    await expect(changedFilesList(review, /changed file/)).toHaveCount(0);

    await expectRangeLeavesTrunkOut(review, rows, {
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
    const { review, rows } = await openIntegratedRange(page, dashboard, origin);
    const mergeFiles = changedFilesList(review, "1 changed file", {
      exact: true,
    });
    await expectTreeRows(mergeFiles, [
      "src",
      "  c.ts includes trunk's changes",
    ]);
    const flagged = "Modified src/c.ts, includes trunk's changes";
    await mergeFiles.getByRole("button", { name: flagged }).click();
    await expect(review.locator(".story-review-removed")).toHaveText([
      "-c story",
    ]);
    await expect(review.locator(".story-review-added")).toHaveText([
      "+c story and trunk",
    ]);
    await expect(fileLineCounts(mergeFiles)).toHaveText("+1 −1", {
      useInnerText: true,
    });

    await expectRangeLeavesTrunkOut(review, rows, {
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
    const { review, rows } = await openStoryCommits(page, dashboard, origin);
    await chooseCommit(review, rows.last());
    await expect(
      review.getByRole("heading", { name: "Changes in 2 commits" }),
    ).toBeVisible();
    const files = changedFilesList(review, "1 changed file", { exact: true });
    await expectTreeRows(files, ["src", "  c.ts includes trunk's changes"]);
    await listedFile(
      files,
      "Modified src/c.ts, includes trunk's changes",
    ).click();
    await expect(review.locator(".story-review-removed")).toHaveText([
      "-c trunk",
    ]);
    await expect(review.locator(".story-review-added")).toHaveText(["+c 5"]);
    await expect(fileLineCounts(files)).toHaveText("+1 −1", {
      useInnerText: true,
    });
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
    const { review, rows } = await openStoryCommits(page, dashboard, origin);
    await chooseCommit(review, rows.last());
    await expect(
      review.getByRole("heading", { name: "Changes in 3 commits" }),
    ).toBeVisible();
    const files = changedFilesList(review, "1 changed file", { exact: true });
    await expectTreeRows(files, ["src", "  a.ts"]);
    await listedFile(files, "Modified src/a.ts", { exact: true }).click();
    await expect(review.locator(".story-review-removed")).toHaveText(["-a 0"]);
    await expect(review.locator(".story-review-added")).toHaveText([
      "+a story",
    ]);
    await expect(review).not.toContainText("includes trunk's changes");
  });
});
