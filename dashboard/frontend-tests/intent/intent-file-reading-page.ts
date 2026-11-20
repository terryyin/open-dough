// One file of Intent's test browser as the reader reads it in Purpose: its
// source, its selection and its own read failure with Retry. Reached through
// ./intent-browser-page.ts.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";

export function intentFileReading(path: string) {
  const file = page.getByRole("button", { name: path, exact: true });
  const source = page.getByLabelText(`${path} source`, { exact: true });
  const purpose = page.getByRole("region", { name: "Purpose", exact: true });
  const failure = purpose.getByRole("alert");
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
    async fails(explanation: string) {
      await expect.poll(() => failure.query()?.textContent).toBe(explanation);
      return reading;
    },
    async retry() {
      await userEvent.click(purpose.getByRole("button", { name: "Retry" }));
      return reading;
    },
    async failsNoMore() {
      await expect.element(failure).not.toBeInTheDocument();
      return reading;
    },
  };
  return reading;
}
