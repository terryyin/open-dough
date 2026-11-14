// An open session stays on its card beside its blocked Starts whatever Claude
// Code lists of it: through an unreadable listing, with no new read of the
// published work, and through a server restart, a reload and a project
// switch. The server keeps its machine directory, so a restart answers the
// same records and sessions. What each state reads is
// ../../dashboard/backend-tests/sessions/session-reading-rule.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test as base, expect } from "../../dashboard/tests/dashboardTest.ts";
import {
  chooseProject,
  parts,
  shortRevision,
  storyCardSessions,
  expectMembership,
  sessionStateOf,
} from "../../dashboard/tests/dashboardPage.ts";
import { doughnutSharedTitle } from "../../dashboard/tests/doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryColumnsJourney,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/tests/launchJourney.ts";
import { openWithOpenSessions } from "../../dashboard/tests/storyCardOpenSessions.ts";
import {
  expectStartsBlocked,
  describedBy,
} from "../../dashboard/tests/storyCardSessionListing.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import type { FakeGitHub } from "../../dashboard/tests/support/fakeGitHub.ts";
import {
  expectNotReloaded,
  markNotReloaded,
} from "../../dashboard/tests/sessionStatePace.ts";
import { untilPageReadsAnswered } from "../../dashboard/tests/pageRequestNotes.ts";
import { readsBesideChecks } from "../../dashboard/tests/originObservation.ts";
import { openTerminalControl } from "../../dashboard/tests/terminalScreenPage.ts";

// What every blocked Start says while its card has an open session.
const openSessionNote =
  "This story has an open session. Mark it done or delete its record to start another.";

// The same machine directory serves the page before and after a restart.
const serve = (github: FakeGitHub, machine: string, port?: number) =>
  startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    github,
    machine,
    projectFolders: ["open-dough"],
    ...(port === undefined ? {} : { port }),
  });

const test = base.extend<{
  machine: string;
  restartDashboard: () => Promise<void>;
}>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-card-sessions-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  dashboard: async ({ github, machine }, use) => {
    const server = await serve(github, machine);
    await use(server);
    await server.close();
  },
  restartDashboard: async ({ dashboard, github, machine }, use) => {
    let restarted: DashboardServer | undefined;
    await use(async () => {
      await dashboard.close();
      const port = Number(new URL(dashboard.baseURL).port);
      restarted = await serve(github, machine, port);
    });
    await restarted?.close();
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

  test("an open session stays on its card with its state through an unreadable listing, a restart, a reload and a project switch", async ({
    page,
    dashboard,
    github,
    restartDashboard,
  }) => {
    const {
      passOnePace,
      settled,
      action,
      entryOf,
      shows,
      expectSameSessions,
      expectNothingStarted,
      becomes,
      queued: backlog,
    } = await openWithOpenSessions(page, dashboard, columnsJourney);
    const queued = { taken: [], backlog };
    const listed = storyCardSessions(page.locator("body"));
    const expectShown = async () => {
      await expect(listed).toHaveCount(3);
      await expectSameSessions();
      await shows(notRefinedStory, "Execution", "Ready for review", true);
      await shows(readyStory, "Execution", "Session unavailable", false);
      await shows(takenStory, "Refinement", "Session stopped", true);
      await expect(
        openTerminalControl(entryOf(readyStory, "Execution")),
      ).toHaveCount(0);
      await expectStartsBlocked(action, backlog, openSessionNote);
      await expect(
        action(notRefinedStory, "Execution"),
      ).toHaveAccessibleDescription(
        new RegExp(`${notReadyNote}.*${describedBy(openSessionNote).source}`),
      );
    };

    dashboard.claudeListingFails(true);
    becomes(notRefinedStory, "Execution", "done-exited");
    becomes(readyStory, "Execution", "forgotten");
    becomes(takenStory, "Refinement", "stopped");

    await test.step("an unreadable listing keeps every entry as State unknown with Open terminal, reading no published work", async () => {
      const asked = github.calls.length;
      await markNotReloaded(page);
      await passOnePace();
      await expect(sessionStateOf(listed)).toHaveText(
        Array(3).fill(/State unknown/),
      );
      await expect(openTerminalControl(listed)).toHaveCount(3);
      await untilPageReadsAnswered(page);
      await expectNotReloaded(page);
      await expect(parts(page).readRevision).toContainText(
        shortRevision(columnsJourney.queued),
      );
      expect(readsBesideChecks(github.calls.slice(asked))).toEqual([]);
      dashboard.claudeListingFails(false);
    });

    await test.step("a restarted server, a reload, and a project switch keep every entry and its state", async () => {
      await restartDashboard();
      await page.reload();
      await settled();
      await expectShown();

      await chooseProject(page, "Doughnut");
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(listed).toHaveCount(0);
      await chooseProject(page, "Open Dough");
      await settled();
      await expectShown();
    });

    // Origin alone places each story, and nothing was started.
    await expectMembership(page, queued);
    expectNothingStarted();
  });
});
