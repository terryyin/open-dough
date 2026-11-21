// The Review changes panel's details as a reader meets them
// (./story-review-panel-page.ts): the toolbar's eye beside the comparison's
// name, the section it reveals and hides, the comparison switch and landed run
// picker that section holds, and the facts of the comparison shown.
import { expect } from "vitest";
import { userEvent, type Locator } from "vitest/browser";

export const box = (element: Element | null | undefined) => {
  if (!element) throw new Error("Not laid out.");
  return element.getBoundingClientRect();
};

// The comparison's name the toolbar shows, if any.
export const comparisonNameIn = (toolbar: Locator) =>
  toolbar.element().querySelector(".story-review-toolbar-name");

export function reviewDetails(region: Locator, toolbar: Locator) {
  const eye = toolbar.getByRole("button", {
    name: /^(Show|Hide) review details$/,
  });
  const section = region.getByRole("group", { name: "Review details" });
  const picker = region.getByRole("listbox", { name: "Landed run" });
  const shownTimes = () =>
    [...region.element().querySelectorAll("time")].filter((time) =>
      time.checkVisibility(),
    );

  const details = {
    // The eye, an icon right after the comparison's name on its row, whose
    // tooltip says its name, offers the details.
    async expectEyeBesideComparison() {
      await expect.element(eye).toHaveAccessibleName("Show review details");
      await expect.element(eye).toHaveTextContent("");
      expect(eye.element().querySelector("svg")).not.toBeNull();
      const [nameAt, eyeAt] = [
        box(comparisonNameIn(toolbar)),
        box(eye.element()),
      ];
      const gap = eyeAt.x - (nameAt.x + nameAt.width);
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThan(24);
      expect(
        Math.abs(eyeAt.y + eyeAt.height / 2 - nameAt.y - nameAt.height / 2),
      ).toBeLessThan(eyeAt.height / 2);
      await userEvent.hover(eye);
      await expect
        .element(toolbar.getByText("Show review details", { exact: true }))
        .toBeVisible();
      return details;
    },

    // The details wait behind the eye, which says so.
    async expectDetailsCollapsed() {
      await expect.element(eye).toHaveAccessibleName("Show review details");
      await expect.element(eye).toHaveAttribute("aria-expanded", "false");
      const controlled = eye.element().getAttribute("aria-controls");
      const hidden =
        controlled === null ? null : document.getElementById(controlled);
      expect(hidden).not.toBeNull();
      expect(hidden?.checkVisibility()).toBe(false);
      expect(region.getByRole("radio").query()).toBeNull();
      expect(region.getByRole("listbox").query()).toBeNull();
      return details;
    },

    // The eye reveals the details in their section, and says so.
    async revealDetails() {
      await toolbar
        .getByRole("button", { name: "Show review details", exact: true })
        .click();
      return details.expectDetailsRevealed();
    },

    async expectDetailsRevealed() {
      await expect.element(eye).toHaveAccessibleName("Hide review details");
      await expect.element(eye).toHaveAttribute("aria-expanded", "true");
      await expect.element(section).toBeVisible();
      return details;
    },

    // No eye and no details section: the details hold nothing to reveal.
    async expectNoDetails() {
      await expect.element(toolbar).toBeVisible();
      expect(eye.query()).toBeNull();
      expect(section.query()).toBeNull();
      return details;
    },

    async expectComparisonChosen(name: string) {
      await expect
        .element(section.getByRole("radio", { name, exact: true }))
        .toBeChecked();
      return details;
    },

    async expectLandedRunChosen(key: string) {
      await expect.element(picker).toHaveValue(key);
      return details;
    },

    async chooseLandedRun(key: string) {
      await picker.selectOptions(key);
      return details;
    },

    // Escape from the picker hides the details and returns focus to the eye.
    async escapeFromLandedRuns() {
      (picker.element() as HTMLElement).focus();
      await expect.element(picker).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect.element(eye).toHaveAttribute("aria-expanded", "false");
      const controlled = eye.element().getAttribute("aria-controls") ?? "";
      expect(document.getElementById(controlled)?.checkVisibility()).toBe(
        false,
      );
      await expect.element(eye).toHaveFocus();
      return details;
    },

    async expectDetailsSay(text: string) {
      await expect.poll(() => section.element().textContent).toContain(text);
      return details;
    },

    async expectDetailsHeading(name: string) {
      await expect
        .element(section.getByRole("heading", { name, exact: true }))
        .toBeVisible();
      return details;
    },

    // The time the revealed details name, as its machine-readable datetime.
    async expectDetailsTime(datetime: string) {
      await expect
        .poll(() =>
          section.element().querySelector("time")?.getAttribute("datetime"),
        )
        .toBe(datetime);
      return details;
    },

    // No time is shown anywhere in the review, as while details are hidden.
    async expectNoTimeShown() {
      await expect.element(toolbar).toBeVisible();
      expect(shownTimes()).toEqual([]);
      return details;
    },

    // No code naming `text` is shown, as a revision the hidden details hold.
    async expectNoCodeShown(text: string) {
      await expect.element(toolbar).toBeVisible();
      const shown = [...region.element().querySelectorAll("code")].filter(
        (code) => code.checkVisibility() && code.textContent.includes(text),
      );
      expect(shown).toEqual([]);
      return details;
    },
  };
  return details;
}
