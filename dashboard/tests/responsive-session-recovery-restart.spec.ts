// Startup a closed server left unsettled is recovered outside the card
// (./responsive-session-recovery.spec.ts tells the common contract): after a
// server restart on the same machine, a reload, a project switch, and on a
// second page, its story's frame stays protected statically and Startup
// recovery offers its continuation, which runs that same attempt once; a
// fresh start of the story is refused meanwhile. A story removed from the
// published snapshot keeps its recovery beside the project's actions, with
// no card locked.

import { accept, attempts, launchRequest } from "./agentLaunchBoundary.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  continueLabel,
  expectRecoveryOffered,
  expectStaticallyProtected,
  needsReconciliation,
  recoveryOf,
  removeQueuedStory,
  restartAfterPush,
  startExecution,
  subject,
  worktrees,
} from "./responsiveRecovery.ts";
import { openStories, test } from "./responsiveStart.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

test("a start a closed server left unsettled stays protected after restart, reload, project switch and on a second page, and continues once", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  test.setTimeout(180_000);
  const push = origin.holdPushes();
  const { story, takenStory, other } = await openStories(page, origin);
  await startExecution(page, story);
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  const [running] = await attempts(dashboard);
  expect(running?.owned).toBe(true);

  const restarted = await restartAfterPush(dashboard, push, origin, github);
  try {
    expect(await attempts(restarted)).toEqual([
      expect.objectContaining({ id: running?.id, owned: false }),
    ]);
    expect(restarted.claudeLaunchCalls()).toEqual([]);
    // Its Take reached origin while no server ran it.
    await page.reload();
    await expectStaticallyProtected(takenStory);
    await expect(takenStory).toContainText(
      "no running dashboard server owns it",
    );
    await expectRecoveryOffered(page);
    await expect(recoveryOf(page)).toContainText("It never settled.");
    await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);

    // No fresh start of the story is accepted, whatever asks for it.
    expect(
      JSON.parse(
        (
          await accept(restarted, {
            ...launchRequest,
            identity: queuedIdentity,
            title: "Story A",
            workflow: "refinement",
          })
        ).body,
      ),
    ).toMatchObject({ kind: "failed", reason: "already-starting" });

    const { project } = parts(page);
    await project.getByRole("radio", { name: "Doughnut" }).click();
    await expect(recoveryOf(page)).toHaveCount(0);
    await project.getByRole("radio", { name: "Open Dough" }).click();
    await expectStaticallyProtected(takenStory);
    await expectRecoveryOffered(page);

    const second = await page.context().newPage();
    await second.goto("/");
    const secondTaken = parts(second).taken.getByRole("article", {
      name: "Story A",
    });
    await expectStaticallyProtected(secondTaken);
    await expectRecoveryOffered(second);

    await recoveryOf(second)
      .getByRole("button", { name: continueLabel })
      .click();
    await expect(cardSessions(secondTaken)).toHaveCount(1, { timeout: 60_000 });
    await expect(
      secondTaken.getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
    await expect(recoveryOf(second)).toHaveCount(0);
    await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 60_000 });
    await expect(takenStory).not.toContainText(needsReconciliation);

    expect(await attempts(restarted)).toEqual([
      expect.objectContaining({
        id: running?.id,
        acceptedAt: running?.acceptedAt,
        outcome: expect.objectContaining({ kind: "launched" }),
      }),
    ]);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(worktrees(origin)).toHaveLength(1);
    // Both servers' synthetic `claude` keep this machine's one call log.
    expect(restarted.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    await restarted.close();
  }
});

test("a story removed while its startup needs reconciliation keeps that recovery beside the project's actions, with no card locked", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  test.setTimeout(150_000);
  const push = origin.holdPushes();
  const { story, takenStory, other } = await openStories(page, origin);
  await startExecution(page, story);
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  const restarted = await restartAfterPush(dashboard, push, origin, github);
  try {
    await page.reload();
    await expectStaticallyProtected(takenStory);
    await removeQueuedStory(origin);
    await parts(page).refresh.click();
    await expect(
      parts(page).stages.getByRole("article", { name: "Story A" }),
    ).toHaveCount(0);
    await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
    await expectRecoveryOffered(page);
    await recoveryOf(page)
      .getByRole("button", { name: `Recheck ${subject}` })
      .click();
    await expectRecoveryOffered(page);
    expect(restarted.claudeLaunchCalls()).toEqual([]);
  } finally {
    await restarted.close();
  }
});
