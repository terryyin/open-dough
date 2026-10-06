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
  await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
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
