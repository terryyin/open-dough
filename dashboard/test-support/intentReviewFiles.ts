import { expect, type Locator } from "@playwright/test";
import { filesColumn } from "./intentModePage.ts";
import { intentGroupToggle } from "./intentPerspectivePage.ts";
import {
  folderToggle,
  intentFile,
  intentStory,
  outsideGroup,
} from "./support/intentStoryPage.ts";
import { expectTreeRows, fileLineCounts } from "./support/reviewTreeRows.ts";

export class IntentReviewFiles {
  readonly #intent: Locator;

  constructor(intent: Locator) {
    this.#intent = intent;
  }

  outsideToMeasure() {
    return outsideGroup(this.#intent);
  }

  get outsideList() {
    return this.outsideToMeasure().getByRole("list", {
      name: "Changed files outside Intent locations",
      exact: true,
    });
  }

  async expectOutsideCount(count: number) {
    await expect(this.outsideList.locator("li[data-kind]")).toHaveCount(count);
    return this;
  }

  async expectOutsideFiles(count: number, names: readonly string[]) {
    await this.expectOutsideCount(count);
    const story = intentStory(this.#intent);
    for (const name of names) {
      await expect(story.outsideFile(name)).toBeVisible();
    }
    return this;
  }

  async expectOutsideRows(rows: readonly string[]) {
    await expectTreeRows(this.outsideList, rows);
    return this;
  }

  async expectNone() {
    await expect(outsideGroup(this.#intent)).toHaveCount(0);
    return this;
  }

  async expectOutsideLacks(...texts: readonly string[]) {
    for (const text of texts) {
      await expect(this.outsideList).not.toContainText(text);
    }
    return this;
  }

  async expectSelected(file: string) {
    await expect(intentFile(this.#intent, file)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    return this;
  }

  async expectNoSelection() {
    await expect(
      filesColumn(this.#intent).locator(
        'li[data-kind] button[aria-pressed="true"]',
      ),
    ).toHaveCount(0);
    return this;
  }

  async expandFolder(name: string) {
    await folderToggle(this.#intent, name, false).click();
    await expect(folderToggle(this.#intent, name, true)).toBeVisible();
    return this;
  }

  async collapseFolder(name: string) {
    await folderToggle(this.#intent, name, true).click();
    await expect(folderToggle(this.#intent, name, false)).toBeVisible();
    return this;
  }

  async collapseLocation(path: string) {
    const toggle = intentGroupToggle(this.#intent, path);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    return this;
  }

  async expectNotShown(file: string) {
    await expect(intentFile(this.#intent, file)).toHaveCount(0);
    return this;
  }

  async expectNoBrowser() {
    await expect(filesColumn(this.#intent)).toHaveCount(0);
    return this;
  }

  row(file: string) {
    return intentFile(this.#intent, file);
  }

  folder(name: string) {
    return this.outsideList
      .getByRole("button", { name: `Expand ${name}`, exact: true })
      .or(
        this.outsideList.getByRole("button", {
          name: `Collapse ${name}`,
          exact: true,
        }),
      );
  }

  folderName(name: string) {
    return this.outsideList.getByRole("button", { name, exact: true });
  }

  async expectFolderName(name: string) {
    await expect(this.folderName(name)).toBeVisible();
    return this;
  }

  async expectLineCounts(file: string, visible: string, description?: string) {
    const row = this.row(file);
    const counts = fileLineCounts(row);
    await expect(counts).toBeVisible();
    await expect(counts).toHaveText(visible, { useInnerText: true });
    if (description !== undefined)
      await expect(row).toHaveAccessibleDescription(description);
  }

  async expectTrunkQualifier(file: string) {
    await expect(
      this.row(file).getByText("includes trunk's changes", { exact: true }),
    ).toBeVisible();
  }

  moveControl(name: "Previous file" | "Next file") {
    return this.#intent.getByRole("button", { name, exact: true });
  }

  async move(
    name: "Previous file" | "Next file",
    using: "mouse" | "keyboard" = "mouse",
  ) {
    const control = this.moveControl(name);
    await (using === "keyboard" ? control.press("Enter") : control.click());
  }

  async expectMoveAtEnd(name: "Previous file" | "Next file") {
    await expect(this.moveControl(name)).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  }

  async choose(file: string, using: "mouse" | "keyboard" | "touch" = "mouse") {
    const control = intentFile(this.#intent, file);
    if (using === "touch") await control.tap();
    else
      await (using === "keyboard" ? control.press("Enter") : control.click());
    return this;
  }
}

export function intentReviewFiles(intent: Locator) {
  return new IntentReviewFiles(intent);
}
