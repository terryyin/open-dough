// The fully read alternate project used by observation-isolation journeys,
// with an open story inspection and keyboard focus on its canonical link:
// it returns once every read the selection began, independent ones included,
// has been answered.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
  shortRevision,
} from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { projectTab } from "./projectChoice.ts";
import { focusCanonicalRecord, storyCard } from "./storyCardControls.ts";

export async function selectSettledDoughnut(page: Page) {
  const origin = await publishMovingOrigin(page, doughnutRepository);
  origin.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  const { backlog, readRevision } = parts(page);
  // This fixture has no assignments or Taken plans, so its profile and done
  // catalog responses finish every independent read beside preparation. Observe them
  // before selecting: preparation alone can finish before either request has
  // even reached gh, and a following switch must not count that older work.
  const independentReads = Promise.all(
    ["agents", "done"].map((group) =>
      page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          url.pathname === "/__authenticated-read" &&
          url.searchParams.get("source") === "doughnut" &&
          url.searchParams.get("revision") === revisionDoughnut &&
          url.searchParams.get(group) ===
            (group === "agents" ? "profiles" : "catalog")
        );
      }),
    ),
  );
  await projectTab(page, "Doughnut").check();
  const shown = { taken: [], backlog: [doughnutSharedTitle] };
  await expectMembership(page, shown);
  // The reader inspects the story and keeps the keyboard on its canonical
  // link while its facts may still be read, before the independent reads are
  // awaited: they may finish after everything the reader sees, and a caller
  // may hold one until then. The page then settles around the focused link.
  const card = storyCard(backlog, doughnutSharedTitle);
  const link = await focusCanonicalRecord(card);
  for (const response of await independentReads)
    expect(response.ok()).toBe(true);
  await expectSettledPage(page, shown);
  await expect(readRevision).toContainText(shortRevision(revisionDoughnut));
  return {
    card,
    link,
    retrievedAt: await parts(page).retrievedAt.getAttribute("datetime"),
  };
}
