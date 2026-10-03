// Recent sessions lists every session this dashboard launched for the
// selected project, newest first, on a committed origin the production
// commands publish (./launchJourney.ts): an entry names its story, workflow,
// launch time, and session with Open terminal; two launches of one story
// are two entries; and another project's launches are not listed, through
// reloads and project switches; until the page first reads them, it says it
// is reading them. That entries stay through Preparing, the
// Take, and completion is ./agent-launch-card-sessions.spec.ts, and each
// entry's state is
// ./agent-launch-recent-session-states.spec.ts. The page's own dashboard
// server launches the synthetic `claude` (./fixtures/fake-claude); the real
// one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { markDone } from "./agentLaunchBoundary.ts";
import {
  expectMembership,
  parts,
  recentSessionName,
  sessionNamedBy,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { holdSessionReads } from "./sessionStatePace.ts";
import { openStoryStagesJourney, type Workflow } from "./storyStagesPage.ts";

test.use({ projectFolders: ["open-dough", "doughnut"] });

test.describe("Recent sessions of the launches from this dashboard", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("lists each launch newest first with its story, workflow, time, session, and Open terminal, only under its own project", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { project, recentSessions: recent } = parts(page);
    const entries = recent.getByRole("article");
    const sessionIds: string[] = [];
    // Launches the workflow and remembers its session, as the new entry
    // names it.
    const launchListed = async (title: string, workflow: Workflow) => {
      const before = await entries.count();
      await launch(title, workflow);
      await expect(entries).toHaveCount(before + 1);
      await expect(entries.first()).toHaveAccessibleName(
        recentSessionName(workflow, title),
      );
      sessionIds.unshift(await sessionNamedBy(entries.first()));
    };
    // The entries, newest first, each naming its own launch's session.
    const expectEntries = async (
      launches: readonly (readonly [title: string, workflow: Workflow])[],
    ) => {
      await expect(entries).toHaveCount(launches.length);
      for (const [index, [title, workflow]] of launches.entries()) {
        const entry = entries.nth(index);
        await expect(entry).toHaveAccessibleName(
          recentSessionName(workflow, title),
        );
        await expect(entry.getByRole("heading", { level: 3 })).toHaveText(
          title,
        );
        await expect(entry).toContainText(`${workflow} started in Claude Code`);
        await expect(entry).toContainText(
          `Session ${sessionIds[index] ?? "?"}`,
        );
        await expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toBeVisible();
      }
    };
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();
    await expect(recent).toContainText(
      "No sessions launched from this dashboard are kept.",
    );

    const before = Date.now();
    await launchListed(readyStory, "Refinement");
    await markDone(dashboard, {
      source: "open-dough",
      session: sessionIds[0] ?? "?",
    });
    await launchListed(readyStory, "Execution");
    await launchListed(notRefinedStory, "Execution");
    const launched = [
      [notRefinedStory, "Execution"],
      [readyStory, "Execution"],
      [readyStory, "Refinement"],
    ] as const;
    await expectEntries(launched);
    expect(new Set(sessionIds).size).toBe(3);
    await expectMembership(page, { taken: [], backlog: queued });

    await test.step("an entry names its story, launch time, and local evidence", async () => {
      const newest = entries.first();
      await expect(newest).toContainText(notRefinedIdentity);
      await expect(newest).toContainText(
        "Local: launched from this dashboard on this machine.",
      );
      const launchedAt = Date.parse(
        (await newest.locator("time").getAttribute("datetime")) ?? "",
      );
      expect(launchedAt).toBeGreaterThanOrEqual(before - 1_000);
      expect(launchedAt).toBeLessThanOrEqual(Date.now());
    });

    await test.step("another project lists only its own launches, and reloading or returning lists these again", async () => {
      await project
        .getByRole("radio", { name: "Doughnut", exact: true })
        .check();
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(entries).toHaveCount(0);
      await launch(doughnutSharedTitle, "Execution");
      await expect(entries).toHaveCount(1);
      await expect(entries.first()).toHaveAccessibleName(
        recentSessionName("Execution", doughnutSharedTitle),
      );

      await project
        .getByRole("radio", { name: "Open Dough", exact: true })
        .check();
      await expectMembership(page, { taken: [], backlog: queued });
      await expectEntries(launched);
      await page.reload();
      await expectMembership(page, { taken: [], backlog: queued });
      await expectEntries(launched);
      await expect(recent).not.toContainText(doughnutSharedTitle);
    });

    await test.step("a page whose first read of the sessions has not answered says it is reading them, then lists them", async () => {
      const { answer } = await holdSessionReads(page);
      await page.reload();
      await expectMembership(page, { taken: [], backlog: queued });
      await expect(recent).toContainText("Reading sessions…");
      await expect(recent).not.toContainText("No sessions launched");
      await expect(entries).toHaveCount(0);
      answer();
      await expectEntries(launched);
      await expect(recent).not.toContainText("Reading sessions…");
    });

    // Listing never launched anything: four launches, one of them Doughnut's.
    expect(dashboard.claudeLaunchCalls()).toHaveLength(4);
  });
});
