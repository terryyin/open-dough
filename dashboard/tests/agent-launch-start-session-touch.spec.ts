// An unattached session keeps its instruction and policy through touch
// editing, then cancels or explicitly submits through the real start origin.
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog } from "./support/sessionDialog.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import { parts } from "./dashboardPage.ts";
import {
  expectEveryControlReachable,
  expectNoSidewaysScrollIn,
  tapWhereShown,
} from "./pageLayout.ts";
import {
  phoneLaunchTouchViewport,
  typeInstructionLine,
} from "./touchLaunchPage.ts";

const defaultMainEffects =
  "Default main · Automatically land The session runs in this project's folder on default main, with its existing changes; verified results land on origin without another review. Pressing Start authorizes that push.";

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} touch session editing`, () => {
  test.use({ viewport: portrait, hasTouch: true });

  test("the draft survives rotation and constrained height, Cancel sends nothing, and explicit Start shows acceptance then the actual session", async ({
    page,
    origin,
    dashboard,
  }) => {
    test.setTimeout(120_000);
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
      "Default main",
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
        dialog.getByRole("radio", { name: "Default main", exact: true }),
      ).toBeChecked();
      await expect(
        dialog.getByRole("radio", {
          name: "Automatically land",
          exact: true,
        }),
      ).toBeChecked();
      await expect(start).toHaveAccessibleDescription(defaultMainEffects);
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
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(
      dashboard
        .claudeLaunchCalls()[0]
        ?.argv.at(-1)
        ?.split("\n\nDashboard reporting context:")[0],
    ).toBe(draft);
    dashboard.releaseHeldClaude();
    await expect(parts(page).adHocStarted).toBeVisible({ timeout: 30_000 });
    await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
    await expect(launcher).toBeEnabled();
    expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
  });
});
