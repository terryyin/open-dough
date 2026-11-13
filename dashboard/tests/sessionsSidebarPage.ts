// Where a reader finds the Sessions sidebar and its button, whether it is
// open, which entry is current, and what its entries show. Where it lies
// beside the page is ./sessionsSidebarLayout.ts.

import { expect, type Locator, type Page } from "@playwright/test";

export function sessionsSidebarParts(page: Page) {
  const sidebar = page.getByRole("complementary", {
    name: "Sessions sidebar",
    exact: true,
  });
  const banner = page.getByRole("banner");
  // The open session list, which scrolls on its own.
  const list = sidebar.locator(".sessions-sidebar-sessions");
  const entries = list.locator("li.sessions-sidebar-session-entry");
  return {
    sidebar,
    button: banner.getByRole("button", { name: "Sessions" }),
    // The sidebar's own title.
    heading: sidebar.getByRole("heading", { level: 2, name: "Sessions" }),
    list,
    // How many sessions need attention, as the number on the button's badge,
    // when any do.
    badge: banner.getByRole("img", {
      name: /^\d+ sessions? needs? attention$/,
    }),
    // How many sessions are working, on the closed toggle's badge only.
    workingBadge: banner.getByRole("img", {
      name: /^\d+ sessions? working$/,
    }),
    // The one badge holding working and/or attention counts on the toggle.
    countsBadge: banner.locator(".sessions-toggle-counts"),
    // The open session list's entries, apart from optional section rows.
    entries,
    // Their story titles, in the order the list shows them.
    titles: entries.getByRole("heading", { level: 3 }),
    // The open-list entry, as a whole row, for the story with exactly this
    // title.
    row: (title: string) =>
      entries.filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      }),
    // The open-list control of the entry for the story with this title.
    entry: (title: string) => list.getByRole("button", { name: title }),
    // The card's attention sentence, which the sidebar never shows.
    attentionSentence: sidebar.getByText(/\d+ sessions? needs? attention/),
  };
}

// A row's unread-report mark, named by its words, such as "Unread report:
// Completed with attention"; given none, any unread report's mark.
export const unreadSessionReport = (row: Locator, words?: string) =>
  row.getByRole("img", { name: words ?? /^Unread report/, exact: true });

// Opens the Sessions sidebar unless it is already open. The button's state
// waits for the page to render, which a reload's kept open sidebar may not
// have done yet.
export async function openSessionsSidebar(page: Page): Promise<void> {
  const { button } = sessionsSidebarParts(page);
  if ((await button.getAttribute("aria-expanded")) !== "true")
    await button.click();
}

// The sidebar is shown or not, and its banner toggle says the same. While a
// side panel covers the page, its banner and toggle are hidden from reading,
// so there a caller reads the sidebar alone instead.
export async function expectSessionsSidebar(
  page: Page,
  expected: "open" | "closed",
): Promise<void> {
  const { sidebar, button } = sessionsSidebarParts(page);
  await (expected === "open"
    ? expect(sidebar).toBeVisible()
    : expect(sidebar).toBeHidden());
  await expect(button).toHaveAttribute(
    "aria-expanded",
    String(expected === "open"),
  );
}

// The entry for the story with this title is the sidebar's one current entry,
// the one whose session the side panel shows; with no title, none is.
export async function expectCurrentEntry(
  page: Page,
  title?: string,
): Promise<void> {
  const { sidebar, entry } = sessionsSidebarParts(page);
  const current = sidebar.locator("[aria-current]");
  if (title === undefined) {
    await expect(current).toHaveCount(0);
    return;
  }
  await expect(entry(title)).toHaveAttribute("aria-current", "true");
  await expect(current).toHaveCount(1);
}

// How long ago an entry's session was launched, or for a Done entry completed,
// at the row's end.
export const sessionsSidebarElapsedOf = (entry: Locator) =>
  entry.locator(".sessions-sidebar-session-entry-elapsed");

// An entry's Session details, the coarse-input disclosure, and the facts it
// shows once open.
export function sessionsSidebarDetailsOf(entry: Locator) {
  const details = entry.locator(".sessions-sidebar-session-entry-details");
  return {
    details,
    disclosure: details.locator("summary", { hasText: "Session details" }),
    facts: details.locator(".sessions-sidebar-session-entry-facts"),
  };
}

// Entry titles, cut with an ellipsis by design, for layout checks that
// otherwise expect whole text.
export const sessionsSidebarTitleCut = ".sessions-sidebar-session-entry-title";

// How a Sessions sidebar Session entry's left border says its session's state: needing input,
// solid thick red; ready for review, solid thick green; failed or stopped,
// dashed red; working, thin blue; done, thin grey; unknown, unlisted, or not
// recognized, dotted grey (the page's own colors, as rgb).
export const sessionsSidebarSessionEntryEdges = {
  "needs-input": { style: "solid", width: 5, color: "rgb(155, 28, 28)" },
  ready: { style: "solid", width: 5, color: "rgb(27, 110, 60)" },
  halted: { style: "dashed", width: 3, color: "rgb(155, 28, 28)" },
  working: { style: "solid", width: 2, color: "rgb(27, 95, 168)" },
  done: { style: "solid", width: 2, color: "rgb(111, 111, 104)" },
  unsettled: { style: "dotted", width: 3, color: "rgb(111, 111, 104)" },
} as const;
export type SessionsSidebarSessionEntryTone =
  keyof typeof sessionsSidebarSessionEntryEdges;

// The tooltip of a Sessions sidebar Session entry, which holds what the one-line row leaves
// out: the session's state as a card entry words it, the project and
// workflow, the model asked for, and the launch time, one to a line.
export const sessionsSidebarSessionEntryTooltipOf = (entry: Locator) =>
  entry.locator("button.sessions-sidebar-session-entry-open");

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// The entry's tooltip has this line, whole.
export async function expectTooltipLine(
  entry: Locator,
  line: string,
): Promise<void> {
  await expect(sessionsSidebarSessionEntryTooltipOf(entry)).toHaveAttribute(
    "title",
    new RegExp(`(^|\\n)${escaped(line)}(\\n|$)`),
  );
}

// The row's own text, as seen: what its children show, not the hidden state
// label or an icon control's tooltip before it is shown.
const seenTextOf = (entry: Locator) =>
  entry.evaluate((row) =>
    [...row.children]
      .filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          !child.classList.contains("visually-hidden") &&
          child.tagName !== "BUTTON" &&
          child.getBoundingClientRect().height > 0,
      )
      .map((child) => child.innerText)
      .filter((text) => text !== "")
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
  await expect(sessionsSidebarElapsedOf(entry)).toHaveText(elapsed);
  const seen = (await seenTextOf(entry)).split("|");
  expect(seen).toHaveLength(2);
  expect(seen[0]).toBe(title);
}

// The entry's state words lead its tooltip, the state's label for assistive
// technology is in its own hidden text, and the left border is its tone's.
export async function expectSessionsSidebarSessionEntryShown(
  entry: Locator,
  words: string,
  tone: SessionsSidebarSessionEntryTone,
): Promise<void> {
  await expectTooltipLine(entry, words);
  const { style, width, color } = sessionsSidebarSessionEntryEdges[tone];
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

// One Sessions sidebar Session entry as expected: its story's title, project, workflow, and
// its session's state words and tone.
export type Shown = readonly [
  title: string,
  project: string,
  workflow: string,
  words: string,
  tone: SessionsSidebarSessionEntryTone,
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
    await expectSessionsSidebarSessionEntryShown(entry, words, tone);
  }
}
