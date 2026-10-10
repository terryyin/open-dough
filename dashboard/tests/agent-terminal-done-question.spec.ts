// Mark as done in the page's one terminal (./agent-terminal-done.spec.ts)
// decides whether to ask first by the session as the page reads it now, not
// as the panel was opened with it: while another project is shown, where the
// session has no entry, it still asks about the session's reading, and marking
// closes the panel; a session opened while Ready for review that then reads
// Working is asked about as working. On the committed story-stages origin
// (./launchJourney.ts); the page's own dashboard server drives the synthetic
// `claude` (./fixtures/fake-claude).

import { expect, test } from "./dashboardTest.ts";
import {
  cardSessions,
  expectMembership,
  parts,
  sessionStateOf,
} from "./dashboardPage.ts";
import { doughnutSharedTitle } from "./doughnutProject.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import {
  expectAsked,
  idleBetweenSteps,
  markDone,
  stillWorking,
} from "./support/markDone.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

// Mark as done on a session still working waits out the rename's wait for
// idle before the card lets it go; the rename is not this journey's subject,
// so that wait stays well inside one expectation's bound.
test.use({
  projectFolders: ["open-dough"],
  extraEnv: { DOUGH_DONE_RENAME_WAIT_MS: "300" },
});

test.describe("Mark as done in the terminal asks by the session's current reading", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Mark as done from the panel while another project is shown, where the session has no entry, closes the panel", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { project } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    await settled();
    await launch(notRefinedStory, "Execution");
    await cardSessions(card(notRefinedStory))
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached ");
    await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
    await expectMembership(page, {
      taken: [],
      backlog: [doughnutSharedTitle],
    });

    const question = await expectAsked(panel, stillWorking);
    // Asked while it reads working, it then idles between steps.
    idleBetweenSteps(
      dashboard,
      String(dashboard.claudeListing()[0]?.["sessionId"]),
    );
    await markDone(question);

    await expect(panel).toHaveCount(0);
  });

  test("a session opened while Ready for review that then reads Working is asked about as working", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    const listed = cardSessions(card(readyStory));
    await settled();
    await launch(readyStory, "Execution");
    const sessionId = String(dashboard.claudeListing()[0]?.["sessionId"]);
    dashboard.claudeSessionBecomes(sessionId, "done-live");
    await reloadUntilRead(page);
    await expect(sessionStateOf(listed)).toHaveText("Ready for review");
    await listed.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");

    dashboard.claudeSessionBecomes(sessionId, "working");
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    await expect(sessionStateOf(listed)).toHaveText("Working");

    const question = await expectAsked(panel, stillWorking);
    // Asked while it reads working, it then idles between steps.
    idleBetweenSteps(dashboard, sessionId);
    await markDone(question);
    await expect(panel).toHaveCount(0);
    await expect(listed).toHaveCount(0);
  });
});
