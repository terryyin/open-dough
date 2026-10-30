// Touch editing retains one story draft and its choices through rotation and
// constrained height. Cancel restores focus without calling the native host.
import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  expectEveryControlReachable,
  expectNoSidewaysScrollIn,
  tapWhereShown,
} from "./pageLayout.ts";
import {
  longTitle,
  openLongTitleOrigin,
  publishLongTitleOrigin,
  type LongTitleOrigin,
} from "./longTitleLaunch.ts";
import {
  phoneLaunchTouchViewport,
  typeInstructionLine,
} from "./touchLaunchPage.ts";

let published: LongTitleOrigin;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  published = await publishLongTitleOrigin();
});
test.afterAll(() => (published as LongTitleOrigin | undefined)?.cleanup());
test.use({ projectFolders: ["open-dough"] });

const optionsSummary = (dialog: Locator) =>
  dialog.locator("summary", { hasText: "Refinement options" });

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} touch launch editing`, () => {
  test.use({ viewport: portrait, hasTouch: true });

  test("rotation and short visible height preserve the draft and choices, and Cancel sends no launch", async ({
    page,
    dashboard,
  }) => {
    await openLongTitleOrigin(page, dashboard.home, published);
    const launcher = parts(page)
      .backlog.getByRole("article", { name: longTitle })
      .getByRole("button", { name: "Start refinement" });
    await launcher.scrollIntoViewIfNeeded();
    await tapWhereShown(launcher);
    const dialog = page.getByRole("dialog");
    const instruction = dialog.getByRole("textbox", {
      name: "Instruction (optional)",
    });
    let draft =
      "Keep the selected story.\n\nExplain the next step 日本語.\nPreserve this final line.";
    await expect(instruction).toBeFocused();
    await instruction.fill(draft);

    const host = dialog.getByRole("combobox", { name: "Host" });
    const model = dialog.getByRole("combobox", { name: "Model" });
    await host.scrollIntoViewIfNeeded();
    await tapWhereShown(host);
    await host.selectOption("codex");
    await expect(dialog).toHaveAccessibleName("Start refinement in Codex");
    await host.selectOption("claude");
    await model.scrollIntoViewIfNeeded();
    await tapWhereShown(model);
    await model.selectOption("sonnet");
    const standard = dialog.locator("label", {
      has: page.getByRole("radio", { name: "Standard", exact: true }),
    });
    await standard.scrollIntoViewIfNeeded();
    await tapWhereShown(standard);
    await optionsSummary(dialog).scrollIntoViewIfNeeded();
    await tapWhereShown(optionsSummary(dialog));
    const explore = dialog.locator("label", { hasText: "Explore" });
    await explore.scrollIntoViewIfNeeded();
    await tapWhereShown(explore);
    await expect(
      dialog.getByRole("checkbox", { name: "Explore", exact: true }),
    ).toBeChecked();

    for (const viewport of [
      landscape,
      { width: portrait.width, height: 300 },
      portrait,
    ]) {
      await page.setViewportSize(viewport);
      await expect(instruction).toHaveValue(draft);
      await expect(model).toHaveValue("sonnet");
      await expect(optionsSummary(dialog)).toHaveText(
        "Refinement options Explore (1)",
      );
      for (const action of ["Cancel", "Start"])
        await expect(
          dialog.getByRole("button", { name: action, exact: true }),
        ).toBeInViewport({ ratio: 1 });
      await expect(
        dialog.getByText("The session runs in this project's folder."),
      ).toBeInViewport({ ratio: 1 });
      await instruction.scrollIntoViewIfNeeded();
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
    await tapWhereShown(
      dialog.getByRole("button", { name: "Cancel", exact: true }),
    );
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  });
});
