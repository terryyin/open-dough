// The fully read alternate project used by observation-isolation journeys,
// with an open story inspection and keyboard focus on its canonical link.

import type { Page } from "@playwright/test";
import { expect, githubFor } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  doughnutSharedTitle,
  revisionDoughnut,
} from "./doughnutProject.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { doneRecordDirectory } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";

export async function selectSettledDoughnut(page: Page) {
  const origin = await publishMovingOrigin(page, doughnutRepository);
  origin.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  const { project, backlog, source } = parts(page);
  await project.getByRole("radio", { name: "Doughnut", exact: true }).check();
  await expectSettledPage(page, { taken: [], backlog: [doughnutSharedTitle] });
  await expect(source).toContainText(revisionDoughnut);
  // Doughnut publishes no done record or agent profile, so the page looks the
  // same before and after those reads answer. The done listing and the
  // project setting file read (the last of the profile read, after its
  // listing) must have reached GitHub, so no Doughnut read sent now counts as
  // asked after a later selection.
  await expect
    .poll(() =>
      readsBesideChecks(
        githubFor(page).calls.filter(
          ({ request }) =>
            request.kind !== "unknown" &&
            request.repository === doughnutRepository,
        ),
      ),
    )
    .toEqual(
      expect.arrayContaining(
        [
          `listing .planning/${doneRecordDirectory}`,
          `content ${agentSettingsPath}`,
        ].map((read) => `${read}@${revisionDoughnut}`),
      ),
    );
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
