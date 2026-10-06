// Project selections and the reader's context in the observation-isolation
// journey. Raw publications and rendered-fact checks have their own owners.

import type { Page } from "@playwright/test";
import { expect, pausePageClockAt } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import {
  doughnutRepository,
  doughnutSharedGoal,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { selectSettledDoughnut } from "./doughnutJourney.ts";
import { opened } from "./sliceClockRecords.ts";
import {
  groups,
  publishFactsOrigin,
  type PublishedFacts,
} from "./publishedFactsIsolation.ts";
import {
  expectHeldGroups,
  expectNoEarlierFacts,
} from "./publishedFactsIsolationAssertions.ts";

export function pageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

export async function openHeldPublication(page: Page, facts: PublishedFacts) {
  await pausePageClockAt(page, opened);
  const origin = publishFactsOrigin(page);
  const abandoned = origin.push(facts, groups);
  await page.goto("/");
  await expectMembership(page, facts.membership);
  await expectHeldGroups(page, facts, groups);
  return { origin, abandoned };
}

export async function publishedReadState(page: Page) {
  return {
    status: await parts(page).status.textContent(),
    retrieved: await parts(page)
      .source.locator("time")
      .getAttribute("datetime"),
  };
}

export async function expectPublishedReadState(
  page: Page,
  saved: Awaited<ReturnType<typeof publishedReadState>>,
) {
  await expect(parts(page).status).toHaveText(saved.status ?? "");
  await expect(parts(page).source.locator("time")).toHaveAttribute(
    "datetime",
    saved.retrieved ?? "",
  );
  await expect(parts(page).problem).toHaveCount(0);
  await expect(parts(page).notice).toBeEmpty();
}

export async function expectOnlyDoughnut(
  page: Page,
  shown: Awaited<ReturnType<typeof selectSettledDoughnut>>,
  earlier: PublishedFacts,
  saved: Awaited<ReturnType<typeof publishedReadState>>,
) {
  await expectMembership(page, { taken: [], backlog: [doughnutSharedTitle] });
  await expect(
    parts(page).project.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
  await expect(parts(page).source).toContainText(revisionDoughnut);
  await expect(shown.card).toContainText(doughnutSharedGoal);
  await expect(
    shown.card.getByRole("button", { name: "Hide detail" }),
  ).toBeVisible();
  await expect(shown.link).toHaveAttribute(
    "href",
    `https://github.com/${doughnutRepository}/blob/${revisionDoughnut}/.planning/seeds/SEED-777-shared.md#shared-story`,
  );
  await expect(shown.link).toBeFocused();
  await expectNoEarlierFacts(page, earlier);
  await expectPublishedReadState(page, saved);
}
