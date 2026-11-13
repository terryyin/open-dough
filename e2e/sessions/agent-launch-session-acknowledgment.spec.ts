// A session's attention, shown on its card entry, is acknowledged only by the
// host's own later listing or by Mark as done. Opening, answering and closing
// a blocked session's terminal leaves Needs input until a later listing says
// Working: synthetic Claude only echoes input. Mark as done clears attention
// permanently; a marked session is Working while the host works and Done
// otherwise. How each state shows within one records-read pace:
// ./agent-launch-session-state-pace.spec.ts. The real dashboard launches
// fixtures/fake-claude; its controls change/forget/fail listing. Page time
// stands still except when the journey advances it; attachOpens owns terminal
// readiness.

import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  closeTerminal,
  openTerminalControl,
  terminalPanel,
} from "../../dashboard/tests/terminalScreenPage.ts";
import {
  storyCardSessionOf,
  expectMembership,
  parts,
  sessionNamedBy,
  standaloneSessionName,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  openTakenBacklog,
  takenBacklogStories,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import { readyStory } from "../../dashboard/tests/launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  listingUnreadableShown,
  markNotReloaded,
  watchRecordReads,
} from "../../dashboard/tests/sessionStatePace.ts";
import { markDoneAnyway } from "../../dashboard/tests/support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

const needsInput = "Needs input: input needed";

test("a session's attention stays through opening and closing its terminal, clears when it works again or is marked done, and never returns once marked done", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page, launchJourney);
  const { recentlyDone: recent } = parts(page);
  const panel = terminalPanel(page);
  const onStoryCard = storyCardSessionOf(card(readyStory), "Execution");
  const inRecent = recent.getByRole("article", {
    name: standaloneSessionName("Execution", readyStory),
  });
  const expectOpen = async (words: string, needsAttention: boolean) => {
    await expectSessionShown(onStoryCard, words, needsAttention);
    await expect(inRecent).toHaveCount(0);
  };

  await start(readyStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();
  await expectOpen("Working", false);
  // The published read that reconciles the start lands before page time
  // passes, so its wait bound never ends it.
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  const session = await sessionNamedBy(onStoryCard);
  await markNotReloaded(page);

  await test.step("a blocked session needs input, and still does after its terminal is opened, answered, and closed", async () => {
    dashboard.claudeSessionBecomes(session, "blocked", "input needed");
    await passOnePace();
    await expectOpen(needsInput, true);

    await openTerminalControl(onStoryCard).click();
    // The stopped page clock holds the terminal's drawing, so the attach
    // and the answer are read from the synthetic `claude` itself.
    const attach = () => dashboard.claudeAttaches()[0];
    await expect.poll(() => attach()?.id).toBe(session.slice(0, 8));
    await page.keyboard.type("red");
    await page.keyboard.press("Enter");
    await expect.poll(() => attach()?.lines).toEqual(["red"]);
    await expectOpen(needsInput, true);
    await closeTerminal(panel);
    await expect.poll(() => attach()?.endedBy).toBeDefined();

    await passOnePace();
    await expectOpen(needsInput, true);
  });

  await test.step("the next listing of resumed work clears it within one pace, and a finished turn asks for review", async () => {
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectOpen("Working", false);

    dashboard.claudeSessionBecomes(session, "done-live");
    await passOnePace();
    await expectOpen("Ready for review", true);
  });

  await test.step("a successful Mark as done clears it at once, and no later host state brings it back", async () => {
    await markDoneAnyway(onStoryCard);
    await expect(onStoryCard).toHaveCount(0);
    await expectSessionShown(inRecent, "Done", false);

    // Opening it again wakes it.
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectSessionShown(inRecent, "Working", false);

    for (const change of ["done-live", "blocked", "failed"] as const) {
      dashboard.claudeSessionBecomes(session, change);
      await passOnePace();
      await expectSessionShown(inRecent, "Done", false);
    }

    dashboard.claudeListingFails(true);
    await passOnePace();
    await expectSessionShown(inRecent, listingUnreadableShown, false);
    dashboard.claudeListingFails(false);
    dashboard.claudeSessionBecomes(session, "forgotten");
    await passOnePace();
    await expectSessionShown(inRecent, "Done", false);
    await expect(
      inRecent.getByRole("button", { name: "Open terminal" }),
    ).toHaveCount(0);
    await expect(onStoryCard).toHaveCount(0);
  });

  await expectNotReloaded(page);
  await expectMembership(page, takenBacklogStories);
});
