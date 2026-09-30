// Where a reader finds the Sessions sidebar and its button, and what its
// entries show.

import { expect, type Locator, type Page } from "@playwright/test";
import { expectSessionShown } from "./sessionStatePace.ts";
import { parts } from "./dashboardPage.ts";
import { box, expectStackedInOrder } from "./pageLayout.ts";

export function sidebarParts(page: Page) {
  const sidebar = page.getByRole("complementary", { name: "Sessions" });
  return {
    sidebar,
    button: page.getByRole("banner").getByRole("button", { name: "Sessions" }),
    // How many sessions need attention, as the number on the button's badge,
    // when any do.
    badge: page.getByRole("banner").getByRole("img", {
      name: /^\d+ sessions? needs? attention$/,
    }),
    entries: sidebar.getByRole("listitem"),
    // The control of the entry for the story with this title.
    entry: (title: string) => sidebar.getByRole("button", { name: title }),
    // The card's attention sentence, which the sidebar never shows.
    attentionSentence: sidebar.getByText(/\d+ sessions? needs? attention/),
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

// The stages lay out as on a narrow window, for a page column that narrow
// whatever the window's width: Backlog above Taken, each as wide as the
// stages, and each card as wide as its stage inside its padding.
export async function expectStagesStacked(page: Page): Promise<void> {
  const { stages, backlog, taken } = parts(page);
  await expectStackedInOrder([backlog, taken]);
  const whole = await box(stages);
  const stage = await box(backlog);
  expect(stage.width).toBeGreaterThanOrEqual(whole.width - 1);
  const card = await box(backlog.getByRole("article").first());
  // The stage's side padding (1rem each) and border.
  expect(card.width).toBeGreaterThanOrEqual(stage.width - 2 * 16 - 2 - 1);
}
