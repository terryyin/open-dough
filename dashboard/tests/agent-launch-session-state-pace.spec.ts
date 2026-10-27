// Session entries show Claude Code's state and attention reason, with a solid,
// heavier edge only when the developer is needed. Changes appear within one
// records-read pace without reload; origin alone places the stories. The card
// placement variants are in agent-launch-card-session-states.spec.ts and counts
// in agent-launch-attention.spec.ts. Opening/answering/closing a blocked terminal
// leaves Needs input until a later listing says Working: synthetic Claude only
// echoes input. Mark as done clears attention permanently; a marked session is
// Working while the host works and Done otherwise. The real dashboard launches
// fixtures/fake-claude; its controls change/forget/fail listing. Page time stands
// still except when the journey advances it; attachOpens owns terminal readiness.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  cardSessionName,
  expectMembership,
  parts,
  sessionNamedBy,
  standaloneSessionName,
} from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { notRefinedStory, readyStory, takenStory } from "./launchJourney.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  markNotReloaded,
  watchRecordReads,
} from "./sessionStatePace.ts";
import { attentionLaunches } from "./sessionAttentionCases.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

const unknownShown =
  "State unknown: Claude Code's session list could not be read";
// Session state never moves a story: origin alone places each one.
const membership = {
  taken: [takenStory],
  backlog: [readyStory, notRefinedStory],
};

test("each active card entry shows why its session needs attention, or that it does not, within one pace without a reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace } = await watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog, refine, refinementDialog } =
    await openTakenBacklog(page, launchJourney);
  const { recentlyDone: recent } = parts(page);
  const entries = parts(page).board.locator(".session-entry");

  for (const { title, workflow } of attentionLaunches.toReversed()) {
    const before = await entries.count();
    if (workflow === "Execution") {
      await start(title).click();
      await dialog.getByRole("button", { name: "Start" }).click();
    } else {
      await refine(title).click();
      await refinementDialog.getByRole("button", { name: "Start" }).click();
    }
    await expect(entries).toHaveCount(before + 1);
    // The published read that reconciles the start lands before page time
    // passes, so its wait bound never ends it.
    await expect(
      card(title).getByRole("button", { name: "Inspect story" }),
    ).toBeEnabled();
  }
  const entryAt = (index: number) => {
    const own = attentionLaunches[index];
    if (own === undefined) throw new Error("No launch at this index");
    return cardSessionOf(card(own.title), own.workflow);
  };
  const sessionIds: string[] = [];
  for (const [index, { workflow }] of attentionLaunches.entries()) {
    await expect(entryAt(index)).toHaveAccessibleName(
      cardSessionName(workflow),
    );
    await expectSessionShown(entryAt(index), "Working", false);
    sessionIds.push(await sessionNamedBy(entryAt(index)));
  }
  await markNotReloaded(page);

  const expectChanged = async (round: 0 | 1) => {
    for (const [index, { changes }] of attentionLaunches.entries()) {
      const { shows, needsAttention } = changes[round];
      const entry = entryAt(index);
      await expectSessionShown(entry, shows, needsAttention);
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(shows === "Session unavailable" ? 0 : 1);
    }
  };
  const change = async (round: 0 | 1) => {
    for (const [index, { changes }] of attentionLaunches.entries()) {
      const { change, waitingFor } = changes[round];
      dashboard.claudeSessionBecomes(
        sessionIds[index] ?? "?",
        change,
        waitingFor,
      );
    }
    await passOnePace();
  };

  await test.step("blocked with a reason, or done with its process running, shows within one pace", async () => {
    await change(0);
    await expectChanged(0);
  });

  await test.step("stopped, or no longer listed, replaces it, with no stale reason", async () => {
    await change(1);
    await expectChanged(1);
    // An unavailable session keeps its id, without Open terminal.
    await expect(entryAt(1)).toContainText(`Session ${sessionIds[1] ?? "?"}`);
  });

  await test.step("an unreadable listing shows State unknown with its note and no attention, and a readable one shows each state again", async () => {
    dashboard.claudeListingFails(true);
    await passOnePace();
    for (const index of attentionLaunches.keys()) {
      const entry = entryAt(index);
      await expectSessionShown(entry, unknownShown, false);
      await expect(
        entry.getByRole("button", { name: "Open terminal" }),
      ).toHaveCount(1);
    }

    dashboard.claudeListingFails(false);
    await passOnePace();
    await expectChanged(1);
  });

  await expectNotReloaded(page);
  await expect(recent.locator(".session-entry")).toHaveCount(0);
  await expectMembership(page, membership);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(attentionLaunches.length);
});

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
  const panel = page.getByRole("region", { name: "Terminal" });
  const onCard = cardSessionOf(card(readyStory), "Execution");
  const inRecent = recent.getByRole("article", {
    name: standaloneSessionName("Execution", readyStory),
  });
  const expectOpen = async (words: string, needsAttention: boolean) => {
    await expectSessionShown(onCard, words, needsAttention);
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
  const session = await sessionNamedBy(onCard);
  await markNotReloaded(page);

  await test.step("a blocked session needs input, and still does after its terminal is opened, answered, and closed", async () => {
    dashboard.claudeSessionBecomes(session, "blocked", "input needed");
    await passOnePace();
    await expectOpen(needsInput, true);

    await onCard.getByRole("button", { name: "Open terminal" }).click();
    // The stopped page clock holds the terminal's drawing, so the attach
    // and the answer are read from the synthetic `claude` itself.
    const attach = () => dashboard.claudeAttaches()[0];
    await expect.poll(() => attach()?.id).toBe(session.slice(0, 8));
    await page.keyboard.type("red");
    await page.keyboard.press("Enter");
    await expect.poll(() => attach()?.lines).toEqual(["red"]);
    await expectOpen(needsInput, true);
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);
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
    await markDoneAnyway(onCard);
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
    await expectSessionShown(inRecent, unknownShown, false);
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
  await expectMembership(page, membership);
});
