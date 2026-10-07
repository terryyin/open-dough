// Recently done, under its heading and describing text, retains the closed
// session while active story cards hold their open sessions, on a
// committed origin the production commands publish (./launchJourney.ts): an
// retained entry names its story, workflow, launch time, and session with Open
// terminal; two launches of one story remain distinct in their current homes;
// and another project's launches are not listed, through
// reloads and project switches; until the page first reads them, it says it
// is reading them. That entries stay through Preparing, the
// Take, and completion is ./agent-launch-card-sessions.spec.ts, and each
// entry's state is
// ./agent-launch-session-state-pace.spec.ts. The page's own dashboard
// server launches the synthetic `claude` (./fixtures/fake-claude); the real
// one is never reached.

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessions,
  cardSessionName,
  cardSessionOf,
  expectMembership,
  parts,
  standaloneSessionName,
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
import { idleBetweenSteps, markDoneAnyway } from "./support/markDone.ts";

// Mark as done on a session still working waits out the rename's wait for
// idle before the card lets it go; the rename is not this journey's subject,
// so that wait stays well inside one expectation's bound.
test.use({
  projectFolders: ["open-dough", "doughnut"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});

test.describe("retained launches in their current column homes", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("lists the closed launch in Recently done and open launches on their cards with workflow, time, session, and Open terminal, only under their own project", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { project, recentlyDone: recent } = parts(page);
    const entries = recent.getByRole("article");
    const sessionIds: string[] = [];
    // Launches the workflow and remembers its session, as the new entry
    // names it.
    const launchListed = async (title: string, workflow: Workflow) => {
      const before = await cardSessions(card(title)).count();
      await launch(title, workflow);
      const own = cardSessionOf(card(title), workflow);
      await expect(cardSessions(card(title))).toHaveCount(before + 1);
      await expect(own).toHaveAccessibleName(cardSessionName(workflow));
      sessionIds.unshift(await sessionNamedBy(own));
    };
    // Each launch's current entry names that launch's session.
    const expectEntries = async (
      launches: readonly (readonly [title: string, workflow: Workflow])[],
    ) => {
      await expect(entries).toHaveCount(1);
      for (const [index, [title, workflow]] of launches.entries()) {
        const closed = title === readyStory && workflow === "Refinement";
        const entry = closed
          ? entries.first()
          : cardSessionOf(card(title), workflow);
        await expect(entry).toHaveAccessibleName(
          closed
            ? standaloneSessionName(workflow, title)
            : cardSessionName(workflow),
        );
        if (closed) {
          await expect(entry.getByRole("heading", { level: 3 })).toHaveText(
            title,
          );
        }
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
    await expect(recent.getByRole("heading", { level: 2 })).toHaveText(
      "Recently done",
    );
    await expect(recent.locator("> p").first()).toHaveText(
      "Recently done stories and sessions launched from this dashboard for this project, newest first. Sessions are kept on this machine.",
    );
    await expect(recent).toContainText(
      "No sessions launched from this dashboard are kept.",
    );

    const before = Date.now();
    await launchListed(readyStory, "Refinement");
    idleBetweenSteps(dashboard, sessionIds[0] ?? "");
    await markDoneAnyway(cardSessions(card(readyStory)));
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
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
      const newest = cardSessionOf(card(notRefinedStory), "Execution");
      await expect(card(notRefinedStory)).toHaveAttribute(
        "data-work",
        notRefinedIdentity,
      );
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
      await expect(entries).toHaveCount(0);
      await expect(
        cardSessionOf(card(doughnutSharedTitle), "Execution"),
      ).toHaveAccessibleName(cardSessionName("Execution"));

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
