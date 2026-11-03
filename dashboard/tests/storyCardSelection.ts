// Shared assertions for a story card's two separate states: the selected
// story's highlight (the class, its inset accent ring and pale fill, and the
// card's pressed Select story), and inspection (its open detail and Inspect
// story's expanded state).

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { detailToggle } from "./storyCardControls.ts";

export const selectStory = (card: Locator) =>
  card.getByRole("button", { name: "Select story", exact: true });

export const storyDetail = (card: Locator) =>
  card.getByRole("region", { name: /^Detail for / });

export async function expectSelected(card: Locator, on: boolean) {
  if (on) {
    await expect(card).toHaveClass(/story-card-selected/);
    const { boxShadow, background, accentSoft } = await card.evaluate(
      (element) => {
        const style = getComputedStyle(element);
        const probe = document.createElement("span");
        probe.style.backgroundColor = "var(--accent-soft)";
        element.append(probe);
        const accentSoft = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return {
          boxShadow: style.boxShadow,
          background: style.backgroundColor,
          accentSoft,
        };
      },
    );
    expect(boxShadow).toMatch(/inset/);
    expect(background).toBe(accentSoft);
  } else {
    await expect(card).not.toHaveClass(/story-card-selected/);
  }
  await expect(selectStory(card)).toHaveAttribute("aria-pressed", String(on));
}

export async function expectInspected(card: Locator, open: boolean) {
  await expect(
    card.getByRole("button", { name: detailToggle }),
  ).toHaveAttribute("aria-expanded", String(open));
  await expect(storyDetail(card)).toHaveCount(open ? 1 : 0);
}
