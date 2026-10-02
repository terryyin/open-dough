// An ad hoc launch from the project actions row that did not start, or may
// not have started, on the committed origin of ./agent-launch-card.spec.ts:
// the answer stays beside Start session, which stays enabled to start again,
// and it lists no session, opens no terminal, and shows on no card. The page's
// own dashboard server launches the synthetic `claude` (./fixtures/fake-claude);
// the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { cardSessions, parts } from "./dashboardPage.ts";
import type { Page } from "@playwright/test";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
// Publishing runs production backlog commands against a local origin; give
// it its own budget so a busy machine cannot starve it.
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const failures = [
  {
    scenario: "untrusted",
    words:
      "Launch failed: Claude Code does not trust ~/git/open-dough yet. Run claude in that folder once and accept the trust prompt.",
  },
  {
    scenario: "refused",
    words:
      "Launch failed: Claude Code refused to start a session in ~/git/open-dough. Run claude in that folder once to see why.",
  },
] as const;

async function startAdHoc(page: Page) {
  await startSession(page, "Open Dough").click();
  await startSessionDialog(page, "Open Dough")
    .getByRole("button", { name: "Start" })
    .click();
}

async function expectNothingStarted(page: Page) {
  const { recentSessions } = parts(page);
  await expect(startSessionDialog(page, "Open Dough")).toBeHidden();
  await expect(recentSessions.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(0);
  await expect(
    page.getByRole("log").filter({ hasText: "Ad hoc session started" }),
  ).toHaveCount(0);
}

for (const { scenario, words } of failures) {
  test(`${scenario}: the row says Launch failed and why beside Start session, which stays enabled with the keyboard on it, and a later start launches and clears it`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario(scenario);
    const { card } = await openTakenBacklog(page, journey);
    const button = startSession(page, "Open Dough");
    const row = page.locator(".project-actions");

    await startAdHoc(page);

    await expect(row.locator(".launch-problem")).toHaveText(words);
    await expect(row.locator(".launch-problem code")).toHaveText("claude");
    await expect(button).toBeEnabled();
    await expect(button).toBeFocused();
    await expect(button).toHaveAccessibleDescription(
      /Run claude in that folder once/,
    );
    await expectNothingStarted(page);
    await expect(page.locator(".launch-problem")).toHaveCount(1);
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    expect(dashboard.claudeCalls()).toHaveLength(1);

    dashboard.claudeScenario("launched");
    await startAdHoc(page);

    await expect(page.locator(".launch-problem")).toHaveCount(0);
    await expect(parts(page).recentSessions.getByRole("article")).toHaveCount(
      1,
    );
    await expect(page.getByRole("region", { name: "Terminal" })).toHaveCount(1);
    await expect(
      page.getByRole("log").filter({ hasText: "Ad hoc session started" }),
    ).toHaveCount(1);
    await expect(button).toHaveAccessibleDescription("");
  });
}

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test("hang: Start session is disabled while in flight, and the row then says Launch uncertain with the claude agents advice beside an enabled button", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("hang");
    const { card } = await openTakenBacklog(page, journey);
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
    );
    await expect(page.locator(".launch-problem code")).toHaveText(
      "claude agents",
    );
    // Startup recovery shows the same answer, as formed.
    await expect(
      page.getByRole("region", { name: "Startup recovery" }),
    ).toContainText(
      "Its last answer: Claude Code did not answer in time, so the session may or may not have started. Check claude agents for it.",
    );
    await expect(button).toBeEnabled();
    await expect(button).toBeFocused();
    await expectNothingStarted(page);
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    expect(dashboard.claudeCalls()).toHaveLength(1);
  });
});
