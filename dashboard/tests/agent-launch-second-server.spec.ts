// Both servers observe a real installed start on one machine; a server-only
// death leaves the held script alive until its real push completes.
import {
  agentChangedEndpoint,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import {
  accept,
  attempts,
  continueAttempt,
  launchRequest,
} from "./agentLaunchBoundary.ts";
import { answerOf, type Problem } from "./keptExecutionStart.ts";
import { storyCardSessions, parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import { expectProtected, openStories, test } from "./responsiveStart.ts";
import { recoveryOf, worktrees } from "./responsiveRecovery.ts";
import { indicatorOf } from "./responsiveAccess.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";
import { settledOutcome } from "./acceptedAttempts.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

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

test("a second server follows the live script and native worker, protects its card through reload and project switch, then shows one session", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  test.setTimeout(180_000);
  const push = origin.holdPushes();
  await openStories(page, origin);
  dashboard.claudeScenario("held");
  const accepted = await answerOf<{ attempt: AttemptObservation }>(
    accept(dashboard, request),
  );
  await expect.poll(() => push.isHeld(), { timeout: 30_000 }).toBe(true);
  const second = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    github,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
    extraEnv: { DOUGH_START_TIMEOUT_MS: "10000" },
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
    for (const workflow of ["execution", "refinement"]) {
      expect(
        await answerOf<Problem>(accept(second, { ...request, workflow })),
      ).toMatchObject({
        kind: "failed",
        reason: "already-starting",
        explanation: expect.stringContaining("already starting"),
      });
    }
    expect(
      await answerOf<Problem>(continueAttempt(second, accepted.attempt.id)),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running"),
    });
    // A non-owner consumes the existing bounded wait rather than waking a
    // client immediately; this direct call observes the existing 30-second bound.
    const began = Date.now();
    const changed = await rawRequest({
      url: `${second.baseURL}${agentChangedEndpoint}?attempt=${accepted.attempt.id}`,
      headers: { Origin: second.origin },
    });
    expect(JSON.parse(changed.body)).toMatchObject({ changed: false });
    expect(Date.now() - began).toBeGreaterThanOrEqual(29_000);
    await page.clock.setFixedTime(
      new Date(Date.parse(accepted.attempt.acceptedAt) + 120_000),
    );
    await openUntilRead(page, second.baseURL);
    const story = parts(page).backlog.getByRole("article", { name: "Story A" });
    const warning =
      "Still starting after 2 minutes. The start goes on in workspace ~/git/open-dough/.worktrees/story-a on branch claude/story-a; its session starts when it finishes.";
    await expect(story.locator(".story-card-startup-progressing")).toHaveText(
      `Preparing execution… ${warning}`,
      { timeout: 30_000 },
    );
    await expectProtected(story);
    expect(
      await indicatorOf(story.locator(".story-card-startup-progressing")),
    ).toMatchObject({ shown: true, animation: "story-card-startup-pulse" });
    await expect(recoveryOf(page)).toHaveCount(0);
    await reloadUntilRead(page);
    await expectProtected(story);
    await expect(story).toContainText(warning);
    await parts(page).project.getByRole("radio", { name: "Doughnut" }).click();
    await parts(page)
      .project.getByRole("radio", { name: "Open Dough" })
      .click();
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
    const taken = parts(page).taken.getByRole("article", { name: "Story A" });
    await expect(
      taken.locator(".story-card-startup-progressing"),
    ).toContainText("Starting execution in Claude Code…", { timeout: 30_000 });
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
    await expect(storyCardSessions(taken)).toHaveCount(1, { timeout: 30_000 });
    expect(await origin.takenProfiles()).toHaveLength(1);
    expect(worktrees(origin)).toEqual(["story-a"]);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  } finally {
    push.release();
    await second.close();
  }
});
