// What a page offers before and without this machine's launch evidence
// (../../src/startupRecoveries.ts, ../../src/StoryCardLaunches.tsx), against
// controlled answers to the page's reads of the machine's sessions. No
// story's Start is offered until a read of the machine's attempts answered:
// held, the Start actions stay unavailable while the rest of the card works;
// unanswered, Startup recovery says the evidence is unread and rechecks it. A
// launch whose acceptance answer was lost keeps its story protected
// statically -- nothing moves -- with Recheck under Startup recovery, until a
// read asked afterwards answers, however long the service stays unavailable;
// then the accepted attempt's progress shows. Real held starts are
// ../../../e2e/launches/responsive-session-start.spec.ts.

import type { Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { frontendAttempt } from "../../test-support/support/frontendLaunchAttempts.ts";
import { backlogLaunchers } from "../../test-support/launchStoryCardPage.ts";
import {
  needsReconciliation,
  recoveryOf,
} from "../../test-support/responsiveRecovery.ts";
import { expectProtected } from "../../test-support/responsiveStart.ts";
import { reloadUntilRead } from "../../test-support/pageRequestNotes.ts";
import {
  notRefinedStory,
  readyIdentity,
  readyStory,
} from "../../test-support/launchJourney.ts";

const subject = `${readyStory} (${readyIdentity})`;

// Answers the page's reads of the machine's sessions as `set` says now: as
// the substitutes answer, held until released, or never (the service
// unavailable).
async function controlMachineReads(page: Page) {
  let mode: "answer" | "hold" | "fail" = "answer";
  let release = () => {};
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET" || mode === "answer") {
        await route.fallback();
        return;
      }
      if (mode === "fail") {
        await route.abort("connectionrefused");
        return;
      }
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      await route.fallback();
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
}) => {
  await openFrontendTakenBacklog(page);
  const story = backlogLaunchers(page).card(readyStory);
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
  frontendServices,
}) => {
  const attempt = frontendAttempt(frontendServices);
  const boundary = await installFrontendLaunchBoundary(page, {
    accept: attempt.accept,
  });
  await openFrontendTakenBacklog(page);
  const { card, start } = backlogLaunchers(page);
  const story = card(readyStory);
  const reads = await controlMachineReads(page);
  // The service accepts the launch; its answer never reaches the page.
  boundary.loseNextAcceptance();

  reads.set("fail");
  await start(readyStory).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();

  const recovery = recoveryOf(page);
  const lost = `${needsReconciliation}: the answer to this execution start was lost`;
  await expect(story).toContainText(lost);
  await expect(story).toContainText("Recheck it under Startup recovery");
  await expect(story).not.toContainText(/continu/i);
  await expect(story.locator(".story-card-startup-progressing")).toHaveCount(0);
  await expectProtected(story);
  await expect(
    card(notRefinedStory).getByRole("button", { disabled: true }),
  ).toHaveCount(0);
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
  await expect(story.locator(".story-card-startup-progressing")).toHaveCount(1);
  await expectProtected(story);
  await expect(recoveryOf(page)).toHaveCount(0);
  expect(boundary.acceptances).toHaveLength(1);
});
