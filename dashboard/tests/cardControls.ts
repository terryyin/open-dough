// What a card offers: its launch actions in its launch group, and in its
// inspection group Inspect story, which opens its detail from the snapshot
// already read and is named Hide detail while that detail is open. One story's
// detail is open at a time.

import { expect, type Locator } from "@playwright/test";

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

// The detail open in these stages, or else the first card's, opened without
// moving focus and left open.
export async function someInspectedDetail(stages: Locator): Promise<Locator> {
  const detail = stages.getByRole("region", { name: /^Detail for / });
  if ((await detail.count()) === 0) {
    await stages
      .getByRole("button", { name: "Inspect story" })
      .first()
      .dispatchEvent("click");
  }
  return detail;
}

// A card's launch group (its Starts) and its inspection group (Inspect story,
// and Review changes when offered).
export const launchGroup = (card: Locator) =>
  card.getByRole("group", { name: "Launch actions" });
export const inspectionGroup = (card: Locator) =>
  card.getByRole("group", { name: "Inspection actions" });
