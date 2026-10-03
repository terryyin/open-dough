// The shared settled-page wait (`expectSettledPage` in ./dashboardPage.ts)
// returns only once the stages show their cards and no card still reads its
// preparation. The page, its local authenticated read boundary, and the fake
// GitHub behind it are the usual ones; the test holds two of the page's reads
// at that boundary: the snapshot, so no card is shown yet, and one card's
// canonical record, so that card keeps reading its preparation.
//
// Each wait is started once the page holds still in the state it must not
// settle on, and is seen pending after an expectation of the test's own that
// was asked after it and passes at once in that state.

import type { Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { recordsAt } from "./autoRefreshJourney.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { backlogA, dashboardStory, revisionA } from "./refreshJourney.ts";

// Holds the page's local authenticated reads that `held` picks until
// released, and says when the first of them reached its handler.
async function holdReads(
  page: Page,
  held: (query: URLSearchParams) => boolean,
) {
  let reach!: () => void;
  const reached = new Promise<void>((resolve) => {
    reach = resolve;
  });
  let release!: () => void;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === "/__authenticated-read" && held(url.searchParams),
    async (route) => {
      reach();
      await released;
      await route.continue();
    },
  );
  return { reached, release };
}

// A wait under observation: whether it has returned yet, and its return.
function observed(wait: Promise<void>) {
  const state = { returned: false };
  const done = wait.then(() => {
    state.returned = true;
  });
  return { state, done };
}

test("the settled page waits for the cards, then for a card's held preparation read", async ({
  page,
}) => {
  const origin = await publishMovingOrigin(page);
  origin.push(revisionA, backlogA, recordsAt("A"));
  const snapshot = await holdReads(
    page,
    (query) => [...query.keys()].join() === "source",
  );
  const dashboardRecord = await holdReads(
    page,
    (query) => query.get("path") === ".planning/seeds/SEED-021-progress.md",
  );
  const card = parts(page).backlog.getByRole("article", {
    name: dashboardStory,
  });
  try {
    await page.goto("/");
    await snapshot.reached;

    // No card is shown, so none says it is reading.
    const beforeCards = observed(expectSettledPage(page));
    await expect(page.getByRole("article")).toHaveCount(0);
    expect(beforeCards.state.returned).toBe(false);

    snapshot.release();
    await dashboardRecord.reached;
    await expect(card).toContainText("Reading preparation…");

    // The cards are shown, and one of them is still reading.
    const whileReading = observed(expectSettledPage(page));
    await expect(card).toContainText("Reading preparation…");
    expect(beforeCards.state.returned).toBe(false);
    expect(whileReading.state.returned).toBe(false);

    dashboardRecord.release();
    await Promise.all([beforeCards.done, whileReading.done]);
    // Read at once, without waiting: the card's facts were already shown.
    const shown = await card.textContent();
    expect(shown).toContain("Not recorded");
    expect(shown).not.toContain("Reading preparation…");
  } finally {
    snapshot.release();
    dashboardRecord.release();
  }
});
