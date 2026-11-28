// An ad hoc launch from the project actions row whose native session did not
// start, or may not have started, after its story was admitted on the bare
// origin of the installed project: the answer stays beside Start session,
// which stays enabled to start again, and it lists no session, opens no
// terminal, and shows on no backlog card. The page's own dashboard server
// launches the synthetic `claude`; the real one is never reached.

import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { terminalPanel } from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  storyCardSessions,
  expectDirectionOpensAcrossRow,
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import type { Page } from "@playwright/test";
import {
  startSession,
  startSessionDialog,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";

// The admitted story stays published and its kept start resumes on the same
// Start request, under the same story.
const kept =
  " The Taken story was published. Continue or the same Start request can resume in the execution checkout ~/git/open-dough on branch main.";
const failures = [
  {
    scenario: "untrusted",
    words: `Launch failed: Claude Code does not trust ~/git/open-dough yet. Run claude in that folder once and accept the trust prompt.${
      kept
    }`,
  },
  {
    scenario: "refused",
    words: `Launch failed: Claude Code refused to start a session in ~/git/open-dough. Run claude in that folder once to see why.${
      kept
    }`,
  },
] as const;

async function startAdHoc(page: Page) {
  await startSession(page, "Open Dough").click();
  await startSessionDialog(page, "Open Dough")
    .getByRole("button", { name: "Start" })
    .click();
}

async function expectNothingStarted(page: Page) {
  const { recentlyDone } = parts(page);
  await expect(startSessionDialog(page, "Open Dough")).toBeHidden();
  await expect(recentlyDone.getByRole("article")).toHaveCount(0);
  await expect(terminalPanel(page)).toHaveCount(0);
  await expect(parts(page).adHocStarted).toHaveCount(0);
}

for (const { scenario, words } of failures) {
  test(`${scenario}: the row says Launch failed and why beside Start session, which stays enabled with the keyboard on it, and a later start launches and clears it`, async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario(scenario);
    const card = (await openInstalledStoryBoard(page, origin)).card("Story A");
    const button = startSession(page, "Open Dough");
    const row = parts(page).projectActions;

    await startAdHoc(page);

    await expect(row.locator(".launch-problem")).toHaveText(words, {
      timeout: launchWaitMs,
    });
    await expect(row.locator(".launch-problem code")).toHaveText("claude");
    await expect(button).toBeEnabled();
    await expect(button).toBeFocused();
    await expect(button).toHaveAccessibleDescription(
      /Run claude in that folder once/,
    );
    await expectNothingStarted(page);
    await expect(page.locator(".launch-problem")).toHaveCount(1);
    await expect(storyCardSessions(card)).toHaveCount(0);
    expect(dashboard.claudeCalls()).toHaveLength(1);
    await expectDirectionOpensAcrossRow(page);
    const claim = await origin.originGit("rev-parse", "main");

    dashboard.claudeScenario("launched");
    await startAdHoc(page);

    await expect(page.locator(".launch-problem")).toHaveCount(0);
    await expect(sessionEntriesIn(parts(page).taken)).toHaveCount(1);
    await expect(terminalPanel(page)).toHaveCount(1);
    await expect(parts(page).adHocStarted).toHaveCount(0);
    await expect(button).toHaveAccessibleDescription("");
    expect(await origin.originGit("rev-parse", "main")).toBe(claim);
  });
}

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test("hang: Start session is disabled while in flight, and the row then says Launch uncertain with the claude agents advice beside an enabled button", async ({
    page,
    dashboard,
    origin,
  }) => {
    dashboard.claudeScenario("hang");
    const card = (await openInstalledStoryBoard(page, origin)).card("Story A");
    const button = startSession(page, "Open Dough");
    const dialog = startSessionDialog(page, "Open Dough");

    await button.click();
    await dialog.getByRole("button", { name: "Start" }).click();

    // Accepted: the dialog closes while the launch is in flight.
    await expect(dialog).toBeHidden();
    await expect(button).toBeDisabled();
    await expect(
      page.locator(".project-actions .launch-problem"),
    ).toContainText(
      "Launch uncertain: Claude Code did not answer in time, so the session may or may not have started. Check claude agents for it.",
      { timeout: launchWaitMs },
    );
    await expect(page.locator(".launch-problem code")).toHaveText(
      "claude agents",
    );
    // Startup recovery shows the same answer, as formed.
    await expect(parts(page).startupRecovery).toContainText(
      "Its last answer: Claude Code did not answer in time, so the session may or may not have started. Check claude agents for it.",
    );
    await expect(button).toBeEnabled();
    await expect(button).toBeFocused();
    await expectNothingStarted(page);
    await expect(storyCardSessions(card)).toHaveCount(0);
    expect(dashboard.claudeCalls()).toHaveLength(1);
  });
});
