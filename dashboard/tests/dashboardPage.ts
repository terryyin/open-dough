// Where a reader finds each part of the dashboard page, by the role and name
// the page gives it. Every journey looks the parts up here, so a part is named
// in one place.

import { expect, type Locator, type Page } from "@playwright/test";

export function parts(page: Page) {
  const stages = page.getByRole("region", { name: "Work stages" });
  const status = page.getByRole("status");
  return {
    banner: page.getByRole("banner"),
    sourceEvidence: page.getByLabel(/^Source evidence for /),
    project: page.getByRole("radiogroup", { name: "Project" }),
    stages,
    backlog: stages.getByRole("region", { name: "Backlog", exact: true }),
    taken: stages.getByRole("region", { name: "Taken", exact: true }),
    // What joins Backlog to Taken, found by the words that name it.
    connector: stages.getByText("Taking work", { exact: true }),
    direction: page.getByRole("region", { name: "Near-future direction" }),
    directionToggle: page.locator(".direction summary"),
    preparationHelp: page.getByRole("button", {
      name: "Preparation badge legend",
    }),
    // The selected project's sessions launched from this dashboard.
    recentSessions: page.getByRole("region", { name: "Recent sessions" }),
    source: page.getByRole("region", { name: "Published Git state" }),
    problem: page.getByRole("alert"),
    // The read status is always on the page, so that a change of its text is
    // spoken; it says what the latest read is doing or what it read.
    status,
    // That status only while it says a read is under way.
    reading: status.filter({ hasText: "Reading published work" }),
    notice: page.locator("[aria-live='polite']"),
  };
}

// A Recent sessions entry, named for its launch's workflow and story.
export const recentSessionName = (workflow: string, title: string) =>
  `${workflow} session for ${title}`;

// A card's session entries, newest first.
export const cardSessions = (card: Locator) =>
  card.getByRole("list", { name: "Sessions" }).getByRole("article");

// What a card says of how many of its sessions need attention, when any do.
export const cardAttentionOf = (card: Locator) =>
  card.getByText(/^\d+ sessions? needs? attention$/);

// A card's session entry, named for its launch's workflow.
export const cardSessionName = (workflow: string) => `${workflow} session`;

// A card's entry for its session in this workflow.
export const cardSessionOf = (card: Locator, workflow: string) =>
  cardSessions(card).and(
    card.page().getByRole("article", {
      name: cardSessionName(workflow),
      exact: true,
    }),
  );

// The state words a session entry shows, on a card or in Recent sessions.
export const sessionStateOf = (entry: Locator) =>
  entry.locator(".session-state");

// The session id a session entry names, on a card or in Recent sessions.
export async function sessionNamedBy(record: Locator): Promise<string> {
  const id = await record
    .locator("p", { hasText: /^Session / })
    .locator("code")
    .textContent();
  return id ?? "?";
}

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

// Every button a shown snapshot offers, and nothing else: the banner's
// Sessions, System settings, Start session, the badge legend, each Backlog
// card's launch actions, and each card's Inspect.
export async function expectSnapshotButtons(
  page: Page,
  shown: {
    readonly backlogCards: number;
    readonly cards: number;
  },
) {
  const button = (name: string) =>
    page.getByRole("button", { name, exact: true });
  await expect(button("Sessions")).toHaveCount(1);
  await expect(button("System settings")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: /^Start session in / }),
  ).toHaveCount(1);
  await expect(parts(page).preparationHelp).toHaveCount(1);
  for (const action of cardLaunchActions) {
    await expect(button(action)).toHaveCount(shown.backlogCards);
  }
  await expect(button("Inspect story")).toHaveCount(shown.cards);
  await expect(page.getByRole("button")).toHaveCount(
    4 + shown.backlogCards * cardLaunchActions.length + shown.cards,
  );
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

// The titles each stage shows, in the order it shows them.
export async function expectMembership(
  page: Page,
  titles: { readonly taken: string[]; readonly backlog: string[] },
) {
  const { taken, backlog } = parts(page);
  await expect(taken.getByRole("heading", { level: 3 })).toHaveText(
    titles.taken,
  );
  await expect(backlog.getByRole("heading", { level: 3 })).toHaveText(
    titles.backlog,
  );
}

// The page once every shown card's preparation facts are read. Cards come
// first: until the stages show them -- these titles, or else a first card --
// no card says it is still reading, as just after a reload, so that absence
// alone settles nothing. `timeout` bounds only the wait for the reading to
// end.
export async function expectSettledPage(
  page: Page,
  membership?: { readonly taken: string[]; readonly backlog: string[] },
  { timeout }: { readonly timeout?: number } = {},
) {
  if (membership === undefined) {
    await expect(parts(page).stages.getByRole("article").first()).toBeVisible();
  } else {
    await expectMembership(page, membership);
  }
  await expect(page.getByText("Reading preparation…")).toHaveCount(0, {
    ...(timeout !== undefined && { timeout }),
  });
}

// Every Taken card, once the agent profiles beside the backlog are read, says
// no owner is recorded -- the project publishes none -- and none says the
// profiles could not be read.
export async function expectOwnersNotRecorded(page: Page) {
  const cards = parts(page).taken.getByRole("article");
  await expect(cards.filter({ hasText: "Owner not recorded" })).toHaveCount(
    await cards.count(),
  );
  await expect(page.getByText("Agent profiles could not be read.")).toHaveCount(
    0,
  );
}

// Everything the page shows about one revision, observed together.
export async function expectWholeSnapshot(
  page: Page,
  shown: {
    readonly revision: string;
    readonly titles: { readonly taken: string[]; readonly backlog: string[] };
    readonly retrievedAt?: Date;
  },
  otherRevisions: string[],
) {
  const { stages, source } = parts(page);
  await expectMembership(page, shown.titles);
  await expect(source).toContainText(shown.revision);
  if (shown.retrievedAt) {
    await expect(source.locator("time")).toHaveAttribute(
      "datetime",
      shown.retrievedAt.toISOString(),
    );
  }
  await expect(
    stages.locator(`a[href*="/blob/${shown.revision}/"]`).first(),
  ).toBeVisible();
  for (const other of otherRevisions) {
    await expect(page.locator("body")).not.toContainText(other);
    await expect(page.locator("body")).not.toContainText(other.slice(0, 7));
    await expect(stages.locator(`a[href*="${other}"]`)).toHaveCount(0);
  }
}

// Snapshot controls exclude the banner's machine Sessions and project
// configuration actions, and Start session, which needs no published read.
export const controlsBesideSessions = (page: Page) =>
  page
    .getByRole("button")
    .and(page.locator(":not([aria-label='Sessions'])"))
    .and(page.locator(":not(.project-controls button)"))
    .filter({ hasNotText: /^Start session$/ });

// A failed read with no earlier snapshot shows the problem and the way to read
// again, and nothing that only a snapshot could say.
export async function expectProblemAndNoSnapshot(
  page: Page,
  problemText: string,
  repository = "terryyin/open-dough",
) {
  const { stages, source, problem } = parts(page);
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText(problemText);
  await expect(problem).toContainText(
    "No published work is shown, because none has been read.",
  );
  await expect(problem).toContainText("Reload the page to read again.");
  await expect(controlsBesideSessions(page)).toHaveCount(0);
  await expect(parts(page).reading).toHaveCount(0);
  await expect(stages).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
  await expect(page.getByText(/entries are recorded/)).toHaveCount(0);
  await expect(page.getByText("Near-future direction")).toHaveCount(0);
  await expect(source).toContainText(repository);
  await expect(source).not.toContainText("Revision");
  await expect(source).not.toContainText("Retrieved");
}

// Expand through the actual control before claiming direction is readable.
export async function openDirection(page: Page) {
  await parts(page).directionToggle.click();
  await expect(parts(page).direction.locator("p")).toBeVisible();
}
