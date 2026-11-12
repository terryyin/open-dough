// A card keeps listing its sessions whatever Claude Code lists of them: a
// session Ready for review, stopped, needing input, or unavailable stays on
// its card beside the Start actions, which stay disabled for an open session
// and keep their notes in their accessible description; an unavailable one
// has no Open terminal, and every one is State unknown with Open terminal
// while the listing cannot be read, shown in the open page once its steady
// pace of page time passes, with no new read of the published work. A
// restarted dashboard server, a reload, and a project switch keep every entry
// and its state. What each state shows is
// ./agent-launch-session-state-pace.spec.ts. Origin alone still places
// every story. The page opens with the three sessions already open
// (../storyCardOpenSessions.ts), so nothing is started. The server keeps its
// HOME, the launch store, and the synthetic `claude`'s state
// (./fixtures/fake-claude) in a machine directory, so a restart answers the
// same records and sessions; the real `claude` is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  identityA,
  identityB,
} from "../../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";
import { test as base, expect } from "../dashboardTest.ts";
import {
  chooseProject,
  openTerminalOf,
  parts,
  shortRevision,
  storyCardSessions,
  expectMembership,
  sessionStateOf,
} from "../dashboardPage.ts";
import { doughnutSharedTitle } from "../doughnutProject.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../launchJourney.ts";
import {
  openWithOpenSessions,
  type OpenSession,
} from "../storyCardOpenSessions.ts";
import {
  expectStartsBlocked,
  openSessionDescription,
} from "../storyCardSessionListing.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import type { ClaudeSessionChange } from "../support/fakeClaude.ts";
import { expectNotReloaded, markNotReloaded } from "../sessionStatePace.ts";
import { untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { readsBesideChecks } from "../originObservation.ts";

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
      prebuilt: sharedDashboardBuild,
      github,
      machine,
      projectFolders,
    });
    await use(server);
    await server.close();
  },
});

const notReadyNote = "Not assessed as ready";

test.describe("a card's sessions whatever Claude Code lists", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("a ready-for-review, stopped, blocked, unavailable, or unknown session stays on its card with its state beside the Start actions, through a restart, a reload, and a project switch", async ({
    page,
    dashboard,
    github,
    machine,
  }) => {
    // Open Dough's three sessions, each working when the page opens on the
    // Backlog, the change each then undergoes, and the state its card entry
    // shows then; the blocked session still runs.
    const sessions: readonly (OpenSession & {
      change: ClaudeSessionChange;
      shows: string;
    })[] = [
      {
        project: "open-dough",
        identity: notRefinedIdentity,
        title: notRefinedStory,
        workflow: "Execution",
        state: "working",
        change: "done-exited",
        shows: "Ready for review",
      },
      {
        project: "open-dough",
        identity: identityB,
        title: readyStory,
        workflow: "Execution",
        state: "working",
        change: "forgotten",
        shows: "Session unavailable",
      },
      {
        project: "open-dough",
        identity: identityA,
        title: takenStory,
        workflow: "Refinement",
        state: "working",
        change: "stopped",
        shows: "Session stopped",
      },
    ];
    const {
      passOnePace,
      settled,
      action,
      entryOf,
      expectOpen,
      expectNothingStarted,
      becomes,
      queued: backlog,
    } = await openWithOpenSessions(page, dashboard, columnsJourney, sessions);
    const queued = { taken: [], backlog };
    // Every card with an open session keeps both Starts unavailable, with
    // their notes still in the accessible description; the not-refined
    // story's Start execution also keeps its not-ready note first.
    const expectEveryStartBlocked = async () => {
      await expectStartsBlocked(action, queued.backlog);
      await expect(
        action(notRefinedStory, "Execution"),
      ).toHaveAccessibleDescription(
        new RegExp(`${notReadyNote}.*${openSessionDescription.source}`),
      );
    };
    const expectShown = async () => {
      for (const session of sessions) {
        const entry = entryOf(session.title, session.workflow);
        await expect(sessionStateOf(entry)).toHaveText(session.shows);
        await expect(openTerminalOf(entry)).toHaveCount(
          session.shows === "Session unavailable" ? 0 : 1,
        );
        // The same session the page opened with, now listed as changed,
        // after every restart, reload, and project switch.
        await expectOpen({ ...session, state: session.change });
      }
      await expect(storyCardSessions(page.locator("body"))).toHaveCount(
        sessions.length,
      );
      await expectEveryStartBlocked();
    };

    // Claude Code's listing cannot be read, and then every session changes.
    dashboard.claudeListingFails(true);
    for (const { title, workflow, change } of sessions) {
      becomes(title, workflow, change);
    }

    await test.step("while Claude Code's listing cannot be read, every session stays on its card as State unknown with Open terminal, in the open page with no new read of the published work", async () => {
      const asked = github.calls.length;
      await markNotReloaded(page);
      await passOnePace();
      for (const { title, workflow } of sessions) {
        const entry = entryOf(title, workflow);
        await expect(sessionStateOf(entry)).toContainText("State unknown");
        await expect(openTerminalOf(entry)).toBeVisible();
      }
      await expect(storyCardSessions(page.locator("body"))).toHaveCount(
        sessions.length,
      );
      await untilPageReadsAnswered(page);
      await expectNotReloaded(page);
      await expect(parts(page).readRevision).toContainText(
        shortRevision(columnsJourney.queued),
      );
      // GitHub is asked at most whether the heads moved.
      expect(readsBesideChecks(github.calls.slice(asked))).toEqual([]);
      dashboard.claudeListingFails(false);
    });

    const port = Number(new URL(dashboard.baseURL).port);
    let restarted: DashboardServer | undefined;
    try {
      await test.step("a restarted dashboard server, a reload, and a project switch keep every entry and its state", async () => {
        await dashboard.close();
        restarted = await startDashboardServer({
          mode: "preview",
          prebuilt: sharedDashboardBuild,
          github,
          machine,
          projectFolders,
          port,
        });
        await page.reload();
        await expectMembership(page, queued);
        await settled();
        await expectShown();

        await chooseProject(page, "Doughnut");
        await expectMembership(page, {
          taken: [],
          backlog: [doughnutSharedTitle],
        });
        await expect(storyCardSessions(page.locator("body"))).toHaveCount(0);
        await chooseProject(page, "Open Dough");
        await expectMembership(page, queued);
        await settled();
        await expectShown();
      });
    } finally {
      await restarted?.close();
    }

    // Session state never moves a story: origin alone places each one, and
    // nothing was started, before or after the restart.
    await expectMembership(page, queued);
    expectNothingStarted();
  });
});
