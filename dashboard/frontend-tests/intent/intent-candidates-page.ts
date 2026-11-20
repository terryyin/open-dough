// Intent's Optimization Candidates record as the reader operates it: the
// reader chooses its view or leaves it for CI status, the record names the revision it was recorded
// at, says while it is being read, shows no failure, and one recorded entry
// links and opens its source files in the reading (./intent-file-reading-page.ts).
import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { shortRevision } from "../../src/publishedWork.ts";
import {
  intentFileReading,
  withoutBreakingHints,
} from "./intent-file-reading-page.ts";

// Project Intent's views and the tab of one of them.
export const intentViews = page.getByRole("tablist", {
  name: "Project Intent views",
});
export const intentViewTab = (name: "CI status" | "Optimization Candidates") =>
  intentViews.getByRole("tab", { name, exact: true });

export function intentCandidates() {
  const record = page.getByRole("region", {
    name: "Test Optimization Candidates",
    exact: true,
  });
  const tab = intentViewTab("Optimization Candidates");
  const entry = (name: string) => record.getByRole("article", { name });
  const sourceLink = (name: string, path: string) =>
    entry(name).getByRole("button", { name: path, exact: true });
  const candidates = {
    record,
    entry,
    sourceLink,
    async choose() {
      await userEvent.click(tab);
      return candidates.isChosen();
    },
    async leaveForCiStatus() {
      const ciStatus = intentViewTab("CI status");
      await userEvent.click(ciStatus);
      await expect.element(ciStatus).toHaveAttribute("aria-selected", "true");
    },
    async isChosen() {
      await expect.element(tab).toHaveAttribute("aria-selected", "true");
      return candidates;
    },
    async isRecordedAt(revision: string) {
      await expect
        .poll(() => record.query()?.textContent ?? "")
        .toContain(
          `Recorded at revision ${shortRevision(revision)} (${revision}).`,
        );
      return candidates;
    },
    async isReading() {
      await expect
        .element(
          record.getByText("Reading Test Optimization Candidates…", {
            exact: true,
          }),
        )
        .toBeVisible();
      return candidates;
    },
    async showsNoFailure() {
      await expect.element(record.getByRole("alert")).not.toBeInTheDocument();
      return candidates;
    },
    async shows(name: string) {
      await expect.element(entry(name)).toBeVisible();
      return candidates;
    },
    async lacks(name: string) {
      await expect.element(entry(name)).not.toBeInTheDocument();
      return candidates;
    },
    // Opens the source `name` links as `link`, reading the file at `path`.
    async openSource(name: string, link: string, path = link) {
      const source = sourceLink(name, link);
      await expect.element(source).toBeVisible();
      await userEvent.click(source);
      return intentFileReading(path);
    },
  };
  return candidates;
}

// Text as read: without the line breaking hints the record renders, and
// with its whitespace collapsed.
export const textAsRead = (locator: Locator) =>
  withoutBreakingHints(locator.query()?.textContent).replace(/\s+/g, " ");

// Each matched element's text, in reading order.
export const textsOf = (locator: Locator) =>
  locator.elements().map((element) => element.textContent);
