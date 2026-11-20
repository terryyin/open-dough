// A story card's Done disclosure as the reader finds and operates it: its
// summary with the Done count, and the Done history rows it reveals.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";

export function doneDisclosure() {
  const label = page.getByText("Done", { exact: true });
  const summary = () => {
    const found = label.element().closest("summary");
    if (found === null) throw new Error("Done label sits in no summary");
    return found;
  };
  const details = () => {
    const found = summary().closest("details");
    if (found === null) throw new Error("Done summary sits in no disclosure");
    return found;
  };
  const rowSessions = () =>
    [
      ...page
        .getByRole("list", { name: "Done history", exact: true })
        .element()
        .querySelectorAll("[data-shows-session]"),
    ].map((row) => row.getAttribute("data-shows-session"));

  const disclosure = {
    async isAbsent() {
      await expect.element(label).not.toBeInTheDocument();
      return disclosure;
    },
    async showsCollapsedCount(count: number) {
      await expect.element(label).toBeInTheDocument();
      await expect
        .element(page.elementLocator(summary()))
        .toHaveTextContent(`Done${count}`);
      await expect.poll(() => details().open).toBe(false);
      return disclosure;
    },
    async toggle() {
      await userEvent.click(page.elementLocator(summary()));
      return disclosure;
    },
    // Session keys of the revealed rows, top to bottom.
    async showsRows(keys: readonly string[]) {
      await expect.poll(() => details().open).toBe(true);
      await expect.poll(rowSessions).toEqual(keys);
      return disclosure;
    },
    async keepsFocusOnSummary() {
      await expect.element(page.elementLocator(summary())).toHaveFocus();
      return disclosure;
    },
  };
  return disclosure;
}
