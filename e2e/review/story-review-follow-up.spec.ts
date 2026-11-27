// Follow up from a Done story's file header in Review changes: on Published
// completion or a landed run, beside the path, even when the card offers Open
// terminal. Start opens the existing
// dialog with the story subject and file context, and the stored first input
// holds that context and the typed instruction.
// Intent's Purpose entry: ../intent/intent-story-follow-up.spec.ts.
// Boundary first-input and admission: ../../dashboard/backend-tests/launches/agent-launch-follow-up-file.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { reviewRunKey } from "../../dashboard/src/storyReviewLandedRun.ts";
import {
  parts,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { attachStoryNotes } from "../../dashboard/test-support/support/attachStoryNotesPage.ts";
import {
  fileFollowUp,
  startSessionField,
} from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import { advanceCompletedTrunk } from "../../dashboard/test-support/support/completedStoryVisibleActions.ts";
import { waitForLandedReview } from "../../dashboard/test-support/support/completedReviewRequests.ts";
import { ordinaryJourneyCompletedHistory } from "../../dashboard/test-support/support/completedFollowUpHistory.ts";
import { claimant } from "../../dashboard/test-support/support/completedStoryThroughInterleaving.ts";
import { agentWorktree } from "../../dashboard/test-support/support/agentAuthoredWorktree.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { listed } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { seedStoryNotes } from "../../dashboard/test-support/support/storyNotesStore.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";
import { storyALaunch } from "../../dashboard/test-support/support/storyLaunchRecord.ts";

const storyName = `${queuedIdentity} — Story A`;
const sharedFile = "Modified shared.txt";

test.describe("published file Follow up", () => {
  test.use({ originRepository: ordinaryJourneyCompletedHistory() });

  test("Published completion offers file Follow up; Start sends the file context and instruction", async ({
    page,
    dashboard,
    origin,
  }) => {
    const completion = origin.revision("completion");
    const waiting = makeMe.aStoryNote
      .withText("Follow up the changed file")
      .please();
    seedStoryNotes(dashboard.home, { [queuedIdentity]: [waiting] });
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
    const review = await openIntentReviewChanges(page, card);
    const first = review.answer;
    expect(first.kind).toBe("published");
    if (first.kind !== "published")
      throw new Error("expected published review");
    const comparison = `Published completion ${first.baseline} → ${first.tree}`;
    await review.expectText("Published completion");
    await review.files.choose(sharedFile);
    // Key-example wording; Kept short enough for the session's accessible name.
    const instruction = "Check pinned revision on project switch";

    const dialog =
      await test.step("Follow up opens the existing dialog with the story and file context", async () => {
        await review.diffs.expectFollowUp(storyName);
        const opened = await review.diffs.followUpFromFile(
          sharedFile,
          storyName,
          ["Path: shared.txt", `Comparison: ${comparison}`],
        );
        await expect(
          opened.getByRole("button", { name: "Attach images", exact: true }),
        ).toBeVisible();
        return opened;
      });

    await test.step("the file follow-up offers the waiting note and lets me leave it out", async () => {
      await attachStoryNotes(dialog).expectChoice(false, 1, 1);
    });

    await test.step("Start sends the file context and the typed instruction", async () => {
      await startSessionField(dialog).fill(instruction);
      await dialog.getByRole("button", { name: "Start", exact: true }).click();
      await expect(dialog).toBeHidden();
      await review.returnToDevelopment();
      await expect(
        parts(page).recentlyDone.getByRole("article", {
          name: standaloneSessionName("Ad hoc", instruction),
        }),
      ).toBeVisible({ timeout: 30_000 });
      const [started, ...others] = dashboard.claudeLaunches();
      expect(others).toEqual([]);
      const firstInput = started?.instruction ?? "";
      expect(firstInput).toContain("- Path: shared.txt");
      expect(firstInput).toContain(comparison);
      expect(firstInput).toContain(instruction);
      expect(firstInput).not.toContain("<line-notes>");
      expect(firstInput).not.toContain(waiting.text);
    });
  });
});

test.describe("retained Done workspace", () => {
  test.use({ originRepository: ordinaryJourneyCompletedHistory() });

  test("a Done story follows up its selected landed comparison and still offers file follow-up", async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(60_000);
    const now = Date.now();
    const doneAt = new Date(now - 30 * 60_000).toISOString();
    const completion = origin.revision("completion");
    const workspace = await agentWorktree(
      origin,
      claimant.agent,
      "reopen",
      completion,
    );
    const branch = "exec/reopen";
    const base = origin.revision("interleaving");
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
    dashboard.claudeScenario("launched");
    advanceCompletedTrunk(origin);
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: git(origin.origin, "rev-parse", "main"),
      repository: "terryyin/open-dough",
      follows: true,
    });
    await page.goto("/");
    await showColumn(page, "Recently done");
    const card = parts(page).recentlyDone.getByRole("article", {
      name: "Story A",
      exact: true,
    });
    await test.step("the card offers Open terminal and no card Follow up", async () => {
      await expect(openTerminalControl(card)).toBeVisible();
      await expect(fileFollowUp(card, storyName)).toHaveCount(0);
    });

    const review = await openIntentReviewChanges(page, card);
    expect(review.answer).toMatchObject({ kind: "published", completion });

    await test.step("the Done story opens on Published completion with file Follow up", async () => {
      await review.files.choose(sharedFile);
      await review.diffs.expectShows(sharedFile);
      await review.comparison.expectChosen("Published completion");
      await review.diffs.expectFollowUp(storyName);
    });

    const landedComparison = `Landed run ${base} → ${completion}`;
    await test.step("Landed runs offer file Follow up on the retained Git pair", async () => {
      const key = reviewRunKey(reopenable);
      const landed = waitForLandedReview(page, key);
      await review.landedRun.choose(key);
      expect(await landed).toMatchObject({
        kind: "landed",
        baseline: base,
        tree: completion,
      });
      expect(review.answer).not.toMatchObject({
        baseline: base,
        tree: completion,
      });
      await review.landedRun.expectShown();
      // The landed pair lists completion artifacts; pick one known path.
      const doneRecord = "Added .planning/done/SEED-A_a.json";
      await review.files.choose(doneRecord);
      await review.diffs.expectFollowUp(storyName);
      const dialog = await review.diffs.followUpFromFile(
        doneRecord,
        storyName,
        [
          "Path: .planning/done/SEED-A_a.json",
          `Comparison: ${landedComparison}`,
        ],
      );
      await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
    });

    await test.step("The title action sends the same landed pair to Claude", async () => {
      const composer = await review.followUpComparison();
      await composer.expectContext(storyName, [
        `Comparison: ${landedComparison}`,
      ]);
      const instruction = "Review the accepted landing";
      await composer.start(instruction);
      await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(1);
      const firstInput = dashboard.claudeLaunches()[0]?.instruction;
      expect(firstInput).toContain(`- Comparison: ${landedComparison}`);
      expect(firstInput).toContain(instruction);
    });
  });
});
