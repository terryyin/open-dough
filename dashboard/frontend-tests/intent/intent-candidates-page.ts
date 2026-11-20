// Intent's Optimization Candidates record as the reader operates it: one
// recorded entry opens its source file in the reading
// (./intent-file-reading-page.ts).
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { intentFileReading } from "./intent-file-reading-page.ts";

export function intentCandidates() {
  const record = page.getByRole("region", {
    name: "Test Optimization Candidates",
    exact: true,
  });
  const candidates = {
    async openSource(entry: string, path: string) {
      const source = record
        .getByRole("article", { name: entry })
        .getByRole("button", { name: path, exact: true });
      await expect.element(source).toBeVisible();
      await userEvent.click(source);
      return intentFileReading(path);
    },
  };
  return candidates;
}
