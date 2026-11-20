// One file of Intent's test browser as the reader reads it in Purpose: its
// source, its selection and focus. Reached through
// ./intent-browser-page.ts.
import { expect } from "vitest";
import { page } from "vitest/browser";

export function intentFileReading(path: string) {
  const file = page.getByRole("button", { name: path, exact: true });
  const source = page.getByLabelText(`${path} source`, { exact: true });
  // Text as read, without the line breaking hints it renders.
  const sourceText = () =>
    (source.query()?.textContent ?? "").replace(/[\u200B\u00AD]/g, "");

  const reading = {
    async shows(text: string) {
      await expect.poll(sourceText).toContain(text);
      return reading;
    },
    async isSelected() {
      await expect.element(file).toHaveAttribute("aria-pressed", "true");
      return reading;
    },
    async isFocused() {
      await expect.element(file).toHaveFocus();
      return reading;
    },
  };
  return reading;
}
