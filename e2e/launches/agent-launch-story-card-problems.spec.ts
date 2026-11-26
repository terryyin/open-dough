// A Backlog launch that may not have started, on the committed origin of
// ./agent-launch-story-card.spec.ts: on a phone, a constrained-height Start
// whose synthetic `claude` (../../dashboard/test-support/fixtures/fake-claude) does
// not answer within the launch wait reports uncertainty under Startup
// recovery, and only the explicit recovery choice starts its kept instruction
// again. What the card and Startup recovery say about failed and uncertain
// answers is covered by ../../dashboard/frontend-tests/launches/story-card-startup.spec.ts
// and ../../dashboard/frontend-tests/launches/startup-recovery.spec.ts.

import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { test } from "../../dashboard/test-support/support/startOriginTest.ts";
import {
  expectMembership,
  parts,
  storyCardSessions,
} from "../../dashboard/test-support/dashboardPage.ts";
import { storyLaunchChoices } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { tapWhereShown } from "../../dashboard/test-support/pageLayout.ts";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { installedStoryLaunchInput } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import {
  readyStory,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchWaitEnd: true });

  test.describe("phone touch recovery", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test("a constrained-height Start reports uncertainty and only the explicit recovery choice starts its kept instruction again", async ({
      page,
      dashboard,
      origin,
    }) => {
      dashboard.claudeScenario("hang");
      const board = await openInstalledStoryBoard(page, origin, {
        follows: false,
      });
      const launch = await board.open(readyStory, "Execution", "touch");
      const draft =
        "Keep this instruction.\n\nExplain an uncertain launch before continuing.";
      await launch.instruction.fill(draft);
      await storyLaunchChoices(launch.dialog).effort.selectOption("max");
      await page.setViewportSize({ width: 390, height: 300 });
      await expect(launch.instruction).toHaveValue(draft);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
      await launch.submit();
      await expect(launch.dialog).toBeHidden();
      const card = board.card(readyStory);
      await expect(card).toContainText(
        /Local startup in progress|Starting execution in Claude Code/,
      );
      await expect
        .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
        .toHaveLength(1);
      await dashboard.endLaunchWait();
      const recovery = parts(page).startupRecovery;
      await expect(recovery).toContainText(
        "Claude Code did not answer in time, so the session may or may not have started.",
      );
      await expect(card).toContainText("Startup needs reconciliation");
      await expect(storyCardSessions(card)).toHaveCount(0);
      await expect(board.action(readyStory, "Execution")).toBeDisabled();
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
      const session = storyCardSessions(card);
      await expect(session).toHaveCount(1, { timeout: launchWaitMs });
      await expect(session).toContainText("Execution started in Claude Code");
      await expect(card).not.toContainText("Startup needs reconciliation");
      expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
      expect(
        dashboard.claudeLaunches().map((each) => {
          const { invocation, handoff, reporting, instruction } =
            installedStoryLaunchInput(each.instruction);
          expect(handoff).toContain("Established start:");
          expect(reporting).toContain("Dashboard reporting context:");
          return { invocation, instruction };
        }),
      ).toEqual([
        { invocation: "/dough-execute-plan SEED-B#b", instruction: draft },
        { invocation: "/dough-execute-plan SEED-B#b", instruction: draft },
      ]);
      // The explicit Continue starts again at the effort the Start chose.
      expect(dashboard.claudeLaunches().map(({ effort }) => effort)).toEqual([
        "max",
        "max",
      ]);
      const entry = await session.getAttribute("data-shows-session");
      await board.showPublished();
      await expectMembership(page, {
        taken: [readyStory],
        backlog: [takenStory],
      });
      await expect(session).toHaveCount(1);
      await expect(session).toHaveAttribute("data-shows-session", entry ?? "");
    });
  });
});
