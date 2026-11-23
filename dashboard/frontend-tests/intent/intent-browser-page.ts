// Intent's test browser as the reader finds and operates it: the revision it
// browses, its locations' folders and files, and the reading pane. Opening a
// file hands over its reading (./intent-file-reading-page.ts).
import { expect, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { shortRevision } from "../../src/publishedWork.ts";
import { activateButton } from "../page-objects/activateButton.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";

// The disclosure toggle of the location or folder at `path`.
export const scopeToggle = (path: string) =>
  page.getByRole("button", {
    name: new RegExp(`^(Expand|Collapse) ${path}$`),
  });

// The selectable name of the location or folder at `path`.
export const scopeName = (path: string) =>
  page.getByRole("button", {
    name: new RegExp(`^${path}(\\s|$)`),
  });

export const fileName = (path: string) =>
  page.getByRole("button", { name: path, exact: true });

export function intentBrowser() {
  const revision = page.getByLabelText("Test browser revision", {
    exact: true,
  });
  const purpose = page.getByRole("region", { name: "Purpose", exact: true });
  // The focusable area the selected file's reading scrolls in.
  const readingPane = () => {
    let pane = purpose.element().parentElement;
    while (pane !== null && !pane.hasAttribute("tabindex"))
      pane = pane.parentElement;
    if (pane === null) throw new Error("Intent shows no reading pane");
    return pane;
  };

  const browser = {
    async isClosed() {
      await expect
        .element(page.getByRole("region", { name: "Project Intent" }))
        .not.toBeInTheDocument();
      return browser;
    },
    async isAt(published: string) {
      await expect
        .element(revision)
        .toHaveTextContent(`Test browser at ${shortRevision(published)}`);
      return browser;
    },
    // Opens the file, expanding its folder when collapsed.
    async open(path: string) {
      const toggle = scopeToggle(path.slice(0, path.lastIndexOf("/")));
      await expect.element(toggle).toBeVisible();
      if (toggle.element().getAttribute("aria-expanded") === "false")
        await userEvent.click(toggle);
      await userEvent.click(fileName(path));
      return intentFileReading(path);
    },
    async showsFolderExpanded(path: string) {
      await expect
        .element(scopeToggle(path))
        .toHaveAttribute("aria-expanded", "true");
      return browser;
    },
    async showsLocation(path: string) {
      await expect.element(scopeName(path)).toBeVisible();
      return browser;
    },
    async showsNoFolder(path: string) {
      await expect.element(scopeToggle(path)).not.toBeInTheDocument();
      return browser;
    },
    async listsUnselected(path: string) {
      await expect.element(fileName(path)).toBeVisible();
      await expect
        .element(fileName(path))
        .not.toHaveAttribute("aria-pressed", "true");
      return browser;
    },
    async showsNoSource() {
      await expect
        .element(page.getByLabelText(/ source$/).first())
        .not.toBeInTheDocument();
      return browser;
    },
    // Purpose's one read failure says `text`.
    async failsWith(text: string) {
      await expect.element(purpose.getByRole("alert")).toHaveTextContent(text);
      return browser;
    },
    async retryRead() {
      await activateButton(
        purpose.getByRole("alert").getByRole("button", { name: "Retry" }),
      );
      return browser;
    },
    async showsNoReadFailure() {
      await expect.element(purpose.getByRole("alert")).not.toBeInTheDocument();
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
    // The reading pane's current offset, once scrolled from its start.
    async scrolledOffset() {
      await vi.waitUntil(() => readingPane().scrollTop > 0);
      return readingPane().scrollTop;
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
