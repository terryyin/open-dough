// What a page offers before and without this machine's launch evidence
// (../src/startupRecoveries.ts, ../src/CardLaunches.tsx), against the same
// real bare origin and installed starts as ./responsive-session-start.spec.ts.
// No story's Start is offered until a read of the machine's attempts
// answered: held, the Start actions stay unavailable while the rest of the
// card works; unanswered, Startup recovery says the evidence is unread and
// rechecks it. A launch whose acceptance answer was lost keeps its story
// protected statically -- nothing moves -- with Recheck under Startup
// recovery, until a read asked afterwards answers, however long the service
// stays unavailable; then the accepted attempt's progress shows.

import type { Page } from "@playwright/test";
import {
  agentAcceptEndpoint,
  agentLaunchEndpoint,
} from "../src/agentLaunch.ts";
import { cardSessions } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  needsReconciliation,
  recoveryOf,
  subject,
} from "./responsiveRecovery.ts";
import { expectProtected, openStories, test } from "./responsiveStart.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 60_000 });

// Answers the page's reads of the machine's sessions as `answer` says now:
// at once, held until released, or never (the service unavailable).
async function controlMachineReads(page: Page) {
  let mode: "answer" | "hold" | "fail" = "answer";
  let release = () => {};
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET" || mode === "answer") {
        await route.continue();
        return;
      }
      if (mode === "fail") {
        await route.abort("connectionrefused");
        return;
      }
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.continue();
    },
  );
  return {
    set: (next: typeof mode) => {
      mode = next;
    },
    release: () => {
      mode = "answer";
      release();
    },
  };
}

test("no story's Start is offered before this machine's launch evidence answers, and an unanswered read is said and rechecked", async ({
  page,
  origin,
}) => {
  test.setTimeout(120_000);
  const { story } = await openStories(page, origin);
  const start = story.getByRole("button", { name: "Start execution" });
  await expect(start).toBeEnabled();
  const reads = await controlMachineReads(page);

  reads.set("hold");
  await reloadUntilRead(page);
  await expect(story).toBeVisible();
  await expect(start).toBeDisabled();
  await expect(start).toHaveAccessibleDescription(
    /Unavailable until this dashboard reads this machine's launch evidence\./,
  );
  await expect(
    story.getByRole("button", { name: "Start refinement" }),
  ).toBeDisabled();
  await expect(
    story.getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  reads.release();
  await expect(start).toBeEnabled();

  reads.set("fail");
  await page.reload();
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "The local dashboard server has not answered with this machine's launch evidence",
  );
  await expect(start).toBeDisabled();
  reads.set("answer");
  await recovery
    .getByRole("button", { name: "Recheck launch evidence" })
    .click();
  await expect(start).toBeEnabled();
  await expect(recoveryOf(page)).toHaveCount(0);
});

test("a lost acceptance answer keeps the story protected statically with Recheck while the service is unavailable, until a later read shows the accepted start", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const push = origin.holdPushes();
  dashboard.claudeScenario("held");
  const { story, takenStory, other } = await openStories(page, origin);
  const reads = await controlMachineReads(page);
  // The service accepts the launch; its answer never reaches the page.
  await page.route(
    (url) => url.pathname === agentAcceptEndpoint,
    async (route) => {
      await route.fetch();
      await route.abort("connectionreset");
    },
  );

  reads.set("fail");
  await story.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();

  const recovery = recoveryOf(page);
  const lost = `${needsReconciliation}: the answer to this execution start was lost`;
  await expect(story).toContainText(lost);
  await expect(story).toContainText("Recheck it under Startup recovery");
  await expect(story).not.toContainText(/continu/i);
  await expect(story.locator(".card-startup-progressing")).toHaveCount(0);
  await expectProtected(story);
  await expect(other.getByRole("button", { disabled: true })).toHaveCount(0);
  await expect(recovery).toContainText(lost);
  // The lost answer says what to check and names no Continue it lacks.
  await expect(recovery).toContainText(
    "The local dashboard server could not be reached, so the launch may or may not have been accepted and its session may or may not have started. Check claude agents for it.",
  );
  await expect(recovery).not.toContainText(/continu/i);
  await expect(recovery.getByRole("button", { name: /^Continue/ })).toHaveCount(
    0,
  );
  // Still unavailable: rechecking proves nothing either way.
  await recovery.getByRole("button", { name: `Recheck ${subject}` }).click();
  await expect(story).toContainText(lost);
  await expectProtected(story);

  reads.set("answer");
  await recovery.getByRole("button", { name: `Recheck ${subject}` }).click();
  await expect(story).toContainText("Local startup in progress");
  await expect(story.locator(".card-startup-progressing")).toHaveCount(1);
  await expectProtected(story);
  await expect(recoveryOf(page)).toHaveCount(0);

  push.release();
  dashboard.releaseHeldClaude();
  await expect(cardSessions(takenStory)).toHaveCount(1, { timeout: 30_000 });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
});
