// The file browser and diffs of Review changes (./reviewChangesPage.ts): the
// changed files list, named by the count the scenario expects, a file chosen
// in it, and the chosen file's diff. The scenario supplies the list's name,
// file names and diff text.

import { expect, type Locator } from "@playwright/test";
import {
  changedFilesList,
  expectFileSelected,
  expectLineCounts,
  expectTreeRows,
  fileRow,
  listedFile,
  treeFolder,
} from "./support/reviewTreeRows.ts";
import { fileBrowser } from "./support/reviewContextLine.ts";

type Name = string | RegExp;

export class ReviewFiles {
  readonly #review: Locator;

  constructor(review: Locator) {
    this.#review = review;
  }

  #list(list: Name) {
    return changedFilesList(this.#review, list, { exact: true });
  }

  #file(list: Name, file: Name) {
    return listedFile(this.#list(list), file, { exact: true });
  }

  #diffs() {
    return this.#review.locator(".story-review-diff");
  }

  async expectListed(list: Name, files?: readonly Name[]) {
    await expect(this.#list(list)).toBeVisible();
    for (const file of files ?? [])
      await expect(this.#file(list, file)).toBeVisible();
    return this;
  }

  // The list's rows as they read on screen, folders indented.
  async expectRows(list: Name, rows: readonly string[]) {
    await expectTreeRows(this.#list(list), rows);
    return this;
  }

  // No changed files list at all.
  async expectNone() {
    await expect(changedFilesList(this.#review, /changed file/)).toHaveCount(0);
    return this;
  }

  async choose(list: Name, file: Name, using: "mouse" | "keyboard" = "mouse") {
    const shown = this.#file(list, file);
    await (using === "keyboard" ? shown.press("Enter") : shown.click());
    return this;
  }

  async expectChosen(list: Name, file: Name, chosen = true) {
    await expect(this.#file(list, file)).toHaveAttribute(
      "aria-pressed",
      String(chosen),
    );
    return this;
  }

  // Chooses a file shown in the file browser, whichever list holds it.
  async chooseShown(file: string, using: "mouse" | "keyboard" = "mouse") {
    const row = fileRow(this.#review, file);
    await (using === "keyboard" ? row.press("Enter") : row.click());
    return this;
  }

  // The file is the one selected: its row says so and its diff is shown.
  async expectSelected(file: string) {
    await expectFileSelected(this.#review, file);
    return this;
  }

  // The file browser shows the file, whichever list holds it.
  async expectShown(file: Name) {
    await expect(fileRow(this.#review, file)).toBeVisible();
    return this;
  }

  async expectNotShown(file: Name) {
    await expect(fileRow(this.#review, file)).toHaveCount(0);
    return this;
  }

  // A list no longer shown, such as the whole snapshot's once narrowed.
  async expectListGone(list: Name) {
    await expect(this.#list(list)).toHaveCount(0);
    return this;
  }

  // The heading over the files, naming their count.
  async expectHeading(name: string) {
    await expect(
      this.#review.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    return this;
  }

  // The file's line counts as its row shows them, as in “+1 −0”.
  async expectLineCounts(file: string, counts: string) {
    await expectLineCounts(this.#review, file, counts);
    return this;
  }

  // What the file's row is described as, such as its line counts in words.
  async expectDescribed(file: string, description: string) {
    await expect(fileRow(this.#review, file)).toHaveAccessibleDescription(
      description,
    );
    return this;
  }

  #move(to: "Previous file" | "Next file") {
    return this.#review.getByRole("button", { name: to });
  }

  // Moves to the previous or next file with the mouse.
  async move(to: "Previous file" | "Next file") {
    await this.#move(to).click();
    return this;
  }

  // The move goes no further: the first or last file is selected.
  async expectMoveAtEnd(to: "Previous file" | "Next file") {
    await expect(this.#move(to)).toHaveAttribute("aria-disabled", "true");
    return this;
  }

  // The review lists nothing: no file list, no commit list.
  async expectNoLists() {
    await expect(this.#review.getByRole("list")).toHaveCount(0);
    return this;
  }

  // No file browser at all, not even a hidden one.
  async expectNoBrowser() {
    await expect(fileBrowser(this.#review)).toHaveCount(0);
    return this;
  }

  // Neither a list nor a file's diff is shown.
  async expectNothingShown() {
    await this.expectNoLists();
    await expect(this.#review.getByRole("region")).toHaveCount(0);
    return this;
  }

  // In a narrow panel the file browser sits above the diff.
  async expectBrowserAboveDiff() {
    const [browser, diff] = await Promise.all([
      fileBrowser(this.#review).boundingBox(),
      this.#diffs().boundingBox(),
    ]);
    if (browser === null || diff === null)
      throw new Error("The file browser or diff is not laid out.");
    expect(diff.y).toBeGreaterThan(browser.y + browser.height);
    return this;
  }

  // The list's file controls, in order, each named by its kind and full
  // path; one of them chosen. A folder's disclosure is not a file control.
  async expectFileControls(list: Name, names: readonly string[]) {
    const controls = this.#list(list).locator("button[aria-pressed]");
    await expect(controls).toHaveCount(names.length);
    for (const [index, name] of names.entries())
      await expect(controls.nth(index)).toHaveAccessibleName(name);
    await expect(
      this.#list(list).locator('button[aria-pressed="true"]'),
    ).toHaveCount(1);
    return this;
  }

  async expectListLacks(list: Name, ...texts: readonly string[]) {
    for (const text of texts)
      await expect(this.#list(list)).not.toContainText(text);
    return this;
  }

  // Collapses or expands a folder with the mouse.
  async toggleFolder(folder: Name) {
    await treeFolder(this.#review, folder).click();
    return this;
  }

  async expectFolderExpanded(folder: Name, expanded: boolean) {
    await expect(treeFolder(this.#review, folder)).toHaveAttribute(
      "aria-expanded",
      String(expanded),
    );
    return this;
  }

  // How many rows the file browser marks with their kind of change.
  async expectKindMarks(count: number) {
    await expect(
      this.#review.locator(".story-review-files [data-kind]"),
    ).toHaveCount(count);
    return this;
  }
}
