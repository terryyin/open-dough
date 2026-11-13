// A story reference: a consumer card's Dependencies disclosure lists each
// supplier by its title (or identity while unavailable), and following one moves the reader to that
// story's card. While a destination is still being read, the Board's one
// Story reference navigation notice says why, and a Recently done destination
// waits in place under its identity. What the reader does next, and when the
// held answer arrives, stays the scenario's.

import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";

// A card's Dependencies disclosure and its summary, the control that opens it.
export const dependencyDisclosure = (card: Locator) =>
  card.locator(".story-dependencies");
export const dependencySummary = (card: Locator) =>
  dependencyDisclosure(card).locator("summary");

// Opens the card's Dependencies disclosure by pointer, or by touch with "tap".
export async function openDependencies(
  card: Locator,
  using: "click" | "tap" = "click",
) {
  await dependencySummary(card)[using]();
  await expect(dependencyDisclosure(card)).toHaveAttribute("open", "");
}

// The list in the card's Dependencies disclosure, one entry per supplier.
export const dependencyList = (card: Locator) =>
  card.getByRole("list", { name: "Story dependencies" });

// The card's reference to a supplier, by the supplier's displayed title or fallback identity.
export const storyReference = (card: Locator, title: string) =>
  dependencyList(card).getByRole("link", { name: title, exact: true });

// Follows the card's reference labelled `title` by pointer, touch, or from the
// keyboard (focused, then Enter), in its open Dependencies disclosure.
export async function followReference(
  card: Locator,
  title: string,
  using: "click" | "tap" | "keyboard" = "click",
) {
  const reference = storyReference(card, title);
  if (using === "keyboard") await reference.press("Enter");
  else await reference[using]();
}

// The Board's one announcement about following a story reference, empty
// unless a destination is being read, missing or unreadable.
export const referenceNotice = (page: Page) =>
  page.getByRole("status", { name: "Story reference navigation" });

// Retry story reference, on the notice of a destination not yet reached.
export const retryReference = (page: Page) =>
  referenceNotice(page)
    .getByRole("button", { name: "Retry story reference" })
    .click();

// A Recently done destination by its story identity, whether it is still being
// read, could not be read, or shows the done story.
export const doneDestination = (recent: Locator, identity: string) =>
  recent.locator(`[data-done-story="${identity}"]`);
