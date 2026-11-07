// A story's card lists the sessions launched on it that have not been marked
// done, in every column origin shows it, on a committed origin the production
// commands publish (../launchJourney.ts): a launch lists its session beside
// the Start actions, which stay disabled while that session is open; each
// story's own open session, an Execution or a Refinement, is listed; a
// Preparing card keeps its listing; the Taken card keeps it and offers no
// Start; and a reload in each keeps it. A story that leaves every list keeps
// its open sessions as local Taken entries.
// Each open session occurs once across the columns, while closing one puts
// its retained entry in Recently done without changing its story's column.
// That Starts stay unavailable for an open session, return after Mark as done
// or Delete record, and a dialog opened beforehand is refused, is
// ../launches/agent-launch-story-card-open-session.spec.ts.
// That a restart, a reload, and a project switch keep each entry and its
// state is ./agent-launch-story-card-session-states.spec.ts, and that closing or
// losing a terminal leaves its session listed is ../terminals/agent-terminal.spec.ts and
// ../terminals/agent-terminal-lifetime.spec.ts. Origin alone places every story.
// The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import type { Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import {
  storyCardSessions,
  expectMembership,
  parts,
  sessionStateOf,
} from "../dashboardPage.ts";
import { expectSessionEntrySetOff } from "../pageColours.ts";
import { openSessionStartReason } from "../../src/agentLaunch.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { storyCardSessionListing } from "../storyCardSessionListing.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../support/markDone.ts";

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
  const queued = [takenStory, readyStory, notRefinedStory];

  // Opens origin's queued revision and launches, from the Backlog cards, an
  // Execution on the ready and the not-refined story and a Refinement on
  // takenStory: each is listed on its own card. Origin later takes the ready
  // story.
  const launchOnEachQueuedCard = async (
    page: Page,
    dashboard: DashboardServer,
  ) => {
    dashboard.claudeScenario("launched");
    const opened = await openStoryColumnsJourney(page, columnsJourney);
    // A story's card in whichever column origin shows it.
    const card = (title: string) =>
      parts(page).board.getByRole("article", { name: title, exact: true });
    await expectMembership(page, { taken: [], backlog: queued });
    await opened.settled();
    const listing = storyCardSessionListing(page, card, opened.launch, queued);
    await listing.launchListed(readyStory, "Execution");
    await listing.launchListed(notRefinedStory, "Execution");
    await listing.launchListed(takenStory, "Refinement");
    return { ...opened, ...listing, card };
  };

  const openSessionDescription = new RegExp(
    openSessionStartReason.replace(/[.]/g, "\\."),
  );
  // Read together: checking a Start action changes nothing on the page.
  const expectStartsBlocked = (
    action: Awaited<ReturnType<typeof launchOnEachQueuedCard>>["action"],
    titles: readonly string[],
  ) =>
    Promise.all(
      titles.flatMap((title) =>
        (["Execution", "Refinement"] as const).flatMap((workflow) => [
          expect(action(title, workflow)).toBeDisabled(),
          expect(action(title, workflow)).toHaveAccessibleDescription(
            openSessionDescription,
          ),
        ]),
      ),
    );

  test("a card lists each unclosed session beside its Start actions through Preparing, each reloaded", async ({
    page,
    dashboard,
  }) => {
    const { action, settled, show, card, expectListed } =
      await launchOnEachQueuedCard(page, dashboard);
    const { recentlyDone } = parts(page);
    const launches = () => dashboard.claudeLaunchCalls();

    const newest = storyCardSessions(card(readyStory)).first();
    await expect(sessionStateOf(newest)).toHaveText("Working");
    await expect(newest).toContainText(
      "Local: launched from this dashboard on this machine.",
    );
    await expect(newest).not.toContainText(readyStory);
    await expectListed();
    await expectStartsBlocked(action, queued);
    await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
    expect(launches()).toHaveLength(3);

    await test.step("a Preparing card keeps its sessions, each set off on the panel in the card's text, and notes Start refinement", async () => {
      await show(columnsJourney.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      await expectListed();
      await expectStartsBlocked(action, queued);
      await expect(
        action(readyStory, "Refinement"),
      ).toHaveAccessibleDescription(
        new RegExp(`Being prepared.*${openSessionDescription.source}`),
      );
      for (const title of [takenStory, notRefinedStory]) {
        await expect(action(title, "Refinement")).toHaveAccessibleDescription(
          openSessionDescription,
        );
      }
      // Each entry is set off from its Preparing card on the panel, in the
      // card's own text, with its local-launch note quiet.
      for (const entry of await storyCardSessions(card(readyStory)).all())
        await expectSessionEntrySetOff(entry);

      await page.reload();
      await settled();
      await expectListed();
    });

    // Nothing was launched again along the way.
    expect(launches()).toHaveLength(3);
  });

  test("the published Take shows the story under Taken, whose card keeps every session, set off on the panel in the card's text, and offers no Start, through reload", async ({
    page,
    dashboard,
  }) => {
    const { action, settled, show, expectListed } =
      await launchOnEachQueuedCard(page, dashboard);
    const { taken } = parts(page);
    const launches = () => dashboard.claudeLaunchCalls();
    await show(columnsJourney.taken);
    const backlog = [takenStory, notRefinedStory];
    await expectMembership(page, { taken: [readyStory], backlog });
    const takenStoryCard = taken.getByRole("article", { name: readyStory });
    await expect(storyCardSessions(takenStoryCard)).toHaveCount(1);
    await expectListed([readyStory, ...backlog]);
    await expectStartsBlocked(action, backlog);
    await expect(
      takenStoryCard.getByRole("button", { name: /^Start / }),
    ).toHaveCount(0);
    await expectSessionEntrySetOff(storyCardSessions(takenStoryCard).first());
    await page.reload();
    await expectMembership(page, { taken: [readyStory], backlog });
    await settled();
    await expectListed([readyStory, ...backlog]);

    // Nothing was launched again along the way.
    expect(launches()).toHaveLength(3);
  });

  test("a story in no list keeps its open sessions in local Taken, and Mark as done retains one in Recently done while its story stays in Backlog", async ({
    page,
    dashboard,
  }) => {
    const { settled, show, card, listed, expectListed } =
      await launchOnEachQueuedCard(page, dashboard);
    const { taken, recentlyDone } = parts(page);
    const launches = () => dashboard.claudeLaunchCalls();
    // Origin takes the ready story first; it leaves Backlog for Taken.
    await show(columnsJourney.taken, { reload: false });
    await expectMembership(page, {
      taken: [readyStory],
      backlog: [takenStory, notRefinedStory],
    });

    await test.step("completion moves the open session into local Taken and returning the story restores its card without reattaching", async () => {
      const key = listed.get(notRefinedStory)?.[0]?.key;
      const native = listed.get(notRefinedStory)?.[0]?.session;
      if (!key || !native) throw new Error("No completed story session");
      await storyCardSessions(card(notRefinedStory))
        .getByRole("button", { name: "Open terminal" })
        .click();
      const panel = page.getByRole("region", { name: "Terminal" });
      await expect(panel.locator(".xterm-rows")).toContainText("attached");
      const attaches = dashboard.claudeAttaches().length;
      await show(columnsJourney.completed, { reload: false });
      const completed = { taken: [readyStory], backlog: [takenStory] };
      await expectMembership(page, completed);
      const local = taken.locator(`[data-shows-session="${key}"]`);
      const doneCard = recentlyDone.getByRole("article", {
        name: notRefinedStory,
        exact: true,
      });
      await expect(local).toContainText(`Session ${native}`);
      await expect(local).toContainText("Shown in terminal");
      await expect(doneCard).toBeVisible();
      await expect(doneCard.locator(".session-entry")).toHaveCount(0);
      await expect(
        page.locator(`.board [data-shows-session="${key}"]`),
      ).toHaveCount(1);
      expect(dashboard.claudeAttaches()).toHaveLength(attaches);
      await show(columnsJourney.taken, { reload: false });
      await expectListed([readyStory, takenStory, notRefinedStory]);
      await expect(storyCardSessions(card(notRefinedStory))).toContainText(
        "Shown in terminal",
      );
      expect(dashboard.claudeAttaches()).toHaveLength(attaches);
      await show(columnsJourney.completed, { reload: false });
      await expect(local).toContainText("Shown in terminal");
      await panel.getByRole("button", { name: "Close" }).click();
      await expect(local).toBeFocused();
      await page.reload();
      await expectMembership(page, completed);
      await expect(local).toContainText(`Session ${native}`);
      await expectListed([readyStory, takenStory]);
      await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
    });

    await test.step("Mark as done retains the same session in Recently done while its story stays in Backlog, through reload", async () => {
      const closed = listed.get(takenStory)?.[0];
      if (closed === undefined) throw new Error("No launched refinement");
      idleBetweenSteps(dashboard, closed.session);
      await markDoneAnyway(storyCardSessions(card(takenStory)));
      listed.set(takenStory, []);
      const retained = recentlyDone.locator(
        `[data-shows-session="${closed.key}"]`,
      );
      await expect(retained).toHaveCount(1);
      await expect(retained).toContainText(`Session ${closed.session}`);
      await expect(retained).toContainText("Refinement started in Claude Code");
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expectListed([readyStory, takenStory]);
      await expect(
        page.locator(`.board [data-shows-session="${closed.key}"]`),
      ).toHaveCount(1);
      await page.reload();
      await settled();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expectListed([readyStory, takenStory]);
      await expect(retained).toHaveCount(1);
      await expect(retained).toContainText(`Session ${closed.session}`);
    });

    // Nothing was launched again along the way.
    expect(launches()).toHaveLength(3);
  });
});
