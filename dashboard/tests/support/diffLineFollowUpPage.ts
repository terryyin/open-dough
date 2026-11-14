// Line-number menu on a Done story's DiffLines (`../../src/DiffLineNumber.tsx`):
// open by pointer, keyboard or touch, dismiss with Escape or outside click,
// and Follow up opens the existing Start session dialog for that line.

import { expect, type Locator, type Page } from "@playwright/test";
import { lineNumberLabel, type DiffLineSide } from "../../src/diffLineSide.ts";
import { codePane, diffLines } from "./reviewPanes.ts";
import {
  expectFileFollowUpDialog,
  fileFollowUpDialog,
} from "./fileFollowUpPage.ts";

export const lineNumberControl = (
  scope: Locator,
  side: DiffLineSide,
  line: number,
) =>
  scope.getByRole("button", {
    name: lineNumberLabel(side, line),
    exact: true,
  });

export const lineNumberMenu = (page: Page, label: string) =>
  page.getByRole("menu", { name: label, exact: true });

export async function openLineMenu(
  control: Locator,
  using: "pointer" | "keyboard" | "touch",
) {
  if (using === "pointer") await control.click();
  else if (using === "touch") await control.tap();
  else {
    await control.focus();
    await control.press("Enter");
  }
}

export async function expectLineMenuOpen(page: Page, label: string) {
  const menu = lineNumberMenu(page, label);
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitem")).toHaveText(["Follow up"]);
  return menu;
}

export async function copyDiffLine(page: Page, line: Locator) {
  await line.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await page.keyboard.press(
    process.platform === "darwin" ? "Meta+c" : "Control+c",
  );
  return page.evaluate(() => navigator.clipboard.readText());
}

export async function expectNoLineNumberTabStops(diff: Locator) {
  const numbers = diff.locator(".story-review-line-number");
  await expect(numbers.first()).toBeVisible();
  expect(
    await numbers.evaluateAll(
      (items) => items.filter((item) => item.tabIndex >= 0).length,
    ),
  ).toBe(0);
  const code = codePane(diff);
  await code.focus();
  await expect(code).toBeFocused();
  await code.page().keyboard.press("Tab");
  expect(
    await code
      .page()
      .evaluate(() =>
        document.activeElement?.classList.contains("story-review-line-number"),
      ),
  ).toBe(false);
}

export async function followUpFromLine(
  page: Page,
  diff: Locator,
  side: DiffLineSide,
  line: number,
  storyName: string,
  context: readonly (string | RegExp)[],
  using: "pointer" | "keyboard" | "touch" = "pointer",
) {
  const label = lineNumberLabel(side, line);
  const control = lineNumberControl(diff, side, line);
  await openLineMenu(control, using);
  const menu = await expectLineMenuOpen(page, label);
  const follow = menu.getByRole("menuitem", { name: "Follow up", exact: true });
  await expect(follow).toBeFocused();
  await follow.press("Enter");
  await expect(menu).toHaveCount(0);
  const dialog = fileFollowUpDialog(page);
  await expectFileFollowUpDialog(dialog, storyName, context);
  return dialog;
}

export { diffLines, codePane };
