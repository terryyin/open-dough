// Explicit touch submission preserves the story instruction and distinguishes
// accepted startup from the native session on the committed launch origin.
import { expect, test } from "./dashboardTest.ts";
import { cardSessions, sessionStateOf } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { tapWhereShown } from "./pageLayout.ts";
import {
  notRefinedIdentity,
  notRefinedStory,
  publishLaunchJourney,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use({ projectFolders: ["open-dough"] });

test.describe("phone touch submission", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("only explicit Start sends the exact multiline draft and the card distinguishes accepted startup from a launched session", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("held");
    const { card, start, dialog } = await openTakenBacklog(page, journey);
    const launcher = start(notRefinedStory);
    await launcher.scrollIntoViewIfNeeded();
    await tapWhereShown(launcher);
    const field = dialog.getByRole("textbox", {
      name: "Instruction (optional)",
    });
    const draft =
      "Refine this story first.\n\nKeep the exact next steps 日本語.\nThen execute.";
    await field.fill(draft);
    for (const viewport of [
      { width: 844, height: 390 },
      { width: 390, height: 300 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(field).toHaveValue(draft);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
    }
    await tapWhereShown(
      dialog.getByRole("button", { name: "Start", exact: true }),
    );
    await expect(dialog).toBeHidden();
    await expect(card(notRefinedStory)).toContainText(
      "Local startup in progress",
    );
    await expect(start(notRefinedStory)).toBeDisabled();
    await expect(cardSessions(card(notRefinedStory))).toHaveCount(0);
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(dashboard.claudeLaunchCalls()[0]?.argv.at(-1)).toBe(
      `/dough-execute-plan ${notRefinedIdentity}\n\n${draft}`,
    );
    await page.setViewportSize({ width: 844, height: 390 });
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    dashboard.releaseHeldClaude();
    const session = cardSessions(card(notRefinedStory));
    await expect(session).toHaveCount(1);
    await expect(session).toContainText("Execution started in Claude Code");
    await expect(sessionStateOf(session)).toHaveText("Working");
    await expect(session).toBeFocused();
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});
