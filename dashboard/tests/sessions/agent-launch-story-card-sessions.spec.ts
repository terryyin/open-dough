import { closeSidePanel } from "../sidePanelFrame.ts";
// A story's card lists its unclosed sessions in every column origin shows it,
// beside Start actions that stay disabled, through reloads. A story in no list
// keeps its open sessions in local Taken; Mark as done retains one in Recently
// done. Start availability after Mark as done or Delete record is
// ../launches/agent-launch-story-card-open-session.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import {
  storyCardSessions,
  expectMembership,
  parts,
  sessionEntriesIn,
  sessionEntryShowing,
  sessionIdLineOf,
  sessionStateOf,
} from "../dashboardPage.ts";
import { expectSessionEntrySetOff } from "../pageColours.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import {
  expectStartsBlocked,
  launchOnEachQueuedCard,
  describedBy,
  queuedStories as queued,
} from "../storyCardSessionListing.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../support/markDone.ts";
import {
  terminalPanel,
  terminalScreenParts,
  openTerminalFromEntry,
} from "../terminalScreenPage.ts";

// What every blocked Start says while its card has an open session.
const openSessionNote =
  "This story has an open session. Mark it done or delete its record to start another.";

test.use({
  projectFolders: ["open-dough"],
  extraEnv: briefDoneRenameWait,
});

test.describe("a story's card as origin publishes what its sessions do", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );
  test("a card lists each unclosed session beside its Start actions through Preparing, each reloaded", async ({
    page,
    dashboard,
  }) => {
    const { action, settled, show, card, expectListed } =
      await launchOnEachQueuedCard(page, dashboard, columnsJourney);
    const { recentlyDone } = parts(page);
    const launches = () => dashboard.claudeLaunchCalls();

    const newest = storyCardSessions(card(readyStory)).first();
    await expect(sessionStateOf(newest)).toHaveText("Working");
    await expect(newest).toContainText(
      "Local: launched from this dashboard on this machine.",
    );
    await expect(newest).not.toContainText(readyStory);
    await expectListed();
    await expectStartsBlocked(action, queued, openSessionNote);
    await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
    expect(launches()).toHaveLength(3);

    await test.step("a Preparing card keeps its sessions, each set off on the panel in the card's text, and notes Start refinement", async () => {
      await show(columnsJourney.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      await expectListed();
      await expectStartsBlocked(action, queued, openSessionNote);
      await expect(
        action(readyStory, "Refinement"),
      ).toHaveAccessibleDescription(
        new RegExp(`Being prepared.*${describedBy(openSessionNote).source}`),
      );
      await expectSessionEntrySetOff(storyCardSessions(card(readyStory)));

      await page.reload();
      await settled();
      await expectListed();
    });

    expect(launches()).toHaveLength(3);
  });

  test("the published Take shows the story under Taken, whose card keeps every session, set off on the panel in the card's text, and offers no Start, through reload", async ({
    page,
    dashboard,
  }) => {
    const { action, settled, show, expectListed } =
      await launchOnEachQueuedCard(page, dashboard, columnsJourney);
    const { taken } = parts(page);
    const launches = () => dashboard.claudeLaunchCalls();
    await show(columnsJourney.taken);
    const backlog = [takenStory, notRefinedStory];
    await expectMembership(page, { taken: [readyStory], backlog });
    const takenStoryCard = taken.getByRole("article", { name: readyStory });
    await expect(storyCardSessions(takenStoryCard)).toHaveCount(1);
    await expectListed([readyStory, ...backlog]);
    await expectStartsBlocked(action, backlog, openSessionNote);
    await expect(
      takenStoryCard.getByRole("button", { name: /^Start / }),
    ).toHaveCount(0);
    await expectSessionEntrySetOff(storyCardSessions(takenStoryCard).first());
    await page.reload();
    await expectMembership(page, { taken: [readyStory], backlog });
    await settled();
    await expectListed([readyStory, ...backlog]);

    expect(launches()).toHaveLength(3);
  });

  test("a story in no list keeps its open sessions in local Taken, and Mark as done retains one in Recently done while its story stays in Backlog", async ({
    page,
    dashboard,
  }) => {
    const { settled, show, card, listed, expectListed } =
      await launchOnEachQueuedCard(page, dashboard, columnsJourney);
    const { taken, recentlyDone } = parts(page);
    const launches = () => dashboard.claudeLaunchCalls();
    const completed = { taken: [readyStory], backlog: [takenStory] };
    await show(columnsJourney.taken, { reload: false });
    await expectMembership(page, {
      taken: [readyStory],
      backlog: [takenStory, notRefinedStory],
    });

    await test.step("completion moves the open session into local Taken and returning the story restores its card without reattaching", async () => {
      const key = listed.get(notRefinedStory)?.[0]?.key;
      const native = listed.get(notRefinedStory)?.[0]?.session;
      if (!key || !native) throw new Error("No completed story session");
      await openTerminalFromEntry(storyCardSessions(card(notRefinedStory)));
      const panel = terminalPanel(page);
      await expect(terminalScreenParts(panel).rows).toContainText("attached");
      const attaches = dashboard.claudeAttaches().length;
      await show(columnsJourney.completed, { reload: false });
      await expectMembership(page, completed);
      const local = sessionEntryShowing(taken, key);
      const onBoard = sessionEntryShowing(parts(page).board, key);
      const doneCard = recentlyDone.getByRole("article", {
        name: notRefinedStory,
        exact: true,
      });
      await expect(sessionIdLineOf(local, native)).toBeAttached();
      await expect(local).toContainText("Shown in terminal");
      await expect(doneCard).toBeVisible();
      await expect(sessionEntriesIn(doneCard)).toHaveCount(0);
      await expect(onBoard).toHaveCount(1);
      await show(columnsJourney.taken, { reload: false });
      await expectListed([readyStory, takenStory, notRefinedStory]);
      await expect(storyCardSessions(card(notRefinedStory))).toContainText(
        "Shown in terminal",
      );
      expect(dashboard.claudeAttaches()).toHaveLength(attaches);
      await show(columnsJourney.completed, { reload: false });
      await closeSidePanel(panel, { using: "mouse" });
      await expect(local).toBeFocused();
      await page.reload();
      await expectMembership(page, completed);
      await expect(sessionIdLineOf(local, native)).toBeAttached();
      await expectListed([readyStory, takenStory]);
      await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
    });

    await test.step("Mark as done retains the same session in Recently done while its story stays in Backlog, through reload", async () => {
      const closed = listed.get(takenStory)?.[0];
      if (closed === undefined) throw new Error("No launched refinement");
      idleBetweenSteps(dashboard, closed.session);
      await markDoneAnyway(storyCardSessions(card(takenStory)));
      listed.set(takenStory, []);
      const retained = sessionEntryShowing(recentlyDone, closed.key);
      await expect(retained).toHaveCount(1);
      await expect(retained).toContainText(`Session ${closed.session}`);
      await expect(retained).toContainText("Refinement started in Claude Code");
      await expectListed([readyStory, takenStory]);
      await expect(
        sessionEntryShowing(parts(page).board, closed.key),
      ).toHaveCount(1);
      await page.reload();
      await settled();
      await expectMembership(page, completed);
      await expectListed([readyStory, takenStory]);
      await expect(retained).toContainText(`Session ${closed.session}`);
    });

    expect(launches()).toHaveLength(3);
  });
});
