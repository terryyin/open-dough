// Mark as done in the page's one terminal (./agent-terminal.spec.ts), on the
// committed settlement origin (./launchJourney.ts): while it marks, the panel
// says so quietly; then the panel closes, the keyboard goes to the session's
// Recent sessions entry, since the card's Started that opened it is gone, the
// card offers its Start action again while the story is in the Backlog, and
// Recent sessions shows the entry Done under its `done-` name, still
// openable. How the boundary renames and stops the session is
// ./agent-launch-done.spec.ts. A refused mark keeps the panel open and says
// so, and a mark answered after another session replaced the panel leaves the
// keyboard in the new terminal. Origin alone still places the story. The page's own
// dashboard server drives the synthetic `claude` (./fixtures/fake-claude);
// the real one is never reached.

import { renameSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts, recentSessionName } from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishSettlementJourney,
  readyStory,
  takenStory,
  type SettlementJourney,
} from "./launchJourney.ts";
import { openSettlementJourney } from "./settlementPage.ts";

test.use({ projectFolders: ["open-dough"] });

// The colour a page colour token resolves to, as computed styles report it.
function tokenColour(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("span");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const colour = getComputedStyle(probe).color;
    probe.remove();
    return colour;
  }, token);
}

const colourOf = (element: Locator) =>
  element.evaluate((node) => getComputedStyle(node).color);

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
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("Mark as done closes the panel, focuses the session's entry, offers Start again, and shows the entry Done", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, action, settled, launch } = await openSettlementJourney(
      page,
      settlement,
    );
    const { recentSessions: recent } = parts(page);
    const panel = page.getByRole("region", { name: "Terminal" });
    const started = card(readyStory).getByRole("region", {
      name: "Execution started",
    });
    const entry = recent.getByRole("article", {
      name: recentSessionName("Execution", readyStory),
    });
    const queued = {
      taken: [],
      backlog: [takenStory, readyStory, notRefinedStory],
    };
    await expectMembership(page, queued);
    await settled();

    await launch(readyStory, "Execution");
    await started.getByRole("button", { name: "Open terminal" }).click();
    const rows = panel.locator(".xterm-rows");
    await expect(rows).toContainText("attached");
    const [session] = dashboard.claudeListing();
    const doneName = `done-${String(session?.["name"])}`;
    const release = await holdDoneRequests(page);

    await panel.getByRole("button", { name: "Mark as done" }).click();

    const marking = panel.getByRole("status").getByText("Marking as done…");
    await expect(marking).toBeVisible();
    expect(await colourOf(marking)).toBe(await tokenColour(page, "--quiet"));
    release();
    await expect(panel).toHaveCount(0);
    // The card's Started that opened the terminal is gone, so the keyboard
    // goes to the session's Recent sessions entry.
    await expect(
      entry.getByRole("button", { name: "Open terminal" }),
    ).toBeFocused();

    await expect(started).toHaveCount(0);
    await expect(action(readyStory, "Execution")).toBeEnabled();
    await expect(entry.locator(".recent-session-state")).toHaveText("Done");
    await expect(entry).toContainText(`Named ${doneName}`);
    // Claude Code keeps the conversation, so the entry still opens it.
    await expect(
      entry.getByRole("button", { name: "Open terminal" }),
    ).toBeVisible();
    await expectMembership(page, queued);

    await page.reload();
    await settled();
    await expect(entry.locator(".recent-session-state")).toHaveText("Done");
    await expect(entry).toContainText(`Named ${doneName}`);
    await expect(action(readyStory, "Execution")).toBeEnabled();
    await expectMembership(page, queued);
  });

  test("a refused mark keeps the panel open and says so as a problem, as an ended terminal does", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openSettlementJourney(
      page,
      settlement,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    const status = panel.getByRole("status");
    await settled();
    await launch(readyStory, "Execution");
    await card(readyStory)
      .getByRole("region", { name: "Execution started" })
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    // The project folder moves away, so the boundary refuses the mark.
    const folder = path.join(dashboard.home, "git", "open-dough");
    renameSync(folder, `${folder}.moved`);

    await panel.getByRole("button", { name: "Mark as done" }).click();

    const refused = status.getByText("The session could not be marked done.");
    await expect(refused).toBeVisible();
    expect(await colourOf(refused)).toBe(await tokenColour(page, "--problem"));
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Mark as done" }),
    ).toBeEnabled();
    expect(
      dashboard.claudeCalls().filter((call) => call.argv[0] === "stop"),
    ).toEqual([]);

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
    const { card, settled, launch } = await openSettlementJourney(
      page,
      settlement,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    const started = (workflow: "Execution" | "Refinement") =>
      card(readyStory).getByRole("region", { name: `${workflow} started` });
    await settled();
    await launch(readyStory, "Execution");
    await launch(readyStory, "Refinement");
    await started("Execution")
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    const release = await holdDoneRequests(page);
    await panel.getByRole("button", { name: "Mark as done" }).click();
    await expect(panel.getByRole("status")).toHaveText("Marking as done…");

    await started("Refinement")
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

    await expect(started("Execution")).toHaveCount(0);
    await expect(panel).toContainText("Refinement session");
    await expect(typing).toBeFocused();
  });
});
