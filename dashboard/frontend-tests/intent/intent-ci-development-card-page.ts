// A story card on Development, by its title, as the CI status cases operate
// it: its heading toggles the story's selection, its session's final report
// opens from the card, and a selected card is highlighted with the inset
// accent ring and pale fill.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";

export function developmentCard(title: string) {
  const card = page.getByRole("article", { name: title, exact: true });
  return {
    toggle: () =>
      userEvent.click(card.getByRole("heading", { name: title, exact: true })),
    async readReport() {
      card
        .getByRole("button", { name: "Read final report", exact: true })
        .element()
        .focus();
      await userEvent.keyboard("{Enter}");
    },
    async isSelected(selected: boolean) {
      await expect
        .poll(() => card.element().classList.contains("story-card-selected"))
        .toBe(selected);
      if (!selected) return;
      const style = getComputedStyle(card.element());
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--accent-soft)";
      card.element().append(probe);
      const accentSoft = getComputedStyle(probe).backgroundColor;
      probe.remove();
      expect(style.boxShadow).toMatch(/inset/);
      expect(style.backgroundColor).toBe(accentSoft);
    },
  };
}
