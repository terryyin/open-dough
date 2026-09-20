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
