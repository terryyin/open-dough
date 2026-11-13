// Session entries show Claude Code's state and attention reason, with a solid,
// heavier edge only when the developer is needed. Changes appear within one
// records-read pace without reload; origin alone places the stories. The card
// placement variants are in ./agent-launch-story-card-session-states.spec.ts,
// counts in ./agent-launch-attention.spec.ts, and how a terminal and Mark as
// done acknowledge attention in ./agent-launch-session-acknowledgment.spec.ts.
// The real dashboard launches fixtures/fake-claude; its controls
// change/forget/fail listing. Page time stands still except when the journey
// advances it.

import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  storyCardSessionOf,
  storyCardSessionName,
  expectMembership,
  parts,
  sessionNamedBy,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  openTakenBacklog,
  takenBacklogStories,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import {
  expectNotReloaded,
  expectSessionShown,
  listingUnreadableShown,
  markNotReloaded,
  watchRecordReads,
} from "../../dashboard/tests/sessionStatePace.ts";
import { attentionLaunches } from "../../dashboard/tests/sessionAttentionCases.ts";
import { attempts } from "../../dashboard/tests/agentLaunchBoundary.ts";

test.use({ projectFolders: ["open-dough"] });

test("each active card entry shows why its session needs attention, or that it does not, within one pace without a reload", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const { passOnePace, answeredDuring } = await watchRecordReads(page);
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
    return storyCardSessionOf(card(own.title), own.workflow);
  };
  const sessionIds: string[] = [];
  for (const [index, { workflow }] of attentionLaunches.entries()) {
    await expect(entryAt(index)).toHaveAccessibleName(
      storyCardSessionName(workflow),
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

  await test.step("a pace with nothing changed keeps every entry from an unchanged answer to the revision the page holds", async () => {
    // Once every start is noted reconciled, a pace reads that last write.
    const reconciled = async () =>
      (await attempts(dashboard)).every(({ reconciledAt }) => reconciledAt);
    await expect.poll(reconciled).toBe(true);
    await passOnePace();
    expect(await answeredDuring()).toEqual({ held: true, unchanged: true });
    for (const index of attentionLaunches.keys())
      await expectSessionShown(entryAt(index), "Working", false);
  });

  await test.step("blocked with a reason, or done with its process running, shows within one pace", async () => {
    // The page held the earlier revision, and was answered in full.
    const answered = await answeredDuring(() => change(0));
    expect(answered).toEqual({ held: true, unchanged: false });
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
      await expectSessionShown(entry, listingUnreadableShown, false);
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
  await expectMembership(page, takenBacklogStories);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(attentionLaunches.length);
});
