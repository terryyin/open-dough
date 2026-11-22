// Intent's one polite notice of a newer published revision, as the reader
// reads and operates it (../../src/IntentRevisionNotice.tsx).
import { expect } from "vitest";
import { page } from "vitest/browser";
import { activateButton } from "../page-objects/activateButton.ts";

export function intentRevisionNotice() {
  const notice = page
    .getByRole("status")
    .filter({ hasText: "New revision available" });
  const button = (name: string) =>
    notice.getByRole("button", { name, exact: true });

  const revisionNotice = {
    async isShownOnce() {
      await expect.element(notice).toHaveAttribute("aria-live", "polite");
      expect(notice.elements()).toHaveLength(1);
      return revisionNotice;
    },
    async reads(text: string) {
      await expect
        .poll(() => notice.query()?.textContent ?? "")
        .toContain(text);
      return revisionNotice;
    },
    async offers(controls: readonly string[]) {
      await expect
        .poll(() =>
          notice
            .getByRole("button")
            .elements()
            .map((control) => control.textContent),
        )
        .toEqual(controls);
      return revisionNotice;
    },
    async showLatest() {
      await activateButton(button("Show latest"));
      return revisionNotice;
    },
    async retry() {
      await activateButton(button("Retry"));
      return revisionNotice;
    },
    async isGone() {
      await expect.element(notice).not.toBeInTheDocument();
      return revisionNotice;
    },
  };
  return revisionNotice;
}
