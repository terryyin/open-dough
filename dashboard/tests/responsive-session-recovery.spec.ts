// Startup in need of reconciliation is recovered outside the card
// (../src/StartupRecovery.tsx, ../src/storyStartup.ts,
// ../server/launchAttemptOwner.ts), against the same real bare origin and
// installed starts as ./responsive-session-start.spec.ts. A start whose wait
// expired before it knew whether it published keeps its story's frame
// protected with a static "Startup needs reconciliation" -- nothing moves --
// while Startup recovery, beside the project's actions, says what is known
// and offers Recheck and Continue: a continuation refused while the earlier
// start still runs keeps the attempt as it was; an accepted one runs that
// same attempt again under the existing recovery rules, with one claim, one
// workspace, and one session. A published read that failed after settlement
// is said there and rechecked there. Restart, reload, project switch, a
// second page, and a removed story: ./responsive-session-recovery-restart.spec.ts.

import { attempts, runningStarts } from "./agentLaunchBoundary.ts";
import { cardSessions } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { rateLimitedAnswer } from "./originAnswers.ts";
import {
  continueLabel,
  expectRecoveryOffered,
  expectStaticallyProtected,
  needsReconciliation,
  recoveryOf,
  startExecution,
  subject,
  worktrees,
} from "./responsiveRecovery.ts";
import { expectProtected, openStories, test } from "./responsiveStart.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

test.describe("a start whose wait expires", () => {
  test.use({ startTimeoutMs: 3_000 });

  test("is protected statically until its continuation, refused while its start runs, resumes that start once", async ({
    page,
    dashboard,
    origin,
  }) => {
    test.setTimeout(150_000);
    const push = origin.holdPushes();
    const { story, takenStory, other } = await openStories(page, origin);
    await startExecution(page, story);
    await expect
      .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
        timeout: 30_000,
      })
      .toBe("uncertain");
    const [uncertain] = await attempts(dashboard);
    expect(uncertain?.publication).toEqual({ kind: "unknown" });

    await expectStaticallyProtected(story);
    await expectRecoveryOffered(page);
    const recovery = recoveryOf(page);
    await expect(recovery).toContainText(
      "Whether it published its assignment is not known.",
    );
    await expect(recovery).toContainText("may or may not be Taken");
    // Its answer directs to the control offered beside it.
    await expect(recovery).toContainText("continuing resumes it");
    await expect(recovery).not.toContainText("Start again");
    await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);

    // Its start still runs: the continuation is refused, the attempt kept.
    await recovery.getByRole("button", { name: continueLabel }).click();
    await expect(recovery.locator(".launch-problem")).toContainText(
      "This story's earlier start is still running on this machine, so it was not continued.",
    );
    expect(await attempts(dashboard)).toEqual([uncertain]);
    await expectStaticallyProtected(story);

    // Its Take is published meanwhile; recheck still cannot tell its session.
    push.release();
    await expect
      .poll(() => runningStarts(dashboard), { timeout: 30_000 })
      .toEqual([]);
    const taken = (await origin.originGit("rev-parse", "main")).trim();
    await recovery.getByRole("button", { name: `Recheck ${subject}` }).click();
    await expect(takenStory).toBeVisible({ timeout: 30_000 });
    await expectStaticallyProtected(takenStory);
    await expect(recovery.locator(".launch-problem")).toHaveCount(0);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);

    // Continuing resumes that start: no second claim or workspace.
    await recovery.getByRole("button", { name: continueLabel }).click();
    await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 30_000 });
    await expect(takenStory).not.toContainText(needsReconciliation);
    await expect(
      takenStory.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    await expect(recoveryOf(page)).toHaveCount(0);
    expect(await attempts(dashboard)).toEqual([
      expect.objectContaining({
        id: uncertain?.id,
        acceptedAt: uncertain?.acceptedAt,
        publication: { kind: "published", revision: taken },
        outcome: expect.objectContaining({ kind: "launched" }),
      }),
    ]);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(taken);
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
  const restore = published.answerWith("main", rateLimitedAnswer());
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
  await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 30_000 });
  await expect(
    takenStory.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await expect(recoveryOf(page)).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});
