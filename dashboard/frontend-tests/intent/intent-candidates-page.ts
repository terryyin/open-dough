// Intent's Optimization Candidates record as the reader operates it: the
// view is chosen, the record names the revision it was recorded at, says
// while it is being read, shows no failure, and one recorded entry opens its
// source file in the reading (./intent-file-reading-page.ts).
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { shortRevision } from "../../src/publishedWork.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";

export function intentCandidates() {
  const record = page.getByRole("region", {
    name: "Test Optimization Candidates",
    exact: true,
  });
  const entry = (name: string) => record.getByRole("article", { name });
  const candidates = {
    async isChosen() {
      await expect
        .element(
          page.getByRole("tab", {
            name: "Optimization Candidates",
            exact: true,
          }),
        )
        .toHaveAttribute("aria-selected", "true");
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
    async openSource(name: string, path: string) {
      const source = entry(name).getByRole("button", {
        name: path,
        exact: true,
      });
      await expect.element(source).toBeVisible();
      await userEvent.click(source);
      return intentFileReading(path);
    },
  };
  return candidates;
}
