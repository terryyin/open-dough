// Mark as done in the page's one terminal (./agent-terminal.spec.ts), on the
// committed settlement origin (./launchJourney.ts): the panel closes, the
// session is renamed `done-<name>` through its terminal and stopped, the card
// offers its Start action again while the story is in the Backlog, and
// Recent sessions shows the entry Done under its `done-` name, still
// openable. Origin alone still places the story. The page's own dashboard
// server drives the synthetic `claude` (./fixtures/fake-claude); the real one
// is never reached.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  notRefinedStory,
  publishSettlementJourney,
  readyStory,
  takenStory,
  type SettlementJourney,
} from "./launchJourney.ts";
import { openSettlementJourney } from "./settlementPage.ts";
import { processRunning } from "./support/processGroup.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("marking a session done from its terminal", () => {
  let settlement: SettlementJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    settlement = await publishSettlementJourney();
  });
  test.afterAll(() => (settlement as SettlementJourney | undefined)?.cleanup());

  test("Mark as done closes the panel, renames and stops the session, offers Start again, and shows the entry Done", async ({
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
      name: `Execution session for ${readyStory}`,
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
    const shortId = String(session?.["id"]);
    const doneName = `done-${String(session?.["name"])}`;
    await page.keyboard.type("half an answer");

    await panel.getByRole("button", { name: "Mark as done" }).click();

    await expect(panel).toHaveCount(0);
    // The rename reached the attached session, whose draft Ctrl+U cleared,
    // and the session was stopped after the attachment ended.
    const attaches = () =>
      dashboard.claudeAttaches().filter((attach) => attach.id === shortId);
    expect(attaches().flatMap((attach) => attach.lines)).toEqual([
      `/rename ${doneName}`,
    ]);
    await expect
      .poll(() =>
        attaches().every(
          (attach) =>
            attach.endedBy !== undefined && !processRunning(attach.pid),
        ),
      )
      .toBe(true);
    expect(
      dashboard
        .claudeLaunchCalls()
        .filter((call) => call.argv[0] === "stop")
        .map((call) => call.argv),
    ).toEqual([["stop", shortId]]);
    const [listed] = dashboard.claudeListing();
    expect(listed).toMatchObject({ name: doneName, state: "stopped" });
    expect(listed).not.toHaveProperty("status");

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
});
