import { closeSidePanel } from "../../dashboard/test-support/sidePanelFrame.ts";
// A story's card lists its unclosed sessions in every column origin shows it,
// beside Start actions that stay disabled, through reloads. A story in no list
// keeps its open sessions in local Taken; Mark as done retains one in Recently
// done. Start availability after Mark as done or Delete record is
// ../launches/agent-launch-story-card-open-session.spec.ts.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { sessionKey } from "../../dashboard/src/sessionReference.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  storyCardSessions,
  expectMembership,
  parts,
  sessionEntriesIn,
  sessionEntryShowing,
  sessionIdLineOf,
  sessionStateOf,
  expandStoryCardDoneHistory,
  storyCardDoneDisclosure,
} from "../../dashboard/test-support/dashboardPage.ts";
import { expectSessionEntryInCardText } from "../../dashboard/test-support/pageColours.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import {
  expectStartsBlocked,
  openQueuedStoryCards,
  storyCardSessionListing,
  describedBy,
  queuedStories as queued,
} from "../../dashboard/test-support/storyCardSessionListing.ts";
import { openDoughWorkingSessions } from "../../dashboard/test-support/storyCardOpenSessions.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import {
  terminalPanel,
  terminalScreenParts,
  openTerminalFromEntry,
} from "../../dashboard/test-support/terminalScreenPage.ts";

// What every blocked Start says while its card has an open session.
const openSessionNote =
  "This story has an open session. Mark it done or delete its record to start another.";

test.use({
  projectFolders: ["open-dough"],
  extraEnv: briefDoneRenameWait,
});

test.describe("a story's card as origin publishes what its sessions do", () => {
  let columnsJourney: StoryColumnsJourney;
  let opened: Awaited<ReturnType<typeof openQueuedStoryCards>>;
  let listed: Map<
    string,
    { workflow: "Execution" | "Refinement"; session: string; key: string }[]
  >;
  let expectListed: ReturnType<typeof storyCardSessionListing>;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );
  test.beforeEach(async ({ page, dashboard }) => {
    listed = new Map();
    for (const {
      project,
      identity,
      title,
      workflow,
    } of openDoughWorkingSessions) {
      const { sessionId } = await composeSession(dashboard, project, {
        identity,
        title,
        workflow: workflow === "Execution" ? "execution" : "refinement",
      });
      const key = sessionKey({ host: "claude", sessionId });
      listed.set(title, [{ workflow, session: sessionId, key }]);
    }
    opened = await openQueuedStoryCards(page, columnsJourney);
    expectListed = storyCardSessionListing(page, opened.card, listed);
    await expectListed();
  });
  test("a card lists each unclosed session beside its Start actions through Preparing, each reloaded", async ({
    page,
    dashboard,
  }) => {
    const { action, settled, show, card } = opened;
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
    expect(launches()).toEqual([]);

    await test.step("a Preparing card keeps its sessions, each in the card's text, and notes Start refinement", async () => {
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
      await expectSessionEntryInCardText(storyCardSessions(card(readyStory)));

      await page.reload();
      await settled();
      await expectListed();
    });

    expect(launches()).toEqual([]);
  });

  test("the published Take shows the story under Taken, whose card keeps every session in the card's text and offers no Start, through reload", async ({
    page,
    dashboard,
  }) => {
    const { action, settled, show } = opened;
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
    await expectSessionEntryInCardText(
      storyCardSessions(takenStoryCard).first(),
    );
    await page.reload();
    await expectMembership(page, { taken: [readyStory], backlog });
    await settled();
    await expectListed([readyStory, ...backlog]);

    expect(launches()).toEqual([]);
  });

  test("a story in no list keeps its open sessions in local Taken, and Mark as done retains one in the unfinished card's Done history while its story stays in Backlog", async ({
    page,
    dashboard,
  }) => {
    const { settled, show, card } = opened;
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

    await test.step("Mark as done retains the same session in the unfinished card's Done history while its story stays in Backlog, through reload", async () => {
      const closed = listed.get(takenStory)?.[0];
      if (closed === undefined) throw new Error("No recorded refinement");
      idleBetweenSteps(dashboard, closed.session);
      await markDoneAnyway(storyCardSessions(card(takenStory)));
      listed.set(takenStory, []);
      await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
      await expandStoryCardDoneHistory(card(takenStory));
      const retained = sessionEntryShowing(card(takenStory), closed.key);
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
      await expect(storyCardDoneDisclosure(card(takenStory))).toContainText(
        "1",
      );
      await expandStoryCardDoneHistory(card(takenStory));
      await expect(retained).toContainText(`Session ${closed.session}`);
    });

    expect(launches()).toEqual([]);
  });
});
