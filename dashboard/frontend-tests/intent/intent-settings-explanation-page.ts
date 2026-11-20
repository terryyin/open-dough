// The explanation of unusable Intent settings that Intent shows in the
// reading's place (../../src/IntentLocationsUnavailable.tsx).
import { expect } from "vitest";
import { page } from "vitest/browser";

export function intentSettingsExplanation() {
  const alert = page
    .getByRole("alert")
    .filter({ hasText: "Intent locations for" });
  const panel = page.getByRole("tabpanel").filter({ has: alert });

  const explanation = {
    async reads(text: string) {
      await expect.poll(() => alert.query()?.textContent ?? "").toContain(text);
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
