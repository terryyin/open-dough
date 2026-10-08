// The fully read alternate project used by observation-isolation journeys,
// with an open story inspection and keyboard focus on its canonical link.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";

export async function selectSettledDoughnut(page: Page) {
  const origin = await publishMovingOrigin(page, doughnutRepository);
  origin.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  const { project, backlog, source } = parts(page);
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
  await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
  for (const response of await independentReads)
    expect(response.ok()).toBe(true);
  await expectSettledPage(page, { taken: [], backlog: [doughnutSharedTitle] });
  await expect(source).toContainText(revisionDoughnut);
  const card = backlog.getByRole("article", { name: doughnutSharedTitle });
  await card.getByRole("button", { name: "Inspect story" }).click();
  const link = card.getByRole("link", { name: /^Canonical record/ });
  await link.focus();
  return {
    card,
    link,
    retrievedAt: await source.locator("time").getAttribute("datetime"),
  };
}
