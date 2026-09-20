// Where a reader finds each part of the dashboard page, by the role and name
// the page gives it. Every journey looks the parts up here, so a part is named
// in one place.

import { expect, type Page } from "@playwright/test";

export function parts(page: Page) {
  const stages = page.getByRole("region", { name: "Work stages" });
  return {
    stages,
    backlog: stages.getByRole("region", { name: "Backlog", exact: true }),
    taken: stages.getByRole("region", { name: "Taken", exact: true }),
    direction: page.getByRole("region", { name: "Near-future direction" }),
    source: page.getByRole("region", { name: "Published Git state" }),
    refresh: page.getByRole("button", { name: "Refresh" }),
    // The same read control, as it is named after a failed attempt.
    retry: page.getByRole("button", { name: "Retry" }),
    problem: page.getByRole("alert"),
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
