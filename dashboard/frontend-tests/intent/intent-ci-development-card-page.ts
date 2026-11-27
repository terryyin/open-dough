// A story card on Development, by its title, as the CI status cases operate
// it: its heading toggles the story's selection, once the Board pages to the
// card's column when the viewport shows fewer columns; its session's final
// report opens from the card, and a selected card is highlighted with the
// inset accent ring and pale fill.
import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { boardReading, columns } from "../navigation/board-reading-page.ts";
import { activateButton } from "../page-objects/activateButton.ts";

// Pages the Board to the column holding `card` when the card is outside the
// viewport, until the paging brings it in.
async function showColumnOf(card: Element) {
  const shown = () => {
    const { left, right } = card.getBoundingClientRect();
    return left >= 0 && right <= window.innerWidth;
  };
  if (shown()) return;
  const name = columns.find((column) =>
    boardReading.column(column).element().contains(card),
  );
  if (name === undefined) return;
  await activateButton(boardReading.control(name));
  await expect.poll(shown).toBe(true);
}

export function developmentCard(title: string) {
  const card = page.getByRole("article", { name: title, exact: true });
  return {
    async toggle() {
      await expect.element(card).toBeInTheDocument();
      await showColumnOf(card.element());
      // The card tells its empty area from its controls by the pointer's
      // position, so the heading takes a real click.
      await userEvent.click(
        card.getByRole("heading", { name: title, exact: true }),
      );
    },
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
