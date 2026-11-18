// A Backlog launch that may not have started, on the committed origin of
// ./agent-launch-story-card.spec.ts: on a phone, a constrained-height Start
// whose synthetic `claude` (../../dashboard/test-support/fixtures/fake-claude) does
// not answer within the launch wait reports uncertainty under Startup
// recovery, and only the explicit recovery choice starts its kept instruction
// again. What the card and Startup recovery say about failed and uncertain
// answers is ../../dashboard/frontend-tests/launches/agent-launch-story-card-answers.spec.ts
// and ../../dashboard/frontend-tests/launches/agent-launch-story-card-uncertain.spec.ts.

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  parts,
  storyCardSessions,
} from "../../dashboard/test-support/dashboardPage.ts";
import { tapWhereShown } from "../../dashboard/test-support/pageLayout.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { readyStory } from "../../dashboard/test-support/launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test.describe("phone touch recovery", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test("a constrained-height Start reports uncertainty and only the explicit recovery choice starts its kept instruction again", async ({
      page,
      dashboard,
      launchJourney,
    }) => {
      dashboard.claudeScenario("hang");
      const { card, start, dialog } = await openTakenBacklog(
        page,
        launchJourney,
      );
      const launcher = start(readyStory);
      await launcher.scrollIntoViewIfNeeded();
      await tapWhereShown(launcher);
      const draft =
        "Keep this instruction.\n\nExplain an uncertain launch before continuing.";
      const field = dialog.getByRole("textbox", {
        name: "Instruction (optional)",
      });
      await field.fill(draft);
      await page.setViewportSize({ width: 390, height: 300 });
      await expect(field).toHaveValue(draft);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
      await tapWhereShown(
        dialog.getByRole("button", { name: "Start", exact: true }),
      );
      await expect(dialog).toBeHidden();
      await expect(card(readyStory)).toContainText("Local startup in progress");
      const recovery = parts(page).startupRecovery;
      await expect(recovery).toContainText(
        "Claude Code did not answer in time, so the session may or may not have started.",
      );
      await expect(card(readyStory)).toContainText(
        "Startup needs reconciliation",
      );
      await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
      await expect(launcher).toBeDisabled();
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      await page.setViewportSize({ width: 844, height: 300 });
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      const advice = recovery.getByText(
        "Check claude agents before continuing:",
        { exact: false },
      );
      await advice.scrollIntoViewIfNeeded();
      await expect(advice).toBeInViewport({ ratio: 1 });
      dashboard.claudeScenario("launched");
      const continueStart = recovery.getByRole("button", {
        name: /^Continue execution start/,
      });
      await continueStart.scrollIntoViewIfNeeded();
      await tapWhereShown(continueStart);
      const session = storyCardSessions(card(readyStory));
      await expect(session).toHaveCount(1);
      await expect(session).toContainText("Execution started in Claude Code");
      await expect(card(readyStory)).not.toContainText(
        "Startup needs reconciliation",
      );
      expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
      expect(
        dashboard.claudeLaunches().map((each) => each.instruction),
      ).toEqual([
        `/dough-execute-plan SEED-B#b\n\n${draft}`,
        `/dough-execute-plan SEED-B#b\n\n${draft}`,
      ]);
    });
  });
});
