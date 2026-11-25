import { expect, type Locator } from "@playwright/test";
import { filesColumn, showIntentFiles } from "./intentModePage.ts";
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

  // Files shown to read or act on its tree: a narrow page keeps it in a
  // drawer that starts closed and closes once a file is chosen.
  shown() {
    return showIntentFiles(this.#intent);
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
    await this.shown();
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
    await this.shown();
    await expectTreeRows(this.outsideList, rows);
    return this;
  }

  async expectNone() {
    await expect(outsideGroup(this.#intent)).toHaveCount(0);
    return this;
  }

  async expectOutsideLacks(...texts: readonly string[]) {
    await this.shown();
    for (const text of texts) {
      await expect(this.outsideList).not.toContainText(text);
    }
    return this;
  }

  async expectSelected(file: string) {
    await this.shown();
    await expect(intentFile(this.#intent, file)).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    return this;
  }

  async expectNoSelection() {
    await this.shown();
    await expect(
      filesColumn(this.#intent).locator(
        'li[data-kind] button[aria-pressed="true"]',
      ),
    ).toHaveCount(0);
    return this;
  }

  async expandFolder(name: string) {
    await this.shown();
    await folderToggle(this.#intent, name, false).click();
    await expect(folderToggle(this.#intent, name, true)).toBeVisible();
    return this;
  }

  async collapseFolder(name: string) {
    await this.shown();
    await folderToggle(this.#intent, name, true).click();
    await expect(folderToggle(this.#intent, name, false)).toBeVisible();
    return this;
  }

  async collapseLocation(path: string) {
    await this.shown();
    const toggle = intentGroupToggle(this.#intent, path);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    return this;
  }

  async expectNotShown(file: string) {
    await this.shown();
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
    await this.shown();
    await expect(this.folderName(name)).toBeVisible();
    return this;
  }

  async expectLineCounts(file: string, visible: string, description?: string) {
    await this.shown();
    const row = this.row(file);
    const counts = fileLineCounts(row);
    await expect(counts).toBeVisible();
    await expect(counts).toHaveText(visible, { useInnerText: true });
    if (description !== undefined)
      await expect(row).toHaveAccessibleDescription(description);
  }

  async expectTrunkQualifier(file: string) {
    await this.shown();
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
    await this.shown();
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
