// What a Taken card shows beside its recorded agent's name.

import type { Locator } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

// The approved portrait beside a card's recorded agent name: the tile of its
// atlas that the fixed agent rotation assigns to that name (six to an atlas,
// three columns by two rows, each tile's center square shown).
export async function expectPortrait(
  card: Locator,
  agent: string,
  { atlas, position }: { atlas: number; position: string },
) {
  const group = card.locator(".owner-agent");
  await expect(group).toHaveText(agent);
  const portrait = group.locator(".agent-portrait");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute("aria-hidden", "true");
  await expect(portrait).toHaveCSS(
    "background-image",
    new RegExp(`/agent-avatars/atlas-${atlas}\\.webp"\\)$`),
  );
  await expect(portrait).toHaveCSS("background-position", position);
  const image = await portrait.evaluate(
    (element) =>
      /url\("(.*)"\)/.exec(getComputedStyle(element).backgroundImage)?.[1],
  );
  const served = await card.page().request.get(image ?? "");
  expect(served.ok()).toBe(true);
  expect(served.headers()["content-type"]).toContain("image/webp");
  // Beside the name: the portrait ends where the name begins, on its line.
  const portraitBox = await portrait.boundingBox();
  const groupBox = await group.boundingBox();
  expect(portraitBox).not.toBeNull();
  expect(groupBox).not.toBeNull();
  if (portraitBox === null || groupBox === null) return;
  expect(portraitBox.x).toBeCloseTo(groupBox.x, 0);
  expect(portraitBox.width).toBeLessThan(groupBox.width);
}
