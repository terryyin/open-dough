// Intent's location and folder tree as the reader operates it: disclosure
// toggles, selectable location and folder names, and the selected scope's
// Summary (../../src/IntentLocationHeader.tsx, ../../src/StoryReviewFileTree.tsx,
// ../../src/IntentSummary.tsx). An opened file reads through
// ./intent-file-reading-page.ts.
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { fileName, scopeName, scopeToggle } from "./intent-browser-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";

const textOf = (locator: Locator) => () => locator.query()?.textContent ?? "";

function disclosure(locator: Locator) {
  const control = {
    async click() {
      await userEvent.click(locator);
      return control;
    },
    // Operates the control from the keyboard with KEY ("{Enter}" or " ").
    async press(key: string) {
      (locator.element() as HTMLElement).focus();
      await userEvent.keyboard(key);
      return control;
    },
    async isExpanded(expanded: boolean) {
      await expect
        .element(locator)
        .toHaveAttribute("aria-expanded", String(expanded));
      return control;
    },
    async isSelected(selected: boolean) {
      await expect
        .element(locator)
        .toHaveAttribute("aria-pressed", String(selected));
      return control;
    },
  };
  return control;
}

// How the header of the location at PATH reads against its column.
export function locationHeader(path: string) {
  const header = scopeToggle(path).query()?.parentElement;
  if (!header) throw new Error(`Intent has no location header at ${path}`);
  return header;
}

export function locationHeaderLook(path: string) {
  const header = locationHeader(path);
  const column =
    header.closest("li[data-folder-path], .intent-locations") ?? header;
  const box = header.getBoundingClientRect();
  const columnLeft = column.getBoundingClientRect().left + column.clientLeft;
  const label =
    header.querySelector(
      ".intent-location-name > *, .story-review-folder-name",
    ) ?? header;
  return {
    background: getComputedStyle(header).backgroundColor,
    mark: getComputedStyle(header).boxShadow,
    controlsShowHeader: [...header.children].every(
      (child) => getComputedStyle(child).backgroundColor === "rgba(0, 0, 0, 0)",
    ),
    fullWidth:
      Math.abs(box.left - columnLeft) < 1 &&
      Math.abs(box.width - column.clientWidth) < 1,
    labelWeight: Number(getComputedStyle(label).fontWeight),
  };
}

export function intentScopeTree() {
  const summaryRegion = page.getByRole("region", {
    name: "Summary",
    exact: true,
  });
  const purpose = page.getByRole("region", { name: "Purpose", exact: true });
  const tree = {
    // The disclosure toggle of the location or folder at PATH.
    toggle: (path: string) => disclosure(scopeToggle(path)),
    // The selectable name of the location or folder at PATH.
    name: (path: string) => disclosure(scopeName(path)),
    async openFile(path: string) {
      await userEvent.click(fileName(path));
      return intentFileReading(path);
    },
    // The file at PATH sits inside a collapsed folder.
    async hidesFile(path: string) {
      await expect
        .poll(() => fileName(path).query()?.checkVisibility() ?? false)
        .toBe(false);
      return tree;
    },
    // The selected scope's Summary reads each of TEXTS.
    async summarizes(...texts: readonly string[]) {
      for (const text of texts)
        await expect.poll(textOf(summaryRegion)).toContain(text);
      return tree;
    },
    async summaryExcludes(text: string) {
      await expect.poll(textOf(summaryRegion)).not.toContain(text);
      return tree;
    },
    // The Summary lists its immediate folders and files in the tree's order.
    async summaryLists(names: readonly string[]) {
      await expect
        .poll(() =>
          summaryRegion
            .getByRole("table")
            .getByRole("rowheader")
            .getByRole("button")
            .elements()
            .map((name) => name.textContent),
        )
        .toEqual(names);
      return tree;
    },
    async showsNoSummary() {
      await expect.element(summaryRegion).not.toBeInTheDocument();
      return tree;
    },
    async showsNoPurpose() {
      await expect.element(purpose).not.toBeInTheDocument();
      return tree;
    },
  };
  return tree;
}
