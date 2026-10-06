// Reopening a session marked done from the page, on the committed
// story-stages origin (./launchJourney.ts): a session already marked done,
// through the boundary, shows Done in Recently done with no card entry;
// opening its terminal there reopens it: once the terminal attaches, it is
// back on its card and no longer Done, through a reload, until it is marked
// done again from its card. How the boundary reopens it is
// ./agent-terminal-reopen.spec.ts, and how the page marks a session done is
// ./agent-terminal-done.spec.ts. The page's own dashboard server drives the
// synthetic `claude` (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { markDone } from "./agentLaunchBoundary.ts";
import {
  cardSessions,
  expectMembership,
  parts,
  recentlyDoneSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import { markDoneAnyway } from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("reopening a session marked done from its Recently done entry", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("opening its terminal puts it back on its card and no longer Done, through a reload, until it is marked done again", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const { recentlyDone: recent } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const listed = cardSessions(card(readyStory));
    const entry = recent.getByRole("article", {
      name: recentlyDoneSessionName("Execution", readyStory),
    });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await settled();
    await launch(readyStory, "Execution");
    const doneName = `done-Open Dough · Execution · ${readyStory}`;
    const marked = await markDone(dashboard, {
      source: "open-dough",
      session: await sessionNamedBy(listed),
    });
    expect(marked.status).toBe(200);
    await page.reload();
    await settled();
    await expect(listed).toHaveCount(0);
    await expect(sessionStateOf(entry)).toHaveText("Done");
    await expect(entry).toContainText(`Intended name ${doneName}`);
    await expect(entry).toContainText(
      "Claude Code rename failed: No terminal attachment is available to confirm native rename.",
    );

    // Opening its terminal again reopens it, without waiting for the next
    // read of the records.
    await entry.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    await expect(listed).toHaveCount(1);
    await expect(sessionStateOf(listed)).not.toHaveText("Done");
    await expect(sessionStateOf(entry)).not.toHaveText("Done");
    await expect(entry).not.toContainText("Named done-");
    await expectMembership(page, queued);

    await page.reload();
    await settled();
    await expect(listed).toHaveCount(1);
    await expect(sessionStateOf(listed)).not.toHaveText("Done");
    await expect(sessionStateOf(entry)).not.toHaveText("Done");
    await expect(entry).not.toContainText("Named done-");

    // Reload closed the attachment. Reattach so this mark can confirm the
    // native rename, clearing the problem from the first local Done.
    await listed.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    await markDoneAnyway(listed);
    await expect(listed).toHaveCount(0);
    await expect(sessionStateOf(entry)).toHaveText("Done");
    await expect(entry).toContainText(`Named ${doneName}`);
    await expect(entry).not.toContainText("rename failed");
    await expectMembership(page, queued);
  });
});
