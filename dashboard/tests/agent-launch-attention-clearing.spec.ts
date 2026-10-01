// A session's attention lasts as long as Claude Code's state asks for the
// developer, and deliberate closure ends it: opening its terminal, answering,
// and closing the terminal leave a blocked session's Needs input in place
// until the next listing reports it working again, which clears it within one
// pace without a reload. A successful Mark as done clears it at once, and a
// session marked done never needs attention again: it reads Working while
// Claude Code says so, as when opening it wakes it, and Done otherwise, even
// once done again, blocked, or no longer listed. What each state shows is
// ./agent-launch-recent-session-states.spec.ts. The synthetic `claude`
// (./fixtures/fake-claude) only echoes what is typed into its terminal; a
// later listing, not the answer, supplies the resumed state, and the real
// host's own resumption is recorded by this story's plan. The real `claude`
// is never reached. The page clock stands still unless the journey lets it
// pass.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  takenStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "./sessionStatePace.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const needsInput = "Needs input: input needed";

test("a session's attention stays through opening and closing its terminal, clears when it works again or is marked done, and never returns once marked done", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page, journey);
  const { recentSessions: recent } = parts(page);
  const panel = page.getByRole("region", { name: "Terminal" });
  const onCard = cardSessionOf(card(readyStory), "Execution");
  const inRecent = recent.getByRole("article", {
    name: recentSessionName("Execution", readyStory),
  });
  const expectBoth = async (words: string, needsAttention: boolean) => {
    await expectSessionShown(onCard, words, needsAttention);
    await expectSessionShown(inRecent, words, needsAttention);
  };

  await start(readyStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();
  await expectBoth("Working", false);
  // The published read that reconciles the start lands before page time
  // passes, so its wait bound never ends it.
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  const session = await sessionNamedBy(inRecent);
  await markNotReloaded(page);

  await test.step("a blocked session needs input, and still does after its terminal is opened, answered, and closed", async () => {
    dashboard.claudeSessionBecomes(session, "blocked", "input needed");
    await passOnePace();
    await expectBoth(needsInput, true);

    await onCard.getByRole("button", { name: "Open terminal" }).click();
    // The stopped page clock holds the terminal's drawing, so the attach
    // and the answer are read from the synthetic `claude` itself.
    const attach = () => dashboard.claudeAttaches()[0];
    await expect.poll(() => attach()?.id).toBe(session.slice(0, 8));
    await page.keyboard.type("red");
    await page.keyboard.press("Enter");
    await expect.poll(() => attach()?.lines).toEqual(["red"]);
    await expectBoth(needsInput, true);
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
    await expect.poll(() => attach()?.endedBy).toBeDefined();

    await passOnePace();
    await expectBoth(needsInput, true);
  });

  await test.step("the next listing of resumed work clears it within one pace, and a finished turn asks for review", async () => {
    dashboard.claudeSessionBecomes(session, "working");
    await passOnePace();
    await expectBoth("Working", false);

    dashboard.claudeSessionBecomes(session, "done-live");
    await passOnePace();
    await expectBoth("Ready for review", true);
  });

  await test.step("a successful Mark as done clears it at once, and no later host state brings it back", async () => {
    await onCard.getByRole("button", { name: "Mark as done" }).click();
    await expect(onCard).toHaveCount(0);
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
    await expectSessionShown(
      inRecent,
      "State unknown: Claude Code's session list could not be read",
      false,
    );
    dashboard.claudeListingFails(false);
    dashboard.claudeSessionBecomes(session, "forgotten");
    await passOnePace();
    await expectSessionShown(inRecent, "Done", false);
    await expect(
      inRecent.getByRole("button", { name: "Open terminal" }),
    ).toHaveCount(0);
    await expect(onCard).toHaveCount(0);
  });

  await expectNotReloaded(page);
  // Session state never moves a story: origin alone places each one.
  await expectMembership(page, {
    taken: [takenStory],
    backlog: [readyStory, notRefinedStory],
  });
});
