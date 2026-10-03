// The story-stages journey (./launchJourney.ts) as the dashboard page shows it:
// the page opens on the queued revision of its committed origin, beside a
// Doughnut origin to switch to, and a journey launches from Backlog cards and
// shows each later revision by reloading the page.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  revisionDoughnut,
} from "./doughnutProject.ts";
import type { StoryStagesJourney } from "./launchJourney.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";

export type Workflow = "Execution" | "Refinement";

export async function openStoryStagesJourney(
  page: Page,
  stagesJourney: StoryStagesJourney,
) {
  const origin = await publishCommittedOrigin(page, {
    repoDir: stagesJourney.origin,
    revision: stagesJourney.queued,
    repository: "terryyin/open-dough",
  });
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  await page.goto("/");
  const { stages, backlog, source } = parts(page);
  const card = (title: string) => backlog.getByRole("article", { name: title });
  const action = (title: string, workflow: Workflow) =>
    card(title).getByRole("button", { name: `Start ${workflow}` });
  // Every card's preparation facts are read. Cards come first: until they are
  // shown (as just after a reload), no card says it is still reading.
  const settled = async () => {
    await expect(stages.getByRole("article").first()).toBeVisible();
    await expect(page.getByText("Reading preparation…")).toHaveCount(0);
  };
  return {
    card,
    action,
    settled,
    // Origin publishes the revision, and the page reads it.
    show: async (revision: string) => {
      origin.advanceTo(revision);
      await page.reload();
      await expect(source).toContainText(revision);
      await settled();
    },
    // Launches the workflow from the story's card, confirming its dialog, and
    // waits until the start reconciles: the fresh read its settling asks
    // makes every card read its preparation again, which takes their Start
    // actions away meanwhile, so a later launch begins on settled cards.
    launch: async (title: string, workflow: Workflow) => {
      await expect(action(title, workflow)).toBeEnabled();
      await action(title, workflow).click();
      await page
        .getByRole("dialog", { name: `Start ${workflow} in Claude Code` })
        .getByRole("button", { name: "Start" })
        .click();
      await expect(page.getByText(/this story's actions/)).toHaveCount(0);
    },
  };
}
