// Where a reader finds each part of the dashboard page, by the role and name
// the page gives it. Every journey looks the parts up here, so a part is named
// in one place.

import { expect, type Page } from "@playwright/test";

export function parts(page: Page) {
  const stages = page.getByRole("region", { name: "Work stages" });
  const status = page.getByRole("status");
  return {
    banner: page.getByRole("banner"),
    sourceEvidence: page.getByLabel("Source evidence", { exact: true }),
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
    source: page.getByRole("region", { name: "Published Git state" }),
    refresh: page.getByRole("button", { name: "Refresh" }),
    // The same read control, as it is named after a failed attempt.
    retry: page.getByRole("button", { name: "Retry" }),
    problem: page.getByRole("alert"),
    // The read status is always on the page, so that a change of its text is
    // spoken; it says what the latest read is doing or what it read.
    status,
    // That status only while it says a read is under way.
    reading: status.filter({ hasText: "Reading published work" }),
    notice: page.locator("[aria-live='polite']"),
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

// A failed read with no earlier snapshot shows the problem and the way to read again, and nothing
// that only a snapshot could say.
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
  await expect(page.getByRole("button")).toHaveAccessibleName("Retry");
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
