// Follow up from a Done story's file header in Review changes: on Published
// completion or a landed run, beside the path, even when the card offers Open
// terminal; absent on a retained workspace snapshot. Start opens the existing
// dialog with the story subject and file context, and the stored first input
// holds that context and the typed instruction.
// Intent's Purpose entry: ../intent/intent-story-follow-up.spec.ts.
// Boundary first-input and admission: ../../dashboard/backend-tests/launches/agent-launch-follow-up-file.spec.ts.

import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  parts,
  standaloneSessionName,
} from "../../dashboard/tests/dashboardPage.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import {
  expectFileFollowUpDialog,
  fileFollowUp,
  fileFollowUpDialog,
  startSessionField,
} from "../../dashboard/tests/support/fileFollowUpPage.ts";
import {
  completedPublishedStory,
  advanceCompletedTrunk,
} from "../../dashboard/tests/support/completedPublishedStory.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { listed } from "../../dashboard/tests/recentlyDoneColumn.ts";
import { readReview } from "../../dashboard/tests/support/launchLandingReview.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  fileDiff,
  listedFile,
} from "../../dashboard/tests/support/reviewTreeRows.ts";
import {
  reviewRegion,
  comparisonChoice,
} from "../../dashboard/tests/support/storyReviewMark.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";
import { git } from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { openTerminalControl } from "../../dashboard/tests/terminalScreenPage.ts";
import { storyALaunch } from "../../dashboard/tests/support/storyLaunchRecord.ts";

const storyName = `${queuedIdentity} — Story A`;
const sharedFile = "Modified shared.txt";

test("Published completion offers file Follow up; Start sends the file context and instruction", async ({
  page,
  dashboard,
  origin,
}) => {
  const { completion } = await completedPublishedStory(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  dashboard.claudeScenario("launched");
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const first = await readReview(page, card);
  expect(first.kind).toBe("published");
  if (first.kind !== "published") throw new Error("expected published review");
  const comparison = `Published completion ${first.baseline} → ${first.tree}`;
  const review = reviewRegion(page);
  await expect(review).toContainText("Published completion");
  await listedFile(review, sharedFile, { exact: true }).click();
  const dialog = fileFollowUpDialog(page);
  // Key-example wording; Kept short enough for Taken's accessible name.
  const instruction = "Check pinned revision on project switch";

  await test.step("Follow up opens the existing dialog with the story and file context", async () => {
    const follow = fileFollowUp(review, storyName);
    await expect(follow).toBeVisible();
    await follow.click();
    await expectFileFollowUpDialog(dialog, storyName, [
      "Path: shared.txt",
      `Comparison: ${comparison}`,
    ]);
    await expect(
      dialog.getByRole("button", { name: "Attach images", exact: true }),
    ).toBeVisible();
  });

  await test.step("Start sends the file context and the typed instruction", async () => {
    await startSessionField(dialog).fill(instruction);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await expect(
      parts(page).taken.getByRole("article", {
        name: standaloneSessionName("Ad hoc", instruction),
      }),
    ).toBeVisible({ timeout: 30_000 });
    await expect(dialog).toBeHidden();
    const [call, ...others] = dashboard.claudeLaunchCalls();
    expect(others).toEqual([]);
    const firstInput = call?.argv.at(3) ?? "";
    expect(firstInput).toContain("- Path: shared.txt");
    expect(firstInput).toContain(comparison);
    expect(firstInput).toContain(instruction);
  });
});

test("a retained workspace snapshot offers no file Follow up; Landed runs and Open terminal still do", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(60_000);
  const now = Date.now();
  const doneAt = new Date(now - 30 * 60_000).toISOString();
  const story = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    undefined,
    undefined,
    { retainWorkspace: true },
  );
  const { completion, workspace, branch } = story;
  const base = git(origin.project, "rev-parse", `${completion}^`);
  const reopenable = storyALaunch({
    sessionId: listed(dashboard, now, "Story A", 50 * 60_000),
    shortId: "reopen",
  })
    .onStoryBranch({ workspace, branch })
    .launchedAt(new Date(now - 50 * 60_000).toISOString())
    .withLanding(
      makeMe.aLaunchLanding
        .capturedFrom({ repository: origin.origin, identity: queuedIdentity })
        .comparing({ base, revision: completion })
        .receivedAt(doneAt)
        .please(),
    )
    .markedDoneAt(doneAt)
    .please();
  keepLaunchRecords(dashboard, [reopenable]);
  advanceCompletedTrunk(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Recently done");
  const card = parts(page).recentlyDone.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const review = reviewRegion(page);
  const dialog = fileFollowUpDialog(page);

  await test.step("the card offers Open terminal and no card Follow up", async () => {
    await expect(openTerminalControl(card)).toBeVisible();
    await expect(fileFollowUp(card, storyName)).toHaveCount(0);
  });

  const first = await readReview(page, card);
  expect(first.kind).toBe("snapshot");

  await test.step("a retained workspace snapshot offers no file Follow up", async () => {
    await listedFile(review, sharedFile, { exact: true }).click();
    await expect(fileDiff(review, sharedFile, { exact: true })).toBeVisible();
    await expect(fileFollowUp(review, storyName)).toHaveCount(0);
  });

  await test.step("Landed runs offer Follow up with the landed comparison", async () => {
    const landed = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === "/__agent-launch/review" && url.searchParams.has("run")
      );
    });
    await comparisonChoice(review, "Landed runs", { exact: true }).check();
    const landedReview = (await (await landed).json()) as {
      kind: string;
      baseline: string;
      tree: string;
    };
    expect(landedReview.kind).toBe("landed");
    await expect(review).toContainText("Landed run");
    // The landed pair lists completion artifacts; pick one known path.
    const doneRecord = "Added .planning/done/SEED-A_a.json";
    await listedFile(review, doneRecord, { exact: true }).click();
    const follow = fileFollowUp(review, storyName);
    await expect(follow).toBeVisible();
    await follow.click();
    await expectFileFollowUpDialog(dialog, storyName, [
      "Path: .planning/done/SEED-A_a.json",
      `Comparison: Landed run ${landedReview.baseline} → ${landedReview.tree}`,
    ]);
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });
});
