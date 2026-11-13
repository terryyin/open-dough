// A session entry shows its host's changes within one records-read pace of
// page time, without a reload. What each state reads is
// ../../backend-tests/sessions/session-reading-rule.spec.ts.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import {
  closeTerminal,
  openTerminalControl,
  terminalPanel,
} from "../terminalScreenPage.ts";
import {
  expectMembership,
  parts,
  sessionNamedBy,
  standaloneSessionName,
  storyCardSessionOf,
} from "../dashboardPage.ts";
import {
  openTakenBacklog,
  takenBacklogStories,
} from "../launchStoryCardPage.ts";
import { readyStory, type LaunchJourney } from "../launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "../sessionStatePace.ts";
import { markDoneAnyway } from "../support/markDone.ts";
import { attempts } from "../agentLaunchBoundary.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

test.use({ projectFolders: ["open-dough"] });

// Starts the ready story's execution on a paused page. Its entry reads
// Working once the start's published read has landed, before page time
// passes.
async function startReadyStory(
  page: Page,
  dashboard: DashboardServer,
  launchJourney: LaunchJourney,
) {
  await pausePageClockAt(page, new Date());
  const reads = await watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page, launchJourney);
  await start(readyStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();
  const entry = storyCardSessionOf(card(readyStory), "Execution");
  await expectSessionShown(entry, "Working", false);
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  await markNotReloaded(page);
  return { ...reads, entry, session: await sessionNamedBy(entry) };
}

test("a host change shows on its entry within one pace, without a reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const { entry, session, passOnePace, answeredDuring } = await startReadyStory(
    page,
    dashboard,
    launchJourney,
  );

  await test.step("a pace with nothing changed is answered unchanged", async () => {
    const reconciled = async () =>
      (await attempts(dashboard)).every(({ reconciledAt }) => reconciledAt);
    await expect.poll(reconciled).toBe(true);
    await passOnePace();
    expect(await answeredDuring()).toEqual({ held: true, unchanged: true });
    await expectSessionShown(entry, "Working", false);
  });

  await test.step("a blocked session needs input within one pace", async () => {
    const answered = await answeredDuring(async () => {
      dashboard.claudeSessionBecomes(session, "blocked", "npm test");
      await passOnePace();
    });
    expect(answered).toEqual({ held: true, unchanged: false });
    await expectSessionShown(entry, "Needs input: npm test", true);
  });

  await test.step("a session no longer listed keeps its id, without Open terminal", async () => {
    dashboard.claudeSessionBecomes(session, "forgotten");
    await passOnePace();
    await expectSessionShown(entry, "Session unavailable", false);
    await expect(entry).toContainText(`Session ${session}`);
    await expect(openTerminalControl(entry)).toHaveCount(0);
  });

  await test.step("an unreadable listing shows State unknown until the listing reads again", async () => {
    dashboard.claudeListingFails(true);
    await passOnePace();
    await expect(entry).toContainText("State unknown");
    await expect(openTerminalControl(entry)).toHaveCount(1);
    dashboard.claudeListingFails(false);
    await passOnePace();
    await expectSessionShown(entry, "Session unavailable", false);
  });

  await expectNotReloaded(page);
  await expectMembership(page, takenBacklogStories);
});

test("attention stays through the terminal, and once marked done no host change brings it back", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const { entry, session, passOnePace } = await startReadyStory(
    page,
    dashboard,
    launchJourney,
  );
  const needsInput = "Needs input: input needed";

  await test.step("a blocked session still needs input after its terminal is opened, answered and closed", async () => {
    dashboard.claudeSessionBecomes(session, "blocked", "input needed");
    await passOnePace();
    await expectSessionShown(entry, needsInput, true);

    await openTerminalControl(entry).click();
    // Page time stands still, so the attach and the answer are read from the
    // synthetic `claude` itself.
    const attach = () => dashboard.claudeAttaches()[0];
    await expect.poll(() => attach()?.id).toBe(session.slice(0, 8));
    await page.keyboard.type("red");
    await page.keyboard.press("Enter");
    await expect.poll(() => attach()?.lines).toEqual(["red"]);
    await closeTerminal(terminalPanel(page));
    await expect.poll(() => attach()?.endedBy).toBeDefined();
    await passOnePace();
    await expectSessionShown(entry, needsInput, true);
  });

  await test.step("resumed work clears it, and a finished turn asks for review", async () => {
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectSessionShown(entry, "Working", false);
    dashboard.claudeSessionBecomes(session, "done-live");
    await passOnePace();
    await expectSessionShown(entry, "Ready for review", true);
  });

  await test.step("Mark as done clears it at once; working again wakes it, and a later block does not", async () => {
    const retained = parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Execution", readyStory),
    });
    await markDoneAnyway(entry);
    await expect(entry).toHaveCount(0);
    await expectSessionShown(retained, "Done", false);
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectSessionShown(retained, "Working", false);
    dashboard.claudeSessionBecomes(session, "blocked");
    await passOnePace();
    await expectSessionShown(retained, "Done", false);
  });

  await expectNotReloaded(page);
});
