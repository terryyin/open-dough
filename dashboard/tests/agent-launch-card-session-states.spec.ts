// A card keeps listing its sessions whatever Claude Code lists of them: a
// session Ready for review, stopped, needing input, or unavailable stays on
// its card beside the Start actions, which keep their notes; an unavailable
// one has no Open terminal, and every one is State unknown with Open terminal
// while the listing cannot be read. A restarted dashboard server, a reload,
// and a project switch keep every entry and its state. What each state shows is
// ./agent-launch-recent-session-states.spec.ts. Origin alone still places
// every story. The server keeps its HOME and the synthetic `claude`'s state
// (./fixtures/fake-claude) in a machine directory, so a restart answers the
// same records and sessions; the real `claude` is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Locator } from "@playwright/test";
import { test as base, expect } from "./dashboardTest.ts";
import {
  cardSessionOf,
  cardSessions,
  expectMembership,
  parts,
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
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";

const projectFolders = ["open-dough"];

const test = base.extend<{ machine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-card-sessions-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  dashboard: async ({ github, machine }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      github,
      machine,
      projectFolders,
    });
    await use(server);
    await server.close();
  },
});

const notReadyNote = "Not marked Ready for execution";

test.describe("a card's sessions whatever Claude Code lists", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("a ready-for-review, stopped, blocked, unavailable, or unknown session stays on its card with its state beside the Start actions, through a restart, a reload, and a project switch", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, action, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { project } = parts(page);
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    // Each launch, the change its session undergoes, and the state its card
    // entry shows then; the blocked session still runs.
    const launches: readonly {
      title: string;
      workflow: Workflow;
      change: ClaudeSessionChange;
      shows: string;
    }[] = [
      {
        title: notRefinedStory,
        workflow: "Execution",
        change: "done-exited",
        shows: "Ready for review",
      },
      {
        title: readyStory,
        workflow: "Execution",
        change: "forgotten",
        shows: "Session unavailable",
      },
      {
        title: notRefinedStory,
        workflow: "Refinement",
        change: "stopped",
        shows: "Session stopped",
      },
      {
        title: readyStory,
        workflow: "Refinement",
        change: "blocked",
        shows: "Needs input",
      },
    ];
    const entryOf = (title: string, workflow: Workflow): Locator =>
      cardSessionOf(card(title), workflow);
    const openIn = (entry: Locator) =>
      entry.getByRole("button", { name: "Open terminal" });
    // Every card still offers both Start actions with their notes.
    const expectStartOffered = async () => {
      for (const title of queued.backlog) {
        await expect(action(title, "Execution")).toBeEnabled();
        await expect(action(title, "Refinement")).toBeEnabled();
      }
      await expect(
        action(notRefinedStory, "Execution"),
      ).toHaveAccessibleDescription(notReadyNote);
      await expect(action(readyStory, "Execution")).toHaveAccessibleDescription(
        "",
      );
    };
    const expectShown = async () => {
      for (const { title, workflow, shows } of launches) {
        const entry = entryOf(title, workflow);
        await expect(sessionStateOf(entry)).toHaveText(shows);
        await expect(openIn(entry)).toHaveCount(
          shows === "Session unavailable" ? 0 : 1,
        );
      }
      await expect(cardSessions(page.locator("body"))).toHaveCount(
        launches.length,
      );
      await expectStartOffered();
    };

    const sessionIds: string[] = [];
    for (const { title, workflow } of launches) {
      await launch(title, workflow);
      const entry = entryOf(title, workflow);
      await expect(sessionStateOf(entry)).toHaveText("Working");
      sessionIds.push(await sessionNamedBy(entry));
    }
    // Claude Code's listing cannot be read, and then every session changes.
    dashboard.claudeListingFails(true);
    for (const [index, { change }] of launches.entries()) {
      dashboard.claudeSessionBecomes(sessionIds[index] ?? "?", change);
    }

    await test.step("while Claude Code's listing cannot be read, every session stays on its card as State unknown with Open terminal", async () => {
      await page.reload();
      await settled();
      for (const { title, workflow } of launches) {
        const entry = entryOf(title, workflow);
        await expect(sessionStateOf(entry)).toContainText("State unknown");
        await expect(openIn(entry)).toBeVisible();
      }
      await expect(cardSessions(page.locator("body"))).toHaveCount(
        launches.length,
      );
      dashboard.claudeListingFails(false);
    });

    const port = Number(new URL(dashboard.baseURL).port);
    let restarted: DashboardServer | undefined;
    try {
      await test.step("a restarted dashboard server, a reload, and a project switch keep every entry and its state", async () => {
        await dashboard.close();
        restarted = await startDashboardServer({
          mode: "preview",
          prebuilt: builtDashboardDir,
          github,
          machine,
          projectFolders,
          port,
        });
        await page.reload();
        await expectMembership(page, queued);
        await settled();
        await expectShown();

        await project
          .getByRole("radio", { name: "Doughnut", exact: true })
          .check();
        await expectMembership(page, {
          taken: [],
          backlog: [doughnutSharedTitle],
        });
        await expect(cardSessions(page.locator("body"))).toHaveCount(0);
        await project
          .getByRole("radio", { name: "Open Dough", exact: true })
          .check();
        await expectMembership(page, queued);
        await settled();
        await expectShown();
      });
    } finally {
      await restarted?.close();
    }

    // Session state never moves a story: origin alone places each one, and
    // nothing was launched again.
    await expectMembership(page, queued);
    expect(dashboard.claudeLaunchCalls()).toHaveLength(launches.length);
  });
});
