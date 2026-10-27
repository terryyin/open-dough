// Both servers observe a real installed start on one machine; a server-only
// death leaves the held script alive until its real push completes.
import { attempts, continueAttempt } from "./agentLaunchBoundary.ts";
import { answerOf, type Problem } from "./keptExecutionStart.ts";
import { storyCardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { expectProtected, openStories, test } from "./responsiveStart.ts";
import {
  expectRecoveryOffered,
  expectStaticallyProtected,
  recoveryOf,
  startExecution,
  worktrees,
} from "./responsiveRecovery.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
import { keptAttempts, settledOutcome } from "./acceptedAttempts.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";

test.use({
  projectFolders: ["open-dough"],
  startTimeoutMs: 10_000,
  launchTimeoutMs: 60_000,
});

test("a server killed before the warning leaves a live script running; its exit becomes interrupted and Continue reuses the claim", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  test.setTimeout(180_000);
  const push = origin.holdPushes();
  const { story } = await openStories(page, origin);
  await startExecution(page, story);
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  const [accepted] = await attempts(dashboard);
  if (accepted?.worker === undefined)
    throw new Error("The script worker was not recorded");
  expect(keptAttempts(dashboard)[0]?.slowSince).toBeUndefined();
  const child = accepted.worker.pid;
  process.kill(dashboard.pid, "SIGKILL");
  // The script is alive independently of its owning server.
  expect(() => process.kill(child, 0)).not.toThrow();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
    port: Number(new URL(dashboard.baseURL).port),
    extraEnv: { DOUGH_START_TIMEOUT_MS: "10000" },
  });
  try {
    await expect
      .poll(async () => (await attempts(restarted))[0]?.slowSince, {
        timeout: 30_000,
      })
      .toBeDefined();
    expect(keptAttempts(restarted)[0]?.slowSince).toBeUndefined();
    expect((await attempts(restarted))[0]).toMatchObject({
      owned: false,
      running: true,
      worker: { pid: child, step: "start" },
    });
    await page.clock.setFixedTime(
      new Date(Date.parse(accepted.acceptedAt) + 120_000),
    );
    await reloadUntilRead(page);
    await expectProtected(story);
    await expect(
      story.locator(".story-card-startup-progressing"),
    ).toContainText("Still starting after 2 minutes.");
    await expect(recoveryOf(page)).toHaveCount(0);
    expect(
      await answerOf<Problem>(continueAttempt(restarted, accepted.id)),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running"),
    });
    push.release();
    await expect
      .poll(async () => (await attempts(restarted))[0]?.running, {
        timeout: 30_000,
      })
      .toBe(false);
    expect((await attempts(restarted))[0]?.outcome).toBeUndefined();
    await reloadUntilRead(page);
    const taken = parts(page).taken.getByRole("article", { name: "Story A" });
    await expectStaticallyProtected(taken);
    await expectRecoveryOffered(page);
    expect(restarted.claudeLaunchCalls()).toEqual([]);
    const continued = await answerOf<{ kind: string }>(
      continueAttempt(restarted, accepted.id),
    );
    expect(continued.kind).toBe("accepted");
    expect((await settledOutcome(restarted, accepted.id)).kind).toBe(
      "launched",
    );
    await expect(storyCardSessions(taken)).toHaveCount(1, { timeout: 30_000 });
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(worktrees(origin)).toEqual(["story-a"]);
    expect(restarted.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    push.release();
    await restarted.close();
  }
});
