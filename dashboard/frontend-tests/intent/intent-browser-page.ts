// Intent's test browser as the reader finds and operates it: the revision it
// browses, its locations' folders and files, and the reading pane. Opening a
// file hands over its reading (./intent-file-reading-page.ts).
import { expect, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { shortRevision } from "../../src/publishedWork.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";

export function intentBrowser() {
  const revision = page.getByLabelText("Test browser revision", {
    exact: true,
  });
  const purpose = page.getByRole("region", { name: "Purpose", exact: true });
  const folder = (path: string) =>
    page.getByRole("button", {
      name: new RegExp(`^(Expand|Collapse) ${path}$`),
    });
  const file = (path: string) =>
    page.getByRole("button", { name: path, exact: true });
  // The focusable area the selected file's reading scrolls in.
  const readingPane = () => {
    let pane = purpose.element().parentElement;
    while (pane !== null && !pane.hasAttribute("tabindex"))
      pane = pane.parentElement;
    if (pane === null) throw new Error("Intent shows no reading pane");
    return pane;
  };

  const browser = {
    async isAt(published: string) {
      await expect
        .element(revision)
        .toHaveTextContent(`Test browser at ${shortRevision(published)}`);
      return browser;
    },
    // Opens the file, expanding its folder when collapsed.
    async open(path: string) {
      const toggle = folder(path.slice(0, path.lastIndexOf("/")));
      await expect.element(toggle).toBeVisible();
      if (toggle.element().getAttribute("aria-expanded") === "false")
        await userEvent.click(toggle);
      await userEvent.click(file(path));
      return intentFileReading(path);
    },
    async showsFolderExpanded(path: string) {
      await expect
        .element(folder(path))
        .toHaveAttribute("aria-expanded", "true");
      return browser;
    },
    async listsUnselected(path: string) {
      await expect.element(file(path)).toBeVisible();
      await expect
        .element(file(path))
        .not.toHaveAttribute("aria-pressed", "true");
      return browser;
    },
    async showsNoSource() {
      await expect
        .element(page.getByLabelText(/ source$/).first())
        .not.toBeInTheDocument();
      return browser;
    },
    async explains(text: string) {
      await expect
        .poll(() => purpose.query()?.textContent ?? "")
        .toContain(text);
      return browser;
    },
    // Scrolls the reading pane halfway, answering the offset it reached.
    async scrollHalfway() {
      const pane = readingPane();
      const most = pane.scrollHeight - pane.clientHeight;
      expect(most).toBeGreaterThan(40);
      pane.scrollTo({ top: Math.floor(most / 2) });
      await vi.waitUntil(() => pane.scrollTop > 20);
      return pane.scrollTop;
    },
    async isScrolledTo(offset: number) {
      await expect.poll(() => readingPane().scrollTop).toBe(offset);
      return browser;
    },
    async hasPaneFocused() {
      await expect.poll(() => document.activeElement).toBe(readingPane());
      return browser;
    },
  };
  return browser;
}
