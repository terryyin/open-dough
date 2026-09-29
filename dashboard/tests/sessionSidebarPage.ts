// Where a reader finds the Sessions sidebar and its button, and what its
// entries show.

import { expect, type Locator, type Page } from "@playwright/test";
import { expectSessionShown } from "./sessionStatePace.ts";

export function sidebarParts(page: Page) {
  const sidebar = page.getByRole("complementary", { name: "Sessions" });
  return {
    sidebar,
    button: page.getByRole("banner").getByRole("button", { name: /^Sessions/ }),
    entries: sidebar.getByRole("listitem"),
    // How many sessions need attention, as the heading says, when any do.
    attention: sidebar.getByText(/^\d+ sessions? needs? attention$/),
  };
}

// One sidebar entry as expected: its story's title, project, workflow, and
// its session's state words and whether it needs attention.
export type Shown = readonly [
  title: string,
  project: string,
  workflow: string,
  words: string,
  needsAttention: boolean,
];

// The sidebar lists these entries in this order, each launched at or after
// `since`, and no later than the one above it.
export async function expectEntries(
  entries: Locator,
  shown: readonly Shown[],
  since: number,
): Promise<void> {
  await expect(entries).toHaveCount(shown.length);
  let above = Date.now();
  for (const [
    index,
    [title, project, workflow, words, needed],
  ] of shown.entries()) {
    const entry = entries.nth(index);
    await expect(entry.getByRole("heading", { level: 3 })).toHaveText(title);
    await expect(entry).toContainText(`${project} · ${workflow}`);
    await expect(entry).toContainText("Launched");
    const launchedAt = Date.parse(
      (await entry.locator("time").getAttribute("datetime")) ?? "",
    );
    expect(launchedAt).toBeGreaterThanOrEqual(since);
    expect(launchedAt).toBeLessThanOrEqual(above);
    above = launchedAt;
    await expectSessionShown(entry, words, needed);
  }
}
