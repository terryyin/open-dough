// An unattached session keeps its instruction and policy through touch
// editing, then cancels or explicitly submits through the real start origin.
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { openBacklog } from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  closeSidePanelToBoard,
  expectEveryControlReachable,
  expectNoSidewaysScrollIn,
  tapWhereShown,
} from "../../dashboard/test-support/pageLayout.ts";
import {
  phoneLaunchTouchViewport,
  typeInstructionLine,
} from "../../dashboard/test-support/touchLaunchPage.ts";
import { startedSessionTerminal } from "../../dashboard/test-support/support/startedSessionTerminal.ts";

const executionCheckoutEffects =
  "Execution checkout · Automatically land The session runs in this project's execution checkout, with its existing changes; verified results land on origin without another review. Pressing Start authorizes that push.";

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} touch session editing`, () => {
  test.use({ viewport: portrait, hasTouch: true });

  test("the draft survives rotation and constrained height, Cancel sends nothing, and explicit Start shows acceptance then the actual session", async ({
    page,
    origin,
    dashboard,
  }) => {
    await openBacklog(page, origin);
    const launcher = startSession(page, "Open Dough");
    await tapWhereShown(launcher);
    const dialog = startSessionDialog(page, "Open Dough");
    const instruction = startSessionField(dialog);
    let draft =
      "Review the current work.\n\nKeep this exact multiline question 日本語.\nWhat remains?";
    await instruction.fill(draft);
    for (const choice of [
      "Isolated workspace",
      "Automatically land",
      "Execution checkout",
    ]) {
      const radio = dialog.getByRole("radio", { name: choice, exact: true });
      const label = dialog.locator("label", {
        has: page.getByRole("radio", { name: choice, exact: true }),
      });
      await expect(radio).toBeEnabled();
      await label.scrollIntoViewIfNeeded();
      await tapWhereShown(label);
      await expect(radio).toBeChecked();
    }
    const start = dialog.getByRole("button", { name: "Start", exact: true });
    for (const viewport of [
      landscape,
      { width: portrait.width, height: 300 },
      portrait,
    ]) {
      await page.setViewportSize(viewport);
      await expect(instruction).toHaveValue(draft);
      await expect(
        dialog.getByRole("radio", { name: "Execution checkout", exact: true }),
      ).toBeChecked();
      await expect(
        dialog.getByRole("radio", {
          name: "Automatically land",
          exact: true,
        }),
      ).toBeChecked();
      await expect(start).toHaveAccessibleDescription(executionCheckoutEffects);
      for (const kept of [
        start,
        dialog.getByRole("button", { name: "Cancel" }),
        dialog.getByText("Pressing Start authorizes that push."),
      ])
        await expect(kept).toBeInViewport({ ratio: 1 });
      await instruction.evaluate((field) => {
        field.scrollIntoView({ block: "center" });
      });
      await tapWhereShown(instruction);
      await expect(instruction).toBeFocused();
      if (viewport.height === 300) {
        draft = await typeInstructionLine(
          instruction,
          draft,
          "Edited with limited visible height.",
        );
        await expect(instruction).toHaveValue(draft);
      }
      await expectNoSidewaysScrollIn(page, dialog);
      await expectEveryControlReachable(dialog);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
    }
    await tapWhereShown(dialog.getByRole("button", { name: "Cancel" }));
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
    expect(dashboard.claudeLaunchCalls()).toEqual([]);

    await tapWhereShown(launcher);
    await expect(instruction).toHaveValue("");
    await instruction.fill(draft);
    dashboard.claudeScenario("held");
    await page.setViewportSize({ width: portrait.width, height: 300 });
    await tapWhereShown(start);
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeDisabled();
    await expect(page.locator(".start-session-answer")).toContainText(
      "Local startup in progress.",
    );
    await expect
      .poll(() => dashboard.claudeLaunchCalls(), { timeout: launchWaitMs })
      .toHaveLength(1);
    expect(
      dashboard
        .claudeLaunches()[0]
        ?.instruction?.split("\n\nDashboard reporting context:")[0],
    ).toBe(draft);
    dashboard.releaseHeldClaude();
    const entry = sessionEntriesIn(parts(page).taken);
    await closeSidePanelToBoard(await startedSessionTerminal(page, entry));
    await expect(parts(page).adHocStarted).toHaveCount(0);
    await expect(entry).toHaveCount(1);
    await expect(launcher).toBeEnabled();
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});
