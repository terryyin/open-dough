// Cases registered by ./agent-launch-story-card.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { storyCardSessions, sessionStateOf } from "./dashboardPage.ts";
import { instructionField, openTakenBacklog } from "./launchStoryCardPage.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { notRefinedIdentity, notRefinedStory } from "./launchJourney.ts";

test.describe("phone touch submission", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("only explicit Start sends the exact multiline draft and the card distinguishes accepted startup from a launched session", async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("held");
    const { card, start, dialog } = await openTakenBacklog(page, launchJourney);
    const launcher = start(notRefinedStory);
    await launcher.scrollIntoViewIfNeeded();
    await tapWhereShown(launcher);
    const field = instructionField(dialog);
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
    await expect(storyCardSessions(card(notRefinedStory))).toHaveCount(0);
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(dashboard.claudeLaunchCalls()[0]?.argv.at(-1)).toBe(
      `/dough-execute-plan ${notRefinedIdentity}\n\n${draft}`,
    );
    await page.setViewportSize({ width: 844, height: 390 });
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
    dashboard.releaseHeldClaude();
    const session = storyCardSessions(card(notRefinedStory));
    await expect(session).toHaveCount(1);
    await expect(session).toContainText("Execution started in Claude Code");
    await expect(sessionStateOf(session)).toHaveText("Working");
    await expect(session).toBeFocused();
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});
