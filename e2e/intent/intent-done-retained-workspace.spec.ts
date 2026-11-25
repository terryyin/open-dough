import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { filesColumn } from "../../dashboard/test-support/intentModePage.ts";
import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
// Both the banner and the Done card read the immutable completion even
// while the retained workspace holds later uncommitted edits.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { trackStoryResultReads } from "../../dashboard/test-support/support/storyResultRequests.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import {
  expectReviewed,
  markAsReviewed,
} from "../../dashboard/test-support/doneStoryReviewPage.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { retainedIntentCompletion } from "../../dashboard/test-support/support/retainedIntentCompletion.ts";
import { selectDoneStoryInIntent } from "../../dashboard/test-support/support/selectDoneStoryInIntent.ts";
import { lines } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import {
  browseStoryFiles,
  intentDiff,
  intentFile,
} from "../../dashboard/test-support/support/intentStoryPage.ts";

const modified = "Modified dashboard/tests/a.spec.ts";
const renamed =
  "Renamed dashboard/tests/between/moved.spec.ts → tests/moved.sh";

test("a readable Done workspace cannot replace published locations, inventory, unchanged source or original diffs", async ({
  page,
  dashboard,
  origin,
}) => {
  const facts = makeMe.aRepository
    .withRevision("implementation", {
      backlog: null,
      remove: [
        "dashboard/tests/gone.spec.ts",
        "dashboard/tests/between/moved.spec.ts",
      ],
      files: {
        "dashboard/tests/a.spec.ts": `${lines("a")}completed immutable\n`,
        "dashboard/tests/boundary/b.spec.ts": "added at completion\n",
        "tests/moved.sh": `${lines("between")}renamed at completion\n`,
      },
    })
    .withRevision("later", {
      backlog: null,
      remove: [
        ".planning/open-dough.json",
        "dashboard/tests/a.spec.ts",
        "tests/moved.sh",
      ],
      files: {
        "dashboard/tests/later.spec.ts": "later trunk only\n",
        "dashboard/tests/boundary/kept.spec.ts":
          "later trunk unchanged source rewrite\n",
      },
    })
    .withRevision("local", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": "local mutable after completion\n",
        "dashboard/tests/boundary/kept.spec.ts":
          "local unchanged source rewrite\n",
        "dashboard/tests/local.spec.ts": "local workspace only\n",
      },
    })
    .please().revisions;
  const implementation = facts[0];
  const later = facts[1];
  const local = facts[2];
  if (later === undefined || local === undefined)
    throw new Error("Missing revision facts");
  const { completion } = await retainedIntentCompletion(
    page,
    dashboard,
    origin,
    { implementation, later, local },
  );
  const { inventory: locations, text: sourceReads } = trackStoryResultReads(
    page,
    "dashboard/tests/boundary/kept.spec.ts",
  );
  const received = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  const { card, intent } = await selectDoneStoryInIntent(page);
  const answer = storyReviewSchema.parse(await (await received).json());
  expect(answer).toMatchObject({ kind: "published", completion });
  await browseStoryFiles(intent);
  await expandIntentGroup(intent, "dashboard/tests");
  await expect(intentFile(intent, modified)).toBeVisible();
  await expect(
    intentFile(intent, "Added dashboard/tests/boundary/b.spec.ts"),
  ).toBeVisible();
  await expect(
    intentFile(intent, "Deleted dashboard/tests/gone.spec.ts"),
  ).toBeVisible();
  await expect(intentFile(intent, "dashboard/tests/later.spec.ts")).toHaveCount(
    0,
  );
  await expect(intentFile(intent, "dashboard/tests/local.spec.ts")).toHaveCount(
    0,
  );
  expect(locations).toContain(completion);
  await intentFile(intent, "dashboard/tests/boundary/kept.spec.ts").click();
  await expect(purposeRegion(intent)).toContainText("kept 11");
  await expect(purposeRegion(intent)).not.toContainText("source rewrite");
  await expect(
    sourceRevision(intent, "dashboard/tests/boundary/kept.spec.ts"),
  ).toContainText(`at revision ${completion.slice(0, 7)}`);
  expect(sourceReads).toEqual([completion]);
  const original = await intentDiff(intent, modified);
  expect(original).toContain("completed immutable");
  expect(original).not.toContain("local mutable");
  await expandIntentGroup(intent, "tests");
  const originalRename = await intentDiff(intent, renamed);
  expect(originalRename).toContain("renamed at completion");
  await parts(page).development.click();
  await showColumn(page, "Recently done");
  await expectReviewed(card, false);
  await markAsReviewed(card).click();
  await expectReviewed(card, true);
  const review = await openIntentReviewChanges(page, card);
  expect(review.answer).toMatchObject({ kind: "published", completion });
  await review.comparison.expectNoSwitch();
  await expandIntentGroup(intent, "dashboard/tests");
  const openedFromCard = await intentDiff(intent, modified);
  expect(openedFromCard).toBe(original);
  await expect(intentFile(intent, "dashboard/tests/local.spec.ts")).toHaveCount(
    0,
  );
  await review.returnToDevelopment();
  await showColumn(page, "Recently done");
  await expectReviewed(card, true);
});

test("unrecoverable history remains unavailable despite a readable Done workspace", async ({
  page,
  dashboard,
  origin,
}) => {
  const revisions = makeMe.aRepository
    .withRevision("implementation", {
      backlog: null,
      files: { "dashboard/tests/a.spec.ts": "completed immutable\n" },
    })
    .withRevision("local", {
      backlog: null,
      files: { "dashboard/tests/a.spec.ts": "readable local replacement\n" },
    })
    .please().revisions;
  const implementation = revisions[0];
  const local = revisions[1];
  if (local === undefined) throw new Error("Missing revision facts");
  await retainedIntentCompletion(page, dashboard, origin, {
    implementation,
    local,
    shallow: true,
  });
  const received = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  const { intent } = await selectDoneStoryInIntent(page);
  expect(storyReviewSchema.parse(await (await received).json())).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringMatching(/claim|history/),
  });
  await expect(filesColumn(intent)).toHaveCount(0);
  await expect(
    intent.getByText(
      "The story's historical Intent locations and test source are unavailable",
    ),
  ).toBeVisible();
  await expect(intent).not.toContainText("readable local replacement");
  await expect(intent.getByText(/No test files|no changes/i)).toHaveCount(0);
});
