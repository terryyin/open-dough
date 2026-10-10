// Mark as done in the page's one terminal (./agent-terminal.spec.ts), on the
// committed story-stages origin (./launchJourney.ts): while it marks, the panel
// says so quietly; then the panel closes, the session leaves its card, and
// Recently done shows the entry Done under its `done-` name, still openable.
// How the boundary renames and stops the session is ./agent-launch-done.spec.ts, how
// the page reopens it is ./agent-terminal-done-reopen.spec.ts, and a card
// entry's own Mark as done is ./agent-launch-card-done.spec.ts. A refused mark
// keeps the panel open and says so, and a mark answered after another session
// replaced the panel leaves the keyboard in the new terminal. A session not
// known to be complete is asked about first within the panel, with the
// terminal still showing; Keep open or Escape leaves the panel open, attached,
// and the session running, with the keyboard back on Mark as done. What the
// question decides by is ./agent-terminal-done-question.spec.ts. Origin alone
// still places the story. The page's own dashboard server drives the
// synthetic `claude` (./fixtures/fake-claude); the real one is never reached.

import { renameSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  cardSessionName,
  cardSessionOf,
  cardSessions,
  expectMembership,
  parts,
  standaloneSessionName,
  sessionStateOf,
} from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishStoryStagesJourney,
  readyStory,
  takenStory,
  type StoryStagesJourney,
} from "./launchJourney.ts";
import { colourOf, tokenColour } from "./pageColours.ts";
import { openStoryStagesJourney } from "./storyStagesPage.ts";
import {
  doneQuestion,
  expectAsked,
  idleBetweenSteps,
  markAsDone,
  markDoneAnyway,
  sendDoneMarkAnyway,
  stillWorking,
} from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

// The panel header's own Mark as done, apart from the question's.
const headerMarkAsDone = (panel: Locator) =>
  markAsDone(panel.locator("header"));

// Holds the page's done requests until released, then lets each reach the
// boundary.
async function holdDoneRequests(page: Page): Promise<() => void> {
  let release = () => {};
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(`**${agentDoneEndpoint}`, async (route) => {
    await released;
    await route.continue();
  });
  return release;
}

test.describe("marking a session done from its terminal", () => {
  let stagesJourney: StoryStagesJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    stagesJourney = await publishStoryStagesJourney();
  });
  test.afterAll(() =>
    (stagesJourney as StoryStagesJourney | undefined)?.cleanup(),
  );

  test("Mark as done closes the panel, the session leaves its card, and Recently done shows it Done until its terminal opens again", async ({
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
      name: standaloneSessionName("Execution", readyStory),
    });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();
    await launch(readyStory, "Execution");
    await expect(listed).toHaveAccessibleName(cardSessionName("Execution"));
    await listed.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    const [session] = dashboard.claudeListing();
    const doneName = `done-${String(session?.["name"])}`;
    const rows = panel.locator(".xterm-rows");
    for (const answer of ["Keep open", "Escape"] as const) {
      const question = await expectAsked(panel, stillWorking);
      await expect(rows).toBeVisible();
      await expect(rows).toContainText("attached");
      await expect(headerMarkAsDone(panel)).toBeDisabled();
      if (answer === "Escape") await page.keyboard.press("Escape");
      else await question.getByRole("button", { name: answer }).click();
      await expect(doneQuestion(panel)).toHaveCount(0);
      await expect(headerMarkAsDone(panel)).toBeFocused();
      await expect(panel).toBeVisible();
      await expect(panel.getByRole("status")).toBeEmpty();
      await expect(rows).toContainText("attached");
      expect(dashboard.claudeStopCalls()).toEqual([]);
      await expect(listed).toHaveCount(1);
    }
    const release = await holdDoneRequests(page);
    idleBetweenSteps(dashboard, String(session?.["sessionId"]));

    await sendDoneMarkAnyway(panel);

    const marking = panel.getByRole("status").getByText("Marking as done…");
    await expect(marking).toBeVisible();
    expect(await colourOf(marking)).toBe(await tokenColour(page, "--quiet"));
    release();
    await expect(panel).toHaveCount(0);

    await expect(listed).toHaveCount(0);
    await expect(sessionStateOf(entry)).toHaveText("Done");
    await expect(entry).toContainText(`Named ${doneName}`);
    // Claude Code keeps the conversation, so the entry still opens it.
    await expect(
      entry.getByRole("button", { name: "Open terminal" }),
    ).toBeVisible();
    await expectMembership(page, queued);

    await page.reload();
    await settled();
    await expect(sessionStateOf(entry)).toHaveText("Done");
    await expect(entry).toContainText(`Named ${doneName}`);
    await expect(listed).toHaveCount(0);
    await expectMembership(page, queued);
  });

  test("a refused mark keeps the panel open and says so as a problem, as an ended terminal does", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    const status = panel.getByRole("status");
    await settled();
    await launch(readyStory, "Execution");
    await cardSessions(card(readyStory))
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    // The project folder moves away, so the boundary refuses the mark.
    const folder = path.join(dashboard.home, "git", "open-dough");
    renameSync(folder, `${folder}.moved`);

    await markDoneAnyway(panel);

    const refused = status.getByText("The session could not be marked done.");
    await expect(refused).toBeVisible();
    expect(await colourOf(refused)).toBe(await tokenColour(page, "--problem"));
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Mark as done" }),
    ).toBeEnabled();
    expect(dashboard.claudeStopCalls()).toEqual([]);

    // The attached CLI ending on its own still shows as a problem.
    await panel.locator(".xterm-helper-textarea").focus();
    await page.keyboard.press("Control+z");
    const ended = status.getByText("The terminal ended");
    await expect(ended).toBeVisible();
    expect(await colourOf(ended)).toBe(await tokenColour(page, "--problem"));
  });

  test("a mark answered after another session replaced the panel leaves the keyboard in the new terminal", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryStagesJourney(
      page,
      stagesJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    await settled();
    await launch(readyStory, "Execution");
    await launch(notRefinedStory, "Refinement");
    await cardSessionOf(card(readyStory), "Execution")
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    const release = await holdDoneRequests(page);
    await sendDoneMarkAnyway(panel);
    await expect(panel.getByRole("status")).toHaveText("Marking as done…");

    await cardSessionOf(card(notRefinedStory), "Refinement")
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel).toContainText("Refinement session");
    const typing = panel.locator(".xterm-helper-textarea");
    await expect(typing).toBeFocused();
    const doneAnswered = page.waitForResponse((response) =>
      response.url().endsWith(agentDoneEndpoint),
    );
    release();
    await doneAnswered;

    await expect(cardSessionOf(card(readyStory), "Execution")).toHaveCount(0);
    await expect(panel).toContainText("Refinement session");
    await expect(typing).toBeFocused();
  });
});
