// A story's card lists the sessions launched on it that have not been marked
// done, in every stage origin shows it, on a committed origin the production
// commands publish (./launchJourney.ts): a launch lists its session beside
// the Start actions, which stay; two launches are two entries; a refinement
// launched on a Preparing card is listed at once; the Taken card keeps the
// listing and offers no Start; and reloads and project switches keep it. A
// story that leaves every list keeps its sessions only in Recent sessions.
// What each entry shows of its session's state is
// ./agent-launch-card-session-states.spec.ts, and that closing or losing a
// terminal leaves its session listed is ./agent-terminal.spec.ts and
// ./agent-terminal-lifetime.spec.ts. Origin alone places every story.
// The page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionName,
  cardSessions,
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney, type Workflow } from "./storyStagesPage.ts";

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

  test("a card lists each unclosed session beside its Start actions through reloads, project switches, Preparing, and Taken, and a story in no list keeps them only in Recent sessions", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { action, settled, show, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { stages, taken, project, recentSessions } = parts(page);
    // A story's card in whichever stage origin shows it.
    const card = (title: string) =>
      stages.getByRole("article", { name: title, exact: true });
    const launches = () => dashboard.claudeLaunchCalls();
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();

    // Each story's sessions, newest first, as its card lists them.
    const listed = new Map<string, { workflow: Workflow; session: string }[]>(
      queued.map((title) => [title, []]),
    );
    const launchListed = async (title: string, workflow: Workflow) => {
      const entries = cardSessions(card(title));
      const before = await entries.count();
      await launch(title, workflow);
      await expect(entries).toHaveCount(before + 1);
      const newest = entries.first();
      await expect(newest).toHaveAccessibleName(cardSessionName(workflow));
      listed
        .get(title)
        ?.unshift({ workflow, session: await sessionNamedBy(newest) });
    };
    // Every story's card lists exactly its own sessions, newest first, each
    // with Open terminal.
    const expectListed = async (titles: readonly string[] = queued) => {
      for (const title of titles) {
        const entries = cardSessions(card(title));
        const own = listed.get(title) ?? [];
        await expect(entries).toHaveCount(own.length);
        for (const [index, { workflow, session }] of own.entries()) {
          const entry = entries.nth(index);
          await expect(entry).toHaveAccessibleName(cardSessionName(workflow));
          await expect(entry).toContainText(`Session ${session}`);
          await expect(entry).toContainText(
            `${workflow} started in Claude Code`,
          );
          await expect(
            entry.getByRole("button", { name: "Open terminal" }),
          ).toBeVisible();
        }
      }
    };
    const expectStartOffered = async (titles: readonly string[]) => {
      for (const title of titles) {
        await expect(action(title, "Execution")).toBeEnabled();
        await expect(action(title, "Refinement")).toBeEnabled();
      }
    };

    await launchListed(readyStory, "Execution");
    await launchListed(readyStory, "Refinement");
    await launchListed(notRefinedStory, "Execution");
    const newest = cardSessions(card(readyStory)).first();
    await expect(sessionStateOf(newest)).toHaveText("Working");
    await expect(newest).toContainText(
      "Local: launched from this dashboard on this machine.",
    );
    await expect(newest).not.toContainText(readyStory);
    await expectListed();
    await expectStartOffered(queued);
    expect(launches()).toHaveLength(3);

    await test.step("reloading the page keeps every card's sessions, read again from the running server", async () => {
      const reads = page.waitForRequest(
        (request) =>
          request.method() === "GET" &&
          request.url().endsWith("/__agent-launch?source=open-dough"),
      );
      await page.reload();
      await reads;
      await expectMembership(page, { taken: [], backlog: queued });
      await settled();
      await expectListed();
      await expectStartOffered(queued);
    });

    await test.step("another project's cards list none of these sessions, and returning lists them again", async () => {
      await project
        .getByRole("radio", { name: "Doughnut", exact: true })
        .check();
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(cardSessions(page.locator("body"))).toHaveCount(0);
      await expect(action(doughnutSharedTitle, "Execution")).toBeEnabled();

      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, { taken: [], backlog: queued });
      await settled();
      await expectListed();
    });

    await test.step("a Preparing card keeps its sessions and notes Start refinement, and another refinement launched there is a second entry at once", async () => {
      await show(stagesJourney.preparing);
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(
        card(readyStory).getByText("Preparing", { exact: true }),
      ).toBeVisible();
      await expectListed();
      await expect(
        action(readyStory, "Refinement"),
      ).toHaveAccessibleDescription("Being prepared");
      for (const title of [takenStory, notRefinedStory]) {
        await expect(action(title, "Refinement")).toHaveAccessibleDescription(
          "",
        );
      }

      await launchListed(readyStory, "Refinement");
      await expect(
        cardSessions(card(readyStory)).filter({
          has: page.getByText("Refinement started in Claude Code"),
        }),
      ).toHaveCount(2);
      await expectListed();
      await expectStartOffered(queued);
      await page.reload();
      await settled();
      await expectListed();
    });

    await test.step("the published Take shows the story under Taken, whose card keeps every session and offers no Start", async () => {
      await show(stagesJourney.taken);
      const backlog = [takenStory, notRefinedStory];
      await expectMembership(page, { taken: [readyStory], backlog });
      const takenCard = taken.getByRole("article", { name: readyStory });
      await expect(cardSessions(takenCard)).toHaveCount(3);
      await expectListed([readyStory, ...backlog]);
      await expect(
        takenCard.getByRole("button", { name: /^Start / }),
      ).toHaveCount(0);
      await page.reload();
      await expectMembership(page, { taken: [readyStory], backlog });
      await settled();
      await expectListed([readyStory, ...backlog]);
    });

    await test.step("a story that leaves every list keeps its sessions only in Recent sessions, through a reload", async () => {
      await show(stagesJourney.completed);
      const completed = { taken: [readyStory], backlog: [takenStory] };
      await expectMembership(page, completed);
      await expectListed([readyStory, takenStory]);
      const entries = recentSessions.getByRole("article");
      await expect(entries).toHaveCount(4);
      await expect(
        recentSessions.getByRole("article", {
          name: recentSessionName("Execution", notRefinedStory),
        }),
      ).toBeVisible();
      await page.reload();
      await expectMembership(page, completed);
      await settled();
      await expectListed([readyStory, takenStory]);
      await expect(entries).toHaveCount(4);
    });

    // Nothing was launched again along the way.
    expect(launches()).toHaveLength(4);
  });
});
