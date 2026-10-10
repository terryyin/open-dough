// What a journey expects of the dashboard page as a whole: its stages once
// the published work is read, a settled page, a whole snapshot, a read
// problem. The page's parts (./dashboardParts.ts) are found through here too.

import { expect, type Locator, type Page } from "@playwright/test";
import { cardLaunchActions, detailToggle } from "./cardControls.ts";
import { parts } from "./dashboardParts.ts";
import {
  untilPageReadsAnswered,
  untilPublishedWorkRead,
} from "./pageRequestNotes.ts";

export * from "./dashboardParts.ts";

// Every button a shown snapshot offers, and nothing else: the banner's
// Sessions, System settings, Start session, the badge legend, each Backlog
// card's launch actions, and each card's Inspect story or Hide detail.
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
  await expect(page.getByRole("button", { name: detailToggle })).toHaveCount(
    shown.cards,
  );
  await expect(page.getByRole("button")).toHaveCount(
    4 + shown.backlogCards * cardLaunchActions.length + shown.cards,
  );
}

// Waits until no read of the published work is on its way, then tells
// whether the page says that read failed with nothing read and that it reads
// no more on its own: the line a failure shows only with no work, no
// transient recovery due, and no rate limit standing
// (../src/PublishedReadFailure.tsx). Looked at once, not waited for: a page
// that does not say so is checked as any other.
async function readAndNothingMoreWillBeRead(page: Page): Promise<boolean> {
  await untilPublishedWorkRead(page);
  return (
    (await parts(page)
      .problem.filter({ hasText: "Reload the page to read again." })
      .count()) > 0
  );
}

const nothingMoreWillBeRead =
  "the page says the published work could not be read and it reads no more on its own";

// The published story titles in each stage, excluding standalone sessions,
// once no read of the published work is on its way: the titles then wait on
// the page showing what it read, however long GitHub took to answer. When
// the page says that read failed for good, nothing can still bring a title,
// so what the stages show is compared at once.
export async function expectMembership(
  page: Page,
  titles: { readonly taken: string[]; readonly backlog: string[] },
) {
  const { taken, backlog } = parts(page);
  const titlesIn = (stage: Locator) =>
    stage.locator("[data-work] > fieldset > h3");
  if (await readAndNothingMoreWillBeRead(page)) {
    expect(
      {
        taken: await titlesIn(taken).allTextContents(),
        backlog: await titlesIn(backlog).allTextContents(),
      },
      nothingMoreWillBeRead,
    ).toEqual({ taken: titles.taken, backlog: titles.backlog });
    return;
  }
  await expect(titlesIn(taken)).toHaveText(titles.taken);
  await expect(titlesIn(backlog)).toHaveText(titles.backlog);
}

// A first card in the stages, once no read of the published work is on its
// way; looked for at once when the page says that read failed for good.
async function expectFirstCard(page: Page) {
  const cards = parts(page).stages.getByRole("article");
  if (await readAndNothingMoreWillBeRead(page)) {
    expect(await cards.count(), nothingMoreWillBeRead).toBeGreaterThan(0);
    return;
  }
  await expect(cards.first()).toBeVisible();
}

// The page once every shown card's preparation facts are read, and every
// read it sent the local boundary besides its revision checks is answered:
// a detail no card shows as reading, such as the agent profiles and project
// setting file of a project with no Taken entry, has then reached GitHub
// too. Cards come first: until the stages show them -- these titles, or else
// a first card -- no card says it is still reading, as just after a reload,
// so that absence alone settles nothing. `timeout` bounds only the wait for
// the preparation reading to end.
export async function expectSettledPage(
  page: Page,
  membership?: { readonly taken: string[]; readonly backlog: string[] },
  { timeout }: { readonly timeout?: number } = {},
) {
  if (membership === undefined) {
    await expectFirstCard(page);
  } else {
    await expectMembership(page, membership);
  }
  await expect(page.getByText("Reading preparation…")).toHaveCount(0, {
    ...(timeout !== undefined && { timeout }),
  });
  await untilPageReadsAnswered(page);
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

// Everything the page shows about one revision, observed together. Source
// links are read in the story detail the journey has opened.
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
  const detail = stages.getByRole("region", { name: /^Detail for / });
  await expect(detail).toHaveCount(1);
  await expect(
    detail.locator(`a[href*="/blob/${shown.revision}/"]`).first(),
  ).toBeVisible();
  for (const other of otherRevisions) {
    await expect(page.locator("body")).not.toContainText(other);
    await expect(page.locator("body")).not.toContainText(other.slice(0, 7));
    await expect(stages.locator(`a[href*="${other}"]`)).toHaveCount(0);
  }
}

// Snapshot controls exclude the banner's machine Sessions and System
// settings, and Start session, which needs no published read.
export const controlsBesideSessions = (page: Page) =>
  page
    .getByRole("button")
    .and(page.locator(":not([aria-label='Sessions'])"))
    .and(page.locator(":not([aria-label='System settings'])"))
    .filter({ hasNotText: /^Start session$/ });

// A failed read with no earlier snapshot shows the problem, the way to read
// again (`recovery`), and nothing that only a snapshot could say. The problem
// is looked for once no read of the published work is on its way.
export async function expectProblemAndNoSnapshot(
  page: Page,
  problemText: string,
  repository = "terryyin/open-dough",
  recovery = "Reload the page to read again.",
) {
  const { stages, source, problem } = parts(page);
  await untilPublishedWorkRead(page);
  await expect(problem).toContainText("Published work could not be read");
  await expect(problem).toContainText(problemText);
  await expect(problem).toContainText(
    "No published work is shown, because none has been read.",
  );
  await expect(problem).toContainText(recovery);
  await expect(controlsBesideSessions(page)).toHaveCount(0);
  await expect(parts(page).reading).toHaveCount(0);
  await expect(stages).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByText(/\d+ entr(y|ies)/)).toHaveCount(0);
  await expect(page.getByText(/entries are recorded/)).toHaveCount(0);
  await expect(page.getByText("Near-future direction")).toHaveCount(0);
  await expect(source).toContainText(repository);
  await expect(source).not.toContainText(/Revision|Retrieved/);
}

// Expand through the actual control before claiming direction is readable.
export async function openDirection(page: Page) {
  await parts(page).directionToggle.click();
  await expect(parts(page).directionText).toBeVisible();
}

const laidOut = async (part: Locator) => {
  const box = await part.boundingBox();
  if (!box) throw new Error("not laid out");
  return box;
};

// The opened direction reads beneath everything on the project actions row,
// from the row's left edge to its right edge, while the row's own parts stay
// where they were before it opened.
export async function expectDirectionOpensAcrossRow(page: Page) {
  const { directionToggle, directionText, projectActions } = parts(page);
  const rowParts = [
    directionToggle,
    projectActions.locator(".project-actions-end"),
  ];
  const closed = await Promise.all(rowParts.map(laidOut));
  await openDirection(page);
  const opened = await Promise.all(rowParts.map(laidOut));
  expect(opened).toEqual(closed);
  const [panel, across] = await Promise.all([
    laidOut(directionText),
    laidOut(projectActions),
  ]);
  expect(Math.abs(panel.x - across.x)).toBeLessThan(1);
  expect(Math.abs(panel.width - across.width)).toBeLessThan(1);
  for (const part of opened)
    expect(panel.y).toBeGreaterThanOrEqual(part.y + part.height);
}
