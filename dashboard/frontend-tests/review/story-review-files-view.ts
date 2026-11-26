// The Review changes panel's changed files as a reader meets them
// (./story-review-panel-page.ts): the list naming how many files changed, a
// file's row with its line counts, and the selected file's diff and code.
import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { sidebarPlacement } from "../../test-support/sidebarPlacement.ts";

export function reviewFiles(region: Locator) {
  const list = (name: string) =>
    region.getByRole("list", { name, exact: true });
  // A file's row, a button named by its kind and path, as "Added a.txt".
  const row = (file: string) =>
    region.getByRole("button", { name: file, exact: true });
  const diff = (file: string) =>
    region.getByRole("region", { name: file, exact: true });
  const code = (file: string) => {
    const pane = diff(file).element().querySelector(".story-review-code");
    if (!pane) throw new Error(`No code shown for ${file}.`);
    return pane;
  };
  const filesToggle = region.getByRole("button", {
    name: /^(Hide|Show) files$/,
  });
  // Files shown before its tree is used: a narrow review keeps it in a
  // drawer that starts closed and closes on each choice. Waits out the
  // moment its state and style disagree after the room changes.
  const showTree = async () => {
    const placement = () => sidebarPlacement(filesToggle.element());
    await expect.poll(placement).not.toBe("pending");
    if (placement() !== "hidden") return;
    await filesToggle.click();
    await expect.poll(placement).not.toBe("hidden");
  };
  const files = {
    async expectListed(name: string) {
      await expect.element(list(name)).toBeVisible();
      return files;
    },

    // The list's file names, in order.
    async expectRows(name: string, rows: readonly string[]) {
      await expect.element(list(name)).toBeVisible();
      await expect
        .poll(() =>
          [...list(name).element().querySelectorAll("button")].map(
            (button) => button.innerText,
          ),
        )
        .toEqual(rows.map((file): unknown => expect.stringContaining(file)));
      return files;
    },

    // Chooses the file in Files, opening Files first where it is closed.
    async chooseFile(file: string) {
      await showTree();
      await row(file).click();
      return files;
    },

    // The file is the one selected: its row says so and its diff is shown.
    async expectSelected(file: string) {
      await expect.element(row(file)).toHaveAttribute("aria-pressed", "true");
      await expect.element(diff(file)).toBeVisible();
      return files;
    },

    async expectDiffShows(file: string, text: string) {
      await expect.element(diff(file)).toBeVisible();
      await expect.poll(() => diff(file).element().textContent).toContain(text);
      return files;
    },

    async expectDiffLacks(file: string, text: string) {
      await expect.element(diff(file)).toBeVisible();
      await expect
        .poll(() => diff(file).element().textContent)
        .not.toContain(text);
      return files;
    },

    // Scrolls the file's code to `top` px and answers where it rests.
    scrollCodeTo(file: string, top: number) {
      const pane = code(file);
      pane.scrollTo(0, top);
      return pane.scrollTop;
    },

    // Where the file's code is scrolled to now, in px.
    codeScrollTop(file: string) {
      return code(file).scrollTop;
    },

    async chooseFileByKeyboard(file: string) {
      await showTree();
      (row(file).element() as HTMLElement).focus();
      await userEvent.keyboard("{Enter}");
      return files;
    },

    // The file's line counts as its row shows them, as in “+1 −0”.
    async expectLineCounts(file: string, counts: string) {
      await expect
        .poll(() =>
          row(file)
            .element()
            .querySelector<HTMLElement>(".story-review-line-counts")
            ?.innerText.trim(),
        )
        .toBe(counts);
      return files;
    },
  };
  return files;
}
