// Recently done, under its heading and describing text, retains the closed
// session while active story cards hold their open sessions, on a
// committed origin from ../../dashboard/test-support/launchJourney.ts: an
// retained entry names its story, workflow, launch time, and session with Open
// terminal; two sessions of one story remain distinct in their current homes;
// and another project's sessions are not listed, through
// reloads and project switches; until the page first reads them, it says it
// is reading them. That entries stay through Preparing, the
// Take, and completion is ./agent-launch-story-card-sessions.spec.ts, and each
// entry's state is
// ../../dashboard/backend-tests/sessions/session-reading-rule.spec.ts.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { composeSession } from "../../dashboard/test-support/agentTerminalBoundary.ts";
import {
  chooseProject,
  storyCardSessions,
  storyCardSessionName,
  storyCardSessionOf,
  expectMembership,
  parts,
  sessionNamedBy,
  shownDoneSessionEntriesOf,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  doughnutSharedTitle,
  sharedStoryIdentity,
} from "../../dashboard/test-support/doughnutProject.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishStoryColumnsJourney,
  readyIdentity,
  readyStory,
  takenStory,
  type StoryColumnsJourney,
} from "../../dashboard/test-support/launchJourney.ts";
import { holdSessionReads } from "../../dashboard/test-support/sessionStatePace.ts";
import {
  openStoryColumnsJourney,
  type Workflow,
} from "../../dashboard/test-support/storyColumnsPage.ts";
import {
  briefDoneRenameWait,
  idleBetweenSteps,
  markDoneAnyway,
} from "../../dashboard/test-support/support/markDone.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";

test.use({
  projectFolders: ["open-dough", "doughnut"],
  extraEnv: briefDoneRenameWait,
});

test.describe("retained launches in their current column homes", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("lists the closed launch in the unfinished card's Done history and open launches on their cards with workflow, time, session, and Open terminal, only under their own project", async ({
    page,
    dashboard,
  }) => {
    const { card, settled } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const entries = recent.getByRole("article");
    const expectEntries = async (
      sessions: readonly (readonly [
        title: string,
        workflow: Workflow,
        sessionId: string,
      ])[],
    ) => {
      await expect(entries).toHaveCount(0);
      for (const [title, workflow, sessionId] of sessions) {
        const closed = title === readyStory && workflow === "Refinement";
        const entry = closed
          ? await shownDoneSessionEntriesOf(page, title)
          : storyCardSessionOf(card(title), workflow);
        await expect(entry).toHaveAccessibleName(
          storyCardSessionName(workflow),
        );
        await expect(entry).toContainText(`${workflow} started in Claude Code`);
        await expect(entry).toContainText(`Session ${sessionId}`);
        await expect(openTerminalControl(entry)).toBeVisible();
      }
    };
    const queued = [takenStory, readyStory, notRefinedStory];
    await expectMembership(page, { taken: [], backlog: queued });
    await settled();
    await expect(recent.getByRole("heading", { level: 2 })).toHaveText(
      "Recently done",
    );
    await expect(recent.locator("> p").first()).toHaveText(
      "Recently done stories and sessions launched from this dashboard for this project, newest first. Sessions are kept on this machine.",
    );
    await expect(recent).toContainText(
      "No sessions launched from this dashboard are kept.",
    );

    const { sessionId: refinement } = await composeSession(
      dashboard,
      "open-dough",
      {
        identity: readyIdentity,
        title: readyStory,
        workflow: "refinement",
      },
    );
    await page.reload();
    await settled();
    await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
    const refinementEntry = storyCardSessionOf(card(readyStory), "Refinement");
    expect(await sessionNamedBy(refinementEntry)).toBe(refinement);
    idleBetweenSteps(dashboard, refinement);
    await markDoneAnyway(storyCardSessions(card(readyStory)));
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
    const startedAt = Date.now();
    const { sessionId: execution } = await composeSession(
      dashboard,
      "open-dough",
      {
        identity: readyIdentity,
        title: readyStory,
        startedAt: startedAt - 1_000,
      },
    );
    const { sessionId: newestExecution } = await composeSession(
      dashboard,
      "open-dough",
      {
        identity: notRefinedIdentity,
        title: notRefinedStory,
        startedAt,
      },
    );
    await page.reload();
    await settled();
    const sessions = [
      [notRefinedStory, "Execution", newestExecution],
      [readyStory, "Execution", execution],
      [readyStory, "Refinement", refinement],
    ] as const;
    await expect(storyCardSessions(card(readyStory))).toHaveCount(1);
    await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(1);
    await expectEntries(sessions);
    expect(new Set(sessions.map(([, , id]) => id)).size).toBe(3);
    await expectMembership(page, { taken: [], backlog: queued });

    await test.step("an entry names its story, launch time, and local evidence", async () => {
      const newest = storyCardSessionOf(card(notRefinedStory), "Execution");
      await expect(card(notRefinedStory)).toHaveAttribute(
        "data-story-card",
        notRefinedIdentity,
      );
      await expect(newest).toContainText(
        "Local: launched from this dashboard on this machine.",
      );
      const launchedAt = Date.parse(
        (await newest.locator("time").getAttribute("datetime")) ?? "",
      );
      expect(launchedAt).toBe(startedAt);
    });

    await test.step("another project lists only its own launches, and reloading or returning lists these again", async () => {
      await chooseProject(page, "Doughnut");
      await expectMembership(page, {
        taken: [],
        backlog: [doughnutSharedTitle],
      });
      await expect(entries).toHaveCount(0);
      const { sessionId } = await composeSession(dashboard, "doughnut", {
        identity: sharedStoryIdentity,
        title: doughnutSharedTitle,
      });
      await page.reload();
      await settled();
      await expect(entries).toHaveCount(0);
      const doughnutSession = storyCardSessionOf(
        card(doughnutSharedTitle),
        "Execution",
      );
      await expect(doughnutSession).toHaveAccessibleName(
        storyCardSessionName("Execution"),
      );
      expect(await sessionNamedBy(doughnutSession)).toBe(sessionId);

      await chooseProject(page, "Open Dough");
      await expectMembership(page, { taken: [], backlog: queued });
      await expectEntries(sessions);
      await page.reload();
      await expectMembership(page, { taken: [], backlog: queued });
      await expectEntries(sessions);
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
      await expectEntries(sessions);
      await expect(recent).not.toContainText("Reading sessions…");
    });

    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  });
});
