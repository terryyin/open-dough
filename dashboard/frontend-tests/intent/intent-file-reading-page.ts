// One file of Intent's test browser as the reader reads it in Purpose: its
// source, its selection and focus. Reached through
// ./intent-browser-page.ts.
import { expect } from "vitest";
import { page } from "vitest/browser";
import { shortRevision } from "../../src/publishedWork.ts";

// Text as read, without the line breaking hints the reading renders.
export const withoutBreakingHints = (text: string | null | undefined) =>
  (text ?? "").replace(/[\u200B\u00AD]/g, "");

export function intentFileReading(path: string) {
  const file = page.getByRole("button", { name: path, exact: true });
  const source = page.getByLabelText(`${path} source`, { exact: true });
  const sourceText = () => withoutBreakingHints(source.query()?.textContent);

  const reading = {
    async shows(text: string) {
      await expect.poll(sourceText).toContain(text);
      return reading;
    },
    async isSelected() {
      await expect.element(file).toHaveAttribute("aria-pressed", "true");
      return reading;
    },
    // The source's line `line` is its current location, in view.
    async targets(line: number) {
      const targets = () =>
        source
          .element()
          .querySelectorAll<HTMLElement>(".source-line.is-target");
      await expect.poll(() => targets().length).toBe(1);
      const [target] = targets();
      if (target === undefined) throw new Error(`${path} targets no line`);
      const located = page.elementLocator(target);
      await expect.element(located).toHaveAttribute("data-line", String(line));
      await expect.element(located).toHaveAttribute("aria-current", "location");
      await expect.element(located).toBeInViewport();
      return reading;
    },
    // The source's own revision label.
    async isAt(revision: string) {
      await expect
        .poll(
          () =>
            source.element().parentElement?.querySelector(".intent-source-meta")
              ?.textContent,
        )
        .toBe(`${path} at revision ${shortRevision(revision)}`);
      return reading;
    },
    // The reader's focus rests in the source, its scroll left where it is.
    async focusSource() {
      (source.element() as HTMLElement).focus({ preventScroll: true });
      await expect.element(source).toHaveFocus();
      return reading;
    },
    async isFocused() {
      await expect.element(file).toHaveFocus();
      return reading;
    },
  };
  return reading;
}
