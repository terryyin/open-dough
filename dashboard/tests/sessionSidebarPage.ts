// Where a reader finds the Sessions sidebar and its button, and what its
// entries show.

import { expect, type Locator, type Page } from "@playwright/test";
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

// How a sidebar entry's left border says its session's state: needing input,
// solid thick red; ready for review, solid thick green; failed or stopped,
// dashed red; working, thin blue; done, thin grey; unknown, unlisted, or not
// recognized, dotted grey (the page's own colors, as rgb).
export const sidebarEdges = {
  "needs-input": { style: "solid", width: 5, color: "rgb(155, 28, 28)" },
  ready: { style: "solid", width: 5, color: "rgb(27, 110, 60)" },
  halted: { style: "dashed", width: 3, color: "rgb(155, 28, 28)" },
  working: { style: "solid", width: 2, color: "rgb(27, 95, 168)" },
  done: { style: "solid", width: 2, color: "rgb(111, 111, 104)" },
  unsettled: { style: "dotted", width: 3, color: "rgb(111, 111, 104)" },
} as const;
export type SidebarTone = keyof typeof sidebarEdges;

// The tooltip of a sidebar entry, which holds what the one-line row leaves
// out: the session's state as a card entry words it, the project and
// workflow, the model asked for, and the launch time, one to a line.
export const sidebarTooltipOf = (entry: Locator) => entry.getByRole("button");

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The entry's tooltip has this line, whole.
export async function expectTooltipLine(
  entry: Locator,
  line: string,
): Promise<void> {
  await expect(sidebarTooltipOf(entry)).toHaveAttribute(
    "title",
    new RegExp(`(^|\\n)${escaped(line)}(\\n|$)`),
  );
}

// The row's own text, as seen: what its children show, not the hidden state
// label.
const seenTextOf = (entry: Locator) =>
  entry.evaluate((row) =>
    [...row.children]
      .filter(
        (child) =>
          !child.classList.contains("visually-hidden") &&
          child.tagName !== "BUTTON",
      )
      .map((child) => child.textContent)
      .join("|"),
  );

// The row is one line showing only the title and, at its end, the elapsed
// time since launch.
export async function expectRowShows(
  entry: Locator,
  title: string,
  elapsed: string | RegExp = /^(<1m|\d+[mhd])$/,
): Promise<void> {
  await expect(entry.getByRole("heading", { level: 3 })).toHaveText(title);
  await expect(entry.locator(".sidebar-elapsed")).toHaveText(elapsed);
  const seen = (await seenTextOf(entry)).split("|");
  expect(seen).toHaveLength(2);
  expect(seen[0]).toBe(title);
}

// The entry's state words lead its tooltip, the state's label for assistive
// technology is in its own hidden text, and the left border is its tone's.
export async function expectSidebarSessionShown(
  entry: Locator,
  words: string,
  tone: SidebarTone,
): Promise<void> {
  await expectTooltipLine(entry, words);
  const { style, width, color } = sidebarEdges[tone];
  await expect(entry).toHaveCSS("border-left-style", style);
  await expect(entry).toHaveCSS("border-left-width", `${width}px`);
  await expect(entry).toHaveCSS("border-left-color", color);
  // The label is the words' own label, present for assistive technology and
  // too small to be seen.
  const hidden = entry.locator(".visually-hidden");
  await expect(hidden).toHaveText(words.split(":")[0] ?? "");
  const seen = await hidden.boundingBox();
  expect(seen?.width).toBeLessThanOrEqual(1);
  expect(seen?.height).toBeLessThanOrEqual(1);
}

// One sidebar entry as expected: its story's title, project, workflow, and
// its session's state words and tone.
export type Shown = readonly [
  title: string,
  project: string,
  workflow: string,
  words: string,
  tone: SidebarTone,
];

// The sidebar lists these entries in this order, each launched at or after
// `since`, and no later than now.
export async function expectEntries(
  entries: Locator,
  shown: readonly Shown[],
  since: number,
): Promise<void> {
  await expect(entries).toHaveCount(shown.length);
  const now = Date.now();
  for (const [
    index,
    [title, project, workflow, words, tone],
  ] of shown.entries()) {
    const entry = entries.nth(index);
    await expectRowShows(entry, title);
    await expectTooltipLine(entry, `${project} · ${workflow}`);
    const launchedAt = Date.parse(
      (await entry.locator("time").getAttribute("datetime")) ?? "",
    );
    expect(launchedAt).toBeGreaterThanOrEqual(since);
    expect(launchedAt).toBeLessThanOrEqual(now);
    const launched = await entry
      .locator("time")
      .evaluate((time) =>
        new Date(time.getAttribute("datetime") ?? "").toLocaleString(),
      );
    await expectTooltipLine(entry, `Launched ${launched}`);
    await expectSidebarSessionShown(entry, words, tone);
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
