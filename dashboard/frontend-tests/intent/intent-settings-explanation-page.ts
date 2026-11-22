// The explanation of unusable or absent Intent locations that Intent shows in
// the reading's place (../../src/IntentLocationsUnavailable.tsx).
import { expect } from "vitest";
import { page } from "vitest/browser";

export function intentSettingsExplanation() {
  const alert = page
    .getByRole("alert")
    .filter({ hasText: "Intent locations for" });
  const retryButton = alert.getByRole("button", { name: "Retry", exact: true });
  const panel = page.getByRole("tabpanel").filter({ has: alert });
  const readingPanel = page.getByRole("tabpanel");

  const explanation = {
    async reads(text: string) {
      await expect.poll(() => alert.query()?.textContent ?? "").toContain(text);
      return explanation;
    },
    async says(text: string) {
      await expect
        .poll(() =>
          (alert.query()?.textContent ?? "").replace(/\s+/g, " ").trim(),
        )
        .toBe(text);
      return explanation;
    },
    async offersRetry() {
      await expect.element(retryButton).toBeVisible();
      return explanation;
    },
    async retry() {
      await retryButton.click();
      return explanation;
    },
    async panelReads(text: string) {
      await expect
        .poll(() => readingPanel.query()?.textContent ?? "")
        .toContain(text);
      return explanation;
    },
    async panelExcludes(text: string) {
      await expect
        .poll(() => readingPanel.query()?.textContent ?? "")
        .not.toContain(text);
      return explanation;
    },
    async hasFocus() {
      await expect.element(panel).toHaveFocus();
      return explanation;
    },
    async isAbsent() {
      await expect.element(alert).not.toBeInTheDocument();
      return explanation;
    },
  };
  return explanation;
}
