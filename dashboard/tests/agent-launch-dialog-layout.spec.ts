// The launch dialog's reading order and fit, on a committed origin whose
// queued Story C has a long title (./launchJourney.ts fixtures) and a project
// that installs the real refinement skill's options (./launchCardPage.ts): the
// instruction takes the keyboard first; host and model share a row on a wide
// screen and stack, host first, on a narrow one; the Session group follows;
// the refinement options sit in a closed disclosure whose summary names the
// selection, open or closed; the command line and its flags sit in a closed
// Command details; the launch's effects and Cancel and Start stay in view
// under a scrolling body with every option selected, with no horizontal
// scrolling at 320 CSS pixels or at 200% zoom; Cancel returns the keyboard to
// Start refinement.
//
// 200% zoom is emulated as the browser lays it out: zooming a 1280×900 window
// to 200% halves its CSS viewport to 640×450 and doubles the device pixels per
// CSS pixel, so that viewport with `deviceScaleFactor: 2` is the same layout.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page } from "@playwright/test";
import {
  backlogFile,
  createPreparationTrunk,
  git,
  lsRemoteSha,
  seedC,
} from "../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { box } from "./pageLayout.ts";
import { expect, test } from "./dashboardTest.ts";
import {
  installRefinementSkill,
  shippedRefinementDefinition,
  showOptions,
} from "./launchCardPage.ts";
import { notRefinedIdentity } from "./launchJourney.ts";

const longTitle =
  "Let developers read a very long queued story title that wraps across several lines without widening the dialog: Supercalifragilisticexpialidocious-session-options-with-an-unbroken-name";

let published: {
  readonly origin: string;
  readonly revision: string;
  readonly cleanup: () => Promise<void>;
};
test.beforeAll(async () => {
  test.setTimeout(120_000);
  const trunk = await createPreparationTrunk();
  const { integration } = trunk;
  for (const file of [seedC, backlogFile]) {
    const at = path.join(integration, file);
    writeFileSync(
      at,
      readFileSync(at, "utf8").replaceAll("Story C", longTitle),
    );
  }
  await git(integration, "commit", "--quiet", "-am", "retitle story C");
  await git(integration, "push", "--quiet", "origin", "main");
  const revision = await lsRemoteSha(trunk.origin, "refs/heads/main");
  if (revision === undefined) throw new Error("origin has no main");
  published = { origin: trunk.origin, revision, cleanup: trunk.cleanup };
});
test.afterAll(() => (published as typeof published | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

async function openRefinement(page: Page, home: string) {
  installRefinementSkill(home);
  await publishCommittedOrigin(page, {
    repoDir: published.origin,
    revision: published.revision,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", { name: longTitle });
  const launcher = card.getByRole("button", { name: "Start refinement" });
  await launcher.click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(dialog).toBeVisible();
  return { launcher, dialog };
}

const optionsSummary = (dialog: Locator) =>
  dialog.locator("summary", { hasText: "Refinement options" });
const commandSummary = (dialog: Locator) =>
  dialog.locator("summary", { hasText: "Command details" });

// Whether anything on the page, or inside the dialog, scrolls sideways.
async function horizontalOverflow(page: Page, dialog: Locator) {
  const pageOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  const dialogOverflow = await dialog.evaluate((element) =>
    [element, ...element.querySelectorAll("*")].some(
      (inner) => inner.scrollWidth > inner.clientWidth + 1,
    ),
  );
  return { pageOverflow, dialogOverflow };
}

test("the instruction comes first, the summaries name the selection, and the command details hold the flags", async ({
  page,
  dashboard,
}) => {
  const { launcher, dialog } = await openRefinement(page, dashboard.home);
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
    host,
    model,
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
    viewport: { width: 640, height: 450 },
    deviceScaleFactor: 2,
    stacked: false,
  },
]) {
  test.describe(name, () => {
    test.use({ viewport, deviceScaleFactor });

    test("with every option selected, nothing scrolls sideways and Cancel and Start stay in view", async ({
      page,
      dashboard,
    }) => {
      const { dialog } = await openRefinement(page, dashboard.home);
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

      expect(await horizontalOverflow(page, dialog)).toEqual({
        pageOverflow: false,
        dialogOverflow: false,
      });
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
