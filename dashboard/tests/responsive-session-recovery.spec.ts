// A slow start stays progressing through its warning threshold and launches
// automatically; a published read failure after settlement is recovered in
// Startup recovery. These page journeys use real installed starts and origin.

import { attempts } from "./agentLaunchBoundary.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { noConnection } from "./originAnswers.ts";
import {
  needsReconciliation,
  recoveryOf,
  startExecution,
  subject,
  worktrees,
} from "./responsiveRecovery.ts";
import { expectProtected, openStories, test } from "./responsiveStart.ts";
import {
  countMachineReads,
  indicatorOf,
  recordAnnouncements,
} from "./responsiveAccess.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

test.describe("a start past its warning threshold", () => {
  test.use({ startTimeoutMs: 3_000 });

  test("warns once, keeps progressing through reload with no recovery, and launches automatically once", async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(150_000);
    const push = origin.holdPushes();
    const { story, takenStory, other } = await openStories(page, origin);
    const announced = await recordAnnouncements(page);
    const reads = countMachineReads(page);
    await startExecution(page, story);
    const [accepted] = await attempts(dashboard);
    if (accepted === undefined) throw new Error("The start was not accepted");
    // Only the browser's elapsed-time display advances; the real start stays held.
    await page.clock.setFixedTime(
      new Date(Date.parse(accepted.acceptedAt) + 120_000),
    );
    await expect
      .poll(async () => (await attempts(dashboard))[0]?.slowSince, {
        timeout: 30_000,
      })
      .toBeDefined();
    const [slow] = await attempts(dashboard);
    expect(slow).toMatchObject({
      owned: true,
      publication: { kind: "unknown" },
    });
    expect(slow?.outcome).toBeUndefined();
    const warning =
      "Still starting after 2 minutes. The start goes on in workspace ~/git/open-dough/.worktrees/story-a on branch claude/story-a; its session starts when it finishes.";
    await expectProtected(story);
    const progressing = story.locator(".story-card-startup-progressing");
    await expect(progressing).toHaveText(`Preparing execution… ${warning}`);
    expect(await indicatorOf(progressing)).toEqual({
      shown: true,
      animation: "story-card-startup-pulse",
    });
    await expect(story).not.toContainText("Started here, no session yet");
    await expect
      .poll(async () =>
        (await announced()).filter((words) => words.includes(warning)),
      )
      .toEqual([`Story A: execution start. ${warning}`]);
    const readsBefore = reads();
    await expect.poll(reads, { timeout: 30_000 }).toBeGreaterThan(readsBefore);
    expect(
      (await announced()).filter((words) => words.includes(warning)),
    ).toHaveLength(1);
    await expect(story).not.toContainText(needsReconciliation);
    await expect(recoveryOf(page)).toHaveCount(0);
    await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    await reloadUntilRead(page);
    await expectProtected(story);
    await expect(progressing).toHaveText(`Preparing execution… ${warning}`);
    expect(await indicatorOf(progressing)).toEqual({
      shown: true,
      animation: "story-card-startup-pulse",
    });
    await expect(recoveryOf(page)).toHaveCount(0);
    push.release();
    await expect(storyCardSessions(takenStory)).toHaveCount(1, {
      timeout: 30_000,
    });
    await expect(takenStory).not.toContainText(needsReconciliation);
    await expect(
      takenStory.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    await expect(recoveryOf(page)).toHaveCount(0);
    const taken = (await origin.originGit("rev-parse", "main")).trim();
    expect(await attempts(dashboard)).toEqual([
      expect.objectContaining({
        id: slow?.id,
        acceptedAt: slow?.acceptedAt,
        publication: { kind: "published", revision: taken },
        outcome: expect.objectContaining({ kind: "launched" }),
      }),
    ]);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(worktrees(origin)).toHaveLength(1);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});

test("a failed published read after settlement is said beside the project's actions and rechecked there", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(150_000);
  const { published, story, takenStory } = await openStories(page, origin);
  const restore = published.answerWith("main", noConnection);
  await startExecution(page, story);
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("launched");
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Waiting for published story state: The latest read of published work failed",
    { timeout: 30_000 },
  );
  await expect(recovery.getByRole("button", { name: /^Continue/ })).toHaveCount(
    0,
  );
  await expectProtected(story);

  restore();
  await recovery.getByRole("button", { name: `Recheck ${subject}` }).click();
  await expect(storyCardSessions(takenStory)).toHaveCount(1, {
    timeout: 30_000,
  });
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await expect(recoveryOf(page)).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});
