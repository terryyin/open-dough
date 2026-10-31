// Where a reader finds each part of the dashboard page, by the role and name
// the page gives it. Every journey looks the parts up here, so a part is named
// in one place.

import type { Locator, Page } from "@playwright/test";

export function parts(page: Page) {
  const board = page.getByRole("region", { name: "Board" });
  const status = page.getByRole("status").and(page.locator(".read-status"));
  const direction = page.getByRole("region", { name: "Near-future direction" });
  const banner = page.getByRole("banner");
  return {
    banner,
    // The selected project's plain level-1 name in the banner (wider columns).
    projectTitle: banner.getByRole("heading", { level: 1 }),
    // Compact title control where the tab list no longer fits the banner.
    projectCompact: banner.getByRole("button", { name: "Project" }),
    projectCompactList: banner.getByRole("listbox", { name: "Project" }),
    project: page.getByRole("radiogroup", { name: "Project" }),
    // The banner's Development and Intent choices of the selected project.
    perspective: page.getByRole("radiogroup", { name: "Perspective" }),
    development: page.getByRole("radio", { name: "Development", exact: true }),
    intentChoice: page.getByRole("radio", { name: "Intent", exact: true }),
    // The Intent perspective's content, in place of Development's.
    intent: page.getByRole("main", { name: "Intent", exact: true }),
    board,
    backlog: board.getByRole("region", { name: "Backlog", exact: true }),
    taken: board.getByRole("region", { name: "Taken", exact: true }),
    direction,
    directionToggle: page.locator(".direction summary"),
    // The direction's text, shown only while the direction is open.
    directionText: direction.locator("p"),
    // The row holding the direction, Start session, and the help.
    projectActions: page.locator(".project-actions"),
    preparationHelp: page.getByRole("button", {
      name: "Preparation badge legend",
    }),
    // The selected project's sessions launched from this dashboard.
    recentlyDone: page.getByRole("region", {
      name: "Recently done",
      exact: true,
    }),
    problem: page.getByRole("alert"),
    // The read status is always on the page, so that a change of its text is
    // spoken; it says what the latest read is doing or what it read.
    status,
    // After a successful read, the status announces the short revision (first
    // 7 characters). Use `problem` after failures instead; while a read is
    // held or only a standing rate limit is shown, the status names no
    // revision.
    readRevision: status,
    // Retrieval <time> the status announces with that successful read.
    retrievedAt: status.locator("time"),
    // That status only while it says a read is under way.
    reading: status.filter({ hasText: "Reading published work" }),
    notice: page.locator("[aria-live='polite']"),
    // What Start session announces once its ad hoc session has started, in a
    // log: an implicitly polite live region that is neither the read status
    // nor the published-read notice.
    adHocStarted: page
      .getByRole("log")
      .filter({ hasText: "Ad hoc session started" }),
  };
}

// Short revision form the product says in a sentence (status, alerts, progress).
export { shortRevision } from "../src/publishedWork.ts";

// A standalone session entry, named for its launch's workflow and title.
export const standaloneSessionName = (workflow: string, title: string) =>
  `${workflow} session for ${title}`;

// A card's session entries, newest first.
export const storyCardSessions = (card: Locator) =>
  card.getByRole("list", { name: "Sessions" }).getByRole("article");

// What a card says of how many of its sessions need attention, when any do.
export const storyCardAttentionOf = (card: Locator) =>
  card.getByText(/^\d+ sessions? needs? attention$/);

// A card's session entry, named for its launch's workflow.
export const storyCardSessionName = (workflow: string) => `${workflow} session`;

// A card's entry for its session in this workflow.
export const storyCardSessionOf = (card: Locator, workflow: string) =>
  storyCardSessions(card).and(
    card.page().getByRole("article", {
      name: storyCardSessionName(workflow),
      exact: true,
    }),
  );

// The state words a session entry shows, on a card or in Recently done.
export const sessionStateOf = (entry: Locator) =>
  entry.locator(".session-state");

// The session id a session entry names, on a card or in Recently done.
export async function sessionNamedBy(record: Locator): Promise<string> {
  const id = await record
    .locator("p", { hasText: /^Session / })
    .locator("code")
    .textContent();
  return id ?? "?";
}

// The agent roster: its members, one member by its agent's name, the card
// portrait that opens the roster at an agent, and the way back to the
// stories.
export function rosterParts(page: Page) {
  const roster = page.getByRole("region", { name: "Agent roster" });
  const members = roster.getByRole("listitem");
  return {
    roster,
    members,
    member: (agent: string) =>
      members.filter({
        has: page.getByRole("heading", { name: agent, exact: true }),
      }),
    opener: (agent: string) =>
      page.getByRole("button", { name: `Show ${agent} in the agent roster` }),
    back: roster.getByRole("button", { name: "Back to stories" }),
  };
}
