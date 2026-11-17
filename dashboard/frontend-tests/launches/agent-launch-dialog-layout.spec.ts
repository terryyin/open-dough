// The refinement dialog's reading order and fit, for a queued story with a
// long title in a project whose installed refinement skill offers the real
// shipped options (answered by the machine's sessions read): the instruction
// takes the keyboard first, then Record; host/model share a row and stack,
// host first, on a narrow screen; the Session group follows; the refinement
// options sit in a closed disclosure whose summary names the selection, open
// or closed; the command line and its flags sit in a closed Command details;
// the launch's effects and Cancel and Start stay in view under a scrolling
// body with every option selected, every control scrolls into view, with no
// horizontal scrolling at 320 CSS pixels or at 200% zoom; Cancel returns the
// keyboard to Start refinement. 200% zoom is emulated as
// ../../tests/accessibleReading.ts's twiceZoomedWindow. Built frontend against
// controlled answers; which options a project's installed skill offers is
// ../../../e2e/launches/agent-launch-options.spec.ts.

import type { Locator } from "@playwright/test";
import { twiceZoomedWindow } from "../../tests/accessibleReading.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollIn,
} from "../../tests/pageLayout.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";
import {
  shippedRefinementDefinition,
  showOptions,
} from "../../tests/launchStoryCardPage.ts";
import { notRefinedIdentity } from "../../tests/launchJourney.ts";
import {
  longTitle,
  openLongTitleRefinement,
} from "../../tests/longTitleLaunch.ts";

const optionsSummary = (dialog: Locator) =>
  dialog.locator("summary", { hasText: "Refinement options" });
const commandSummary = (dialog: Locator) =>
  dialog.locator("summary", { hasText: "Command details" });

test("the instruction comes first, the summaries name the selection, and the command details hold the flags", async ({
  page,
  frontendServices,
}) => {
  const { launcher, dialog } = await openLongTitleRefinement(
    page,
    frontendServices,
  );
  const instruction = dialog.getByRole("textbox", {
    name: "Instruction (optional)",
  });
  const host = dialog.getByRole("combobox", { name: "Host" });
  const model = dialog.getByRole("combobox", { name: "Model" });
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  const cancel = dialog.getByRole("button", { name: "Cancel" });

  await expect(instruction).toBeFocused();
  await expect(dialog).toContainText(longTitle);
  await expect(dialog).toContainText(notRefinedIdentity);
  await expect(dialog).toContainText(
    "Claude Code starts a background session on this machine to refine this story.",
  );

  // Host, then Model, on one row.
  const hostBox = await box(host);
  const modelBox = await box(model);
  expect(hostBox.y).toBe(modelBox.y);
  expect(hostBox.x).toBeLessThan(modelBox.x);

  // The effects stay in view and describe Start.
  const effects = "The session runs in this project's folder.";
  await expect(dialog.getByText(effects)).toBeVisible();
  await expect(start).toHaveAccessibleDescription(effects);

  // Both disclosures start closed.
  const explore = dialog.getByRole("checkbox", { name: "Explore" });
  const uxUi = dialog.getByRole("checkbox", { name: "UX/UI" });
  const command = dialog.locator("code");
  await expect(optionsSummary(dialog)).toHaveText(
    "Refinement options None selected",
  );
  await expect(explore).toBeHidden();
  await expect(command).toBeHidden();
  await expect(command).toHaveText(
    `/dough-story-refinement ${notRefinedIdentity}`,
  );
  // Keyboard order follows the reading order.
  for (const next of [
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    host,
    model,
    dialog.getByRole("combobox", { name: "Reasoning effort" }),
    dialog.getByRole("radio", { name: "Standard" }),
    optionsSummary(dialog),
    commandSummary(dialog),
    cancel,
    start,
  ]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }

  // A selection shows in the summary, open or closed, and survives closing.
  await showOptions(dialog);
  await uxUi.check();
  await explore.check();
  const selected = "Refinement options Explore, UX/UI (2)";
  await expect(optionsSummary(dialog)).toHaveText(selected);
  await optionsSummary(dialog).click();
  await expect(explore).toBeHidden();
  await expect(optionsSummary(dialog)).toHaveText(selected);
  await optionsSummary(dialog).click();
  await expect(explore).toBeChecked();
  await expect(uxUi).toBeChecked();
  await expect(dialog.getByRole("group", { name: "Options" })).toBeVisible();

  // Command details show the flags the selection sends.
  await commandSummary(dialog).click();
  await expect(command).toBeVisible();
  await expect(command).toHaveText(
    `/dough-story-refinement ${notRefinedIdentity} --explore --ux-ui`,
  );

  // Cancel returns the keyboard to the action that opened the dialog.
  await cancel.click();
  await expect(dialog).toBeHidden();
  await expect(launcher).toBeFocused();
});

for (const { name, viewport, deviceScaleFactor, stacked } of [
  {
    name: "at 320 CSS pixels",
    viewport: { width: 320, height: 640 },
    deviceScaleFactor: 1,
    stacked: true,
  },
  {
    name: "at 200% zoom",
    viewport: twiceZoomedWindow,
    deviceScaleFactor: 2,
    stacked: false,
  },
]) {
  test.describe(name, () => {
    test.use({ viewport, deviceScaleFactor });

    test("with every option selected, nothing scrolls sideways, every control is reachable, and Cancel and Start stay in view", async ({
      page,
      frontendServices,
    }) => {
      const { dialog } = await openLongTitleRefinement(page, frontendServices);
      const host = dialog.getByRole("combobox", { name: "Host" });
      const model = dialog.getByRole("combobox", { name: "Model" });
      const hostBox = await box(host);
      const modelBox = await box(model);
      if (stacked) {
        expect(hostBox.y).toBeLessThan(modelBox.y);
      } else {
        expect(hostBox.y).toBe(modelBox.y);
      }

      await showOptions(dialog);
      const { options: actions, focuses } = shippedRefinementDefinition();
      const options = [...actions, ...focuses];
      for (const { label } of options) {
        await dialog
          .getByRole("checkbox", { name: label, exact: true })
          .check();
      }
      await expect(optionsSummary(dialog)).toContainText(`(${options.length})`);
      await commandSummary(dialog).click();
      await expect(dialog.locator("code")).toContainText(
        options.map(({ flag }) => flag).join(" "),
      );

      await expectNoSidewaysScrollIn(page, dialog);
      await expectEveryControlReachable(dialog);
      for (const action of ["Cancel", "Start"]) {
        await expect(
          dialog.getByRole("button", { name: action, exact: true }),
        ).toBeInViewport({ ratio: 1 });
      }
      await expect(
        dialog.getByText("The session runs in this project's folder."),
      ).toBeInViewport({ ratio: 1 });
    });
  });
}
