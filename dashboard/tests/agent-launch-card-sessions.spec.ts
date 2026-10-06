// A story's card lists the sessions launched on it that have not been marked
// done, in every stage origin shows it, on a committed origin the production
// commands publish (./launchJourney.ts): a launch lists its session beside
// the Start actions, which stay disabled while that session is open; each
// story's own open session is listed; a refinement launched on a Preparing
// card is listed at once; the Taken card keeps the listing and offers no
// Start; and a reload in each keeps it. A story that leaves every list keeps
// its sessions only in Recently done, inside its done card once it is done.
// Each open session occurs once across the columns, while closing one puts
// its retained entry in Recently done without changing its story's stage.
// That Starts stay unavailable for an open session, return after Mark as done
// or Delete record, and a dialog opened beforehand is refused, is
// ./agent-launch-card-open-session.spec.ts.
// That a restart, a reload, and a project switch keep each entry and its
// state is ./agent-launch-card-session-states.spec.ts, and that closing or
// losing a terminal leaves its session listed is ./agent-terminal.spec.ts and
// ./agent-terminal-lifetime.spec.ts. Origin alone places every story.
// The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessions,
  expectMembership,
  parts,
  recentlyDoneSessionName,
  sessionStateOf,
} from "./dashboardPage.ts";
import { expectSessionEntrySetOff } from "./pageColours.ts";
import { openSessionStartReason } from "../src/agentLaunch.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { cardSessionListing } from "./cardSessionListing.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("a story's card as origin publishes what its sessions do", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a card lists each unclosed session beside its Start actions through Preparing and Taken, each reloaded, and a story in no list keeps them only in Recently done", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { action, settled, show, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { stages, taken, recentlyDone } = parts(page);
    // A story's card in whichever stage origin shows it.
    const card = (title: string) =>
      stages.getByRole("article", { name: title, exact: true });
    const launches = () => dashboard.claudeLaunchCalls();
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();

    const { listed, launchListed, expectListed } = cardSessionListing(
      page,
      card,
      launch,
      queued,
    );
    const openSessionDescription = new RegExp(
      openSessionStartReason.replace(/[.]/g, "\\."),
    );
    const expectStartsBlocked = async (titles: readonly string[]) => {
      for (const title of titles) {
        await expect(action(title, "Execution")).toBeDisabled();
        await expect(action(title, "Refinement")).toBeDisabled();
        await expect(action(title, "Execution")).toHaveAccessibleDescription(
          openSessionDescription,
        );
        await expect(action(title, "Refinement")).toHaveAccessibleDescription(
          openSessionDescription,
        );
      }
    };

    await launchListed(readyStory, "Execution");
    await launchListed(notRefinedStory, "Execution");
    await launchListed(takenStory, "Refinement");
    const newest = cardSessions(card(readyStory)).first();
    await expect(sessionStateOf(newest)).toHaveText("Working");
    await expect(newest).toContainText(
      "Local: launched from this dashboard on this machine.",
    );
    await expect(newest).not.toContainText(readyStory);
    await expectListed();
    await expectStartsBlocked(queued);
    await expect(recentlyDone.locator(".session-entry")).toHaveCount(0);
    expect(launches()).toHaveLength(3);

    await test.step("a Preparing card keeps its sessions, each set off on the panel in the card's text, and notes Start refinement", async () => {
      await show(stagesJourney.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      await expectListed();
      await expectStartsBlocked(queued);
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
      for (const entry of await cardSessions(card(readyStory)).all())
        await expectSessionEntrySetOff(entry);

      await page.reload();
      await settled();
      await expectListed();
    });

    await test.step("the published Take shows the story under Taken, whose card keeps every session, set off on the panel in the card's text, and offers no Start", async () => {
      await show(stagesJourney.taken);
      const backlog = [takenStory, notRefinedStory];
      await expectMembership(page, { taken: [readyStory], backlog });
      const takenCard = taken.getByRole("article", { name: readyStory });
      await expect(cardSessions(takenCard)).toHaveCount(1);
      await expectListed([readyStory, ...backlog]);
      await expectStartsBlocked(backlog);
      await expect(
        takenCard.getByRole("button", { name: /^Start / }),
      ).toHaveCount(0);
      await expectSessionEntrySetOff(cardSessions(takenCard).first());
      await page.reload();
      await expectMembership(page, { taken: [readyStory], backlog });
      await settled();
      await expectListed([readyStory, ...backlog]);
    });

    await test.step("a story done and left every list keeps its sessions only in Recently done, inside its done card, through a reload", async () => {
      await show(stagesJourney.completed);
      const completed = { taken: [readyStory], backlog: [takenStory] };
      await expectMembership(page, completed);
      await expectListed([readyStory, takenStory]);
      // Completing the story published its done record, whose card holds
      // the story's session.
      const entries = recentlyDone.locator(".session-entry");
      const doneCard = recentlyDone.getByRole("article", {
        name: notRefinedStory,
        exact: true,
      });
      const inDoneCard = doneCard.getByRole("article", {
        name: recentlyDoneSessionName("Execution", notRefinedStory),
      });
      await expect(entries).toHaveCount(1);
      await expect(doneCard).toBeVisible();
      await expect(inDoneCard).toBeVisible();
      await expect(doneCard.locator(".session-entry")).toHaveCount(1);
      await expect(inDoneCard).toContainText(
        `Session ${listed.get(notRefinedStory)?.[0]?.session}`,
      );
      await page.reload();
      await expectMembership(page, completed);
      await settled();
      await expectListed([readyStory, takenStory]);
      await expect(entries).toHaveCount(1);
      await expect(inDoneCard).toBeVisible();
    });

    await test.step("Mark as done retains the same session in Recently done while its story stays in Backlog, through reload", async () => {
      const closed = listed.get(takenStory)?.[0];
      if (closed === undefined) throw new Error("No launched refinement");
      await markDoneAnyway(cardSessions(card(takenStory)));
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
        page.locator(`.dashboard-columns [data-shows-session="${closed.key}"]`),
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
