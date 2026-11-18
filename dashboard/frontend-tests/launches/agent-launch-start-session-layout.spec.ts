// The Start session dialog's reading order and fit, with no story title to
// stretch it, against controlled answers: the text takes the keyboard first,
// Host, Model and Reasoning effort follow, then the Session group with
// Workspace and After checks, the closed Command details, and Cancel and
// Start with the line of what Start does always in view. With Automatically
// land chosen in either workspace, whose lines are the longest, and Command
// details open, nothing scrolls sideways and every control is reachable at
// 320 CSS pixels and at 200% zoom (../../test-support/accessibleReading.ts's
// twiceZoomedWindow), where the choices of each group wrap under their legend
// rather than widen the dialog. When the machine's read says the project's
// installed skills establish a session, every choice is offered; without it
// the other choices are disabled with why, which fits as well. A started
// session is ../../../e2e/launches/agent-launch-ad-hoc.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { twiceZoomedWindow } from "../../test-support/accessibleReading.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../test-support/launchStoryCardPage.ts";
import {
  box,
  expectEveryControlReachable,
  expectNoSidewaysScrollIn,
} from "../../test-support/pageLayout.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import {
  openDoughSource,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const lands =
  "verified results land on origin without another review. Pressing Start authorizes that push.";
const effects = {
  "Default main": `Default main · Automatically land The session runs in this project's folder on default main, with its existing changes; ${lands}`,
  "Isolated workspace": `Isolated workspace · Automatically land The session runs in a new workspace under .worktrees/; ${lands}`,
};

async function openStartSession(page: Page) {
  await openFrontendTakenBacklog(page);
  await startSession(page, "Open Dough").click();
  return startSessionDialog(page, "Open Dough");
}

// The machine's sessions read when Open Dough's installed skills establish a
// session with no story in Claude Code, so every Session choice is offered.
function establishingSessions(services: FrontendServiceState) {
  const answer = makeMe.aMachineAnswer.please();
  services.answerMachine({
    ...answer,
    sessionPolicies: [
      { source: openDoughSource.id, workflow: "ad-hoc", host: "claude" },
    ],
  });
}

test("the text comes first, then Attach images, Host, Model and Reasoning effort, the Session group, Command details, Cancel and Start", async ({
  page,
  frontendServices,
}) => {
  establishingSessions(frontendServices);
  const dialog = await openStartSession(page);
  await expect(startSessionField(dialog)).toBeFocused();
  const details = dialog.locator("summary", { hasText: "Command details" });
  const where = dialog.getByText(
    "The session runs in this project's folder on default main, with its existing changes.",
    { exact: true },
  );
  await expect(where).toBeHidden();
  for (const next of [
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    dialog.getByRole("combobox", { name: "Host" }),
    dialog.getByRole("combobox", { name: "Model" }),
    dialog.getByRole("combobox", { name: "Reasoning effort" }),
    dialog.getByRole("radio", { name: "Default main" }),
    dialog.getByRole("radio", { name: "Wait for review" }),
    details,
    dialog.getByRole("button", { name: "Cancel" }),
    dialog.getByRole("button", { name: "Start", exact: true }),
  ]) {
    await page.keyboard.press("Tab");
    await expect(next).toBeFocused();
  }
  // Start session has no command line; its details say where it runs.
  await details.click();
  await expect(where).toBeVisible();
  await expect(dialog.locator("code")).toHaveCount(0);
});

for (const { name, viewport, deviceScaleFactor, wrapped } of [
  {
    name: "at 320 CSS pixels",
    viewport: { width: 320, height: 640 },
    deviceScaleFactor: 1,
    wrapped: true,
  },
  {
    name: "at 200% zoom",
    viewport: twiceZoomedWindow,
    deviceScaleFactor: 2,
    wrapped: false,
  },
]) {
  test.describe(name, () => {
    test.use({ viewport, deviceScaleFactor });

    test("with Automatically land chosen in either workspace and Command details open, nothing scrolls sideways, every control is reachable, and the line beside Start stays in view", async ({
      page,
      frontendServices,
    }) => {
      establishingSessions(frontendServices);
      const dialog = await openStartSession(page);
      const choices = (group: string, names: readonly [string, string]) =>
        names.map((name) =>
          dialog.getByRole("group", { name: group }).getByRole("radio", {
            name,
          }),
        ) as [Locator, Locator];
      const workspace = choices("Workspace", [
        "Isolated workspace",
        "Default main",
      ]);
      const landing = choices("After checks", [
        "Wait for review",
        "Automatically land",
      ]);
      await landing[1].check();
      await dialog.locator("summary", { hasText: "Command details" }).click();
      await expect(
        dialog.getByText("Its first message carries the established session"),
      ).toBeVisible();

      // Each group's two choices share a row where it fits, and wrap where
      // it does not; After checks follows Workspace.
      for (const [first, second] of [workspace, landing]) {
        const [one, other] = [await box(first), await box(second)];
        if (wrapped) expect(other.y).toBeGreaterThan(one.y);
        else expect(other.y).toBe(one.y);
      }
      expect((await box(landing[0])).y).toBeGreaterThan(
        (await box(workspace[1])).y,
      );

      const start = dialog.getByRole("button", { name: "Start", exact: true });
      for (const chosen of ["Default main", "Isolated workspace"] as const) {
        await dialog.getByRole("radio", { name: chosen }).check();
        await expectNoSidewaysScrollIn(page, dialog);
        await expectEveryControlReachable(dialog);
        await expect(start).toHaveAccessibleDescription(effects[chosen]);
        for (const kept of [
          start,
          dialog.getByRole("button", { name: "Cancel" }),
          dialog.getByText("Pressing Start authorizes that push."),
        ])
          await expect(kept).toBeInViewport({ ratio: 1 });
      }
    });

    test("with the other choices not offered, nothing scrolls sideways, why is readable in view, and Cancel and Start are reachable", async ({
      page,
    }) => {
      // The default read: no installed skill establishes a session.
      const dialog = await openStartSession(page);
      const why = dialog.getByText(
        "Isolated workspace and Automatically land are not offered: the installed skills in this project do not establish a session without a story for this host.",
      );
      await why.scrollIntoViewIfNeeded();
      await expect(why).toBeInViewport({ ratio: 1 });
      const dialogBox = await box(dialog);
      const whyBox = await box(why);
      expect(whyBox.x).toBeGreaterThanOrEqual(dialogBox.x);
      expect(whyBox.x + whyBox.width).toBeLessThanOrEqual(
        dialogBox.x + dialogBox.width,
      );
      for (const name of ["Isolated workspace", "Automatically land"])
        await expect(dialog.getByRole("radio", { name })).toBeDisabled();
      await expectNoSidewaysScrollIn(page, dialog);
      await expectEveryControlReachable(dialog);
      for (const kept of [
        dialog.getByRole("button", { name: "Start", exact: true }),
        dialog.getByRole("button", { name: "Cancel" }),
      ]) {
        await expect(kept).toBeEnabled();
        await expect(kept).toBeInViewport({ ratio: 1 });
      }
    });
  });
}
