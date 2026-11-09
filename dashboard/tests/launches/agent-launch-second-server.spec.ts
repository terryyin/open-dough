// Both servers observe a real installed start on one machine; the second
// server's page keeps the card protected through reload and project switch
// until one session shows. Server-only refusals and the non-owner change-wait
// bound live in ../../backend-tests/launches/agent-launch-worker-handoff.spec.ts and
// ../../backend-tests/launches/agent-launch-change-wait.spec.ts.
import { type AttemptObservation } from "../../src/agentLaunch.ts";
import { accept, attempts, launchRequest } from "../agentLaunchBoundary.ts";
import { answerOf } from "../keptExecutionStart.ts";
import { chooseProject, storyCardSessions, parts } from "../dashboardPage.ts";
import { expect, pausePageClockAt } from "../dashboardTest.ts";
import { expectProtected, openStories, test } from "../responsiveStart.ts";
import { recoveryOf, worktrees } from "../responsiveRecovery.ts";
import { indicatorOf } from "../responsiveAccess.ts";
import {
  openUntilRead,
  passCheckPace,
  reloadUntilRead,
} from "../pageRequestNotes.ts";
import { settledOutcome } from "../acceptedAttempts.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../support/dashboardServer.ts";
import { queuedIdentity } from "../support/startOrigin.ts";

const request = {
  ...launchRequest,
  identity: queuedIdentity,
  title: "Story A",
};
test.use({
  projectFolders: ["open-dough"],
  startTimeoutMs: 10_000,
  launchTimeoutMs: 60_000,
});

// Accepted cost: a second dashboard server and the real installed start it
// observes. Only this journey follows a non-owner server through reload,
// project switch, real publication and native creation to exactly one
// session, worktree and claim; the boundaries above own the rest.
test("a second server follows the live script and native worker, protects its card through reload and project switch, then shows one session", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const push = origin.holdPushes();
  await pausePageClockAt(page, new Date());
  await openStories(page, origin);
  dashboard.claudeScenario("held");
  const accepted = await answerOf<{ attempt: AttemptObservation }>(
    accept(dashboard, request),
  );
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  const second = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
    // This server judges the running start slow from its first answer; the
    // owner's own threshold stays the fixture's.
    extraEnv: { DOUGH_START_TIMEOUT_MS: "1" },
  });
  try {
    const [live] = await attempts(second);
    expect(live).toMatchObject({
      id: accepted.attempt.id,
      owned: false,
      running: true,
      worker: {
        step: "start",
        pid: expect.any(Number),
        notedAt: expect.any(String),
      },
    });
    expect(live?.outcome).toBeUndefined();
    expect(live?.slowSince).toBeDefined();
    await page.clock.setSystemTime(
      Date.parse(accepted.attempt.acceptedAt) + 120_000,
    );
    await openUntilRead(page, second.baseURL);
    const story = parts(page).backlog.getByRole("article", { name: "Story A" });
    const warning =
      "Still starting after 2 minutes. The start goes on in workspace ~/git/open-dough/.worktrees/story-a on branch claude/story-a; its session starts when it finishes.";
    await expect(story.locator(".story-card-startup-progressing")).toHaveText(
      `Preparing execution… ${warning}`,
    );
    await expectProtected(story);
    expect(
      await indicatorOf(story.locator(".story-card-startup-progressing")),
    ).toMatchObject({ shown: true, animation: "story-card-startup-pulse" });
    await expect(recoveryOf(page)).toHaveCount(0);
    await reloadUntilRead(page);
    await expectProtected(story);
    await expect(story).toContainText(warning);
    await chooseProject(page, "Doughnut");
    await chooseProject(page, "Open Dough");
    await expectProtected(story);
    await expect(recoveryOf(page)).toHaveCount(0);
    push.release();
    await expect
      .poll(async () => (await attempts(second))[0]?.worker?.step, {
        timeout: 30_000,
      })
      .toBe("launch");
    expect((await attempts(second))[0]).toMatchObject({
      owned: false,
      running: true,
      worker: { pid: dashboard.pid, step: "launch" },
    });
    await expect.poll(() => origin.takenProfiles()).toHaveLength(1);
    await passCheckPace(page);
    const taken = parts(page).taken.getByRole("article", { name: "Story A" });
    await expect(
      taken.locator(".story-card-startup-progressing"),
    ).toContainText("Starting execution in Claude Code…");
    await expectProtected(taken);
    await expect(recoveryOf(page)).toHaveCount(0);
    dashboard.releaseHeldClaude();
    expect((await settledOutcome(dashboard, accepted.attempt.id)).kind).toBe(
      "launched",
    );
    await expect
      .poll(async () => (await attempts(second))[0]?.outcome?.kind)
      .toBe("launched");
    expect((await attempts(second))[0]).toMatchObject({
      owned: false,
      running: false,
    });
    expect((await attempts(second))[0]?.worker).toBeUndefined();
    await passCheckPace(page);
    await expect(storyCardSessions(taken)).toHaveCount(1);
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(worktrees(origin)).toEqual(["story-a"]);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    push.release();
    await second.close();
  }
});
