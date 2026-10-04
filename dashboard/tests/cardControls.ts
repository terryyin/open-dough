// What a card offers: its launch actions in its launch group, and in its
// inspection group Inspect story, which opens its detail from the snapshot
// already read and is named Hide detail while that detail is open. One story's
// detail is open at a time.

import { expect, type Locator } from "@playwright/test";
import { expectReadableContrast } from "./accessibleReading.ts";

// The launch actions every Backlog card offers, in the order it offers them.
export const cardLaunchActions = ["Start execution", "Start refinement"];

// Disabled launch actions remain visible but are outside the keyboard order.
export async function enabledCardLaunchActions(card: Locator) {
  const enabled: Locator[] = [];
  for (const name of cardLaunchActions) {
    const action = card.getByRole("button", { name });
    if (await action.isEnabled()) enabled.push(action);
  }
  return enabled;
}

// A card's Inspect story, by either name it holds.
export const detailToggle = /^(?:Inspect story|Hide detail)$/;

// A card's detail, opened unless it is already open.
export async function inspectedDetail(card: Locator): Promise<Locator> {
  const toggle = card.getByRole("button", { name: detailToggle });
  await expect(toggle).toBeVisible();
  if ((await toggle.textContent()) === "Inspect story") await toggle.click();
  const detail = card.getByRole("region", { name: /^Detail for / });
  await expect(detail).toBeVisible();
  return detail;
}

// A card's launch group (its Starts) and its inspection group (Inspect story,
// and Review changes when offered).
export const launchGroup = (card: Locator) =>
  card.getByRole("group", { name: "Launch actions" });
export const inspectionGroup = (card: Locator) =>
  card.getByRole("group", { name: "Inspection actions" });

// A Start's note: part of the Start's accessible description; the card shows
// it only in the Start's tooltip (./agent-launch-card-noted-start.spec.ts).
export async function expectStartNote(
  card: Locator,
  name: string,
  note: string,
) {
  await expect(
    launchGroup(card).getByRole("button", { name }),
  ).toHaveAccessibleDescription(new RegExp(note));
}

// A card action's decorative Lucide glyph (`lucide-<glyph>`) at its start or
// end, with nothing, not even text, beyond it; hidden from assistive
// technology so the action keeps its name, and, while the action can act,
// standing out 3:1 from what is behind it.
export async function expectActionGlyph(
  action: Locator,
  name: string,
  glyph: string,
  at: "leading" | "trailing" = "leading",
) {
  await expect(action).toHaveAccessibleName(name);
  const icon = action.locator(`svg.lucide-${glyph}`);
  await expect(icon).toHaveAttribute("aria-hidden", "true");
  const placed = await icon.evaluate((svg, end) => {
    const parent = svg.parentNode;
    return svg === (end ? parent?.lastChild : parent?.firstChild);
  }, at === "trailing");
  expect(placed, `${name} ${at} ${glyph}`).toBe(true);
  if (await action.isEnabled()) await expectReadableContrast(icon, 3);
}

// Inspect story's chevron: decorative, pointing right while the detail is
// closed and turned down while it is open, as `aria-expanded` says.
export async function expectChevronTurns(card: Locator) {
  const toggle = card.getByRole("button", { name: detailToggle });
  const turn = () =>
    toggle.locator("svg").evaluate((svg) => getComputedStyle(svg).transform);
  await expectActionGlyph(toggle, "Inspect story", "chevron-right");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await turn()).toBe("none");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expectActionGlyph(toggle, "Hide detail", "chevron-right");
  // rotate(90deg): cosine 0, sine 1.
  expect(await turn()).toMatch(/^matrix\((?:-?0|[\d.]+e-\d+), 1, -1, /);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(await turn()).toBe("none");
}
