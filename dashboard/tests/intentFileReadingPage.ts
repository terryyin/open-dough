// Purpose and Proof tabs over Intent's reading area
// (../src/IntentFileReading.tsx) and the Side by side layout toggle.

import { expect, type Locator } from "@playwright/test";

// One of the Purpose and Proof tabs over Intent's reading area.
export function readingTab(intent: Locator, name: "Purpose" | "Proof") {
  return intent
    .getByRole("tablist", { name: "Purpose and Proof" })
    .getByRole("tab", { name, exact: true });
}

// Choose Purpose or Proof: that tab is chosen and its region shown, the other
// hidden. Returns the shown region.
export async function chooseReadingTab(
  intent: Locator,
  name: "Purpose" | "Proof",
) {
  const tab = readingTab(intent, name);
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  const region = intent.getByRole("region", { name, exact: true });
  await expect(region).toBeVisible();
  return region;
}

// The tab is chosen and focused, its region shown and the other's gone.
export async function expectReadingTabChosen(
  intent: Locator,
  name: "Purpose" | "Proof",
) {
  const other = name === "Purpose" ? "Proof" : "Purpose";
  await expect(readingTab(intent, name)).toBeFocused();
  await expect(readingTab(intent, name)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(readingTab(intent, other)).toHaveAttribute(
    "aria-selected",
    "false",
  );
  await expect(intent.getByRole("region", { name, exact: true })).toBeVisible();
  await expect(
    intent.getByRole("region", { name: other, exact: true }),
  ).toHaveCount(0);
}

// The Side by side toggle beside the Purpose and Proof tabs.
export function sideBySideToggle(intent: Locator) {
  return intent.getByRole("button", { name: "Side by side", exact: true });
}

// Purpose and Proof, both shown as panels without tabs, named by their
// headings. Returns the two regions.
export async function expectSideBySide(intent: Locator) {
  await expect(sideBySideToggle(intent)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    intent.getByRole("tablist", { name: "Purpose and Proof" }),
  ).toHaveCount(0);
  const regions = {
    purpose: intent.getByRole("region", { name: "Purpose", exact: true }),
    proof: intent.getByRole("region", { name: "Proof", exact: true }),
  };
  for (const [region, name] of [
    [regions.purpose, "Purpose"],
    [regions.proof, "Proof"],
  ] as const) {
    await expect(region).toBeVisible();
    // Shown to the reader, not only named: a visually hidden heading is 1px.
    const heading = region.getByRole("heading", { name, exact: true });
    await expect(heading).toBeVisible();
    expect((await heading.boundingBox())?.height ?? 0).toBeGreaterThan(8);
  }
  return regions;
}
