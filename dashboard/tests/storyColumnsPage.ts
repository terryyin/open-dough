// The story-columns journey (./launchJourney.ts) as the dashboard page shows it:
// the page opens on the queued revision of its committed origin, beside a
// Doughnut origin to switch to, and a journey launches from Backlog cards and
// shows each later revision by reloading the page, by the page being seen
// again, or in the open page once its own steady pace of page time passes.

import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { shortRevision, expectSettledPage, parts } from "./dashboardPage.ts";
import {
  doughnutBacklog,
  doughnutRecords,
  doughnutRepository,
  revisionDoughnut,
} from "./doughnutProject.ts";
import type { StoryColumnsJourney } from "./launchJourney.ts";
import { setPageVisibility } from "./autoRefreshJourney.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
  untilPublishedWorkRead,
} from "./pageRequestNotes.ts";

export type Workflow = "Execution" | "Refinement";

export async function openStoryColumnsJourney(
  page: Page,
  columnsJourney: StoryColumnsJourney,
) {
  const origin = await publishCommittedOrigin(page, {
    repoDir: columnsJourney.origin,
    revision: columnsJourney.queued,
    repository: "terryyin/open-dough",
  });
  const doughnut = await publishMovingOrigin(page, doughnutRepository);
  doughnut.push(revisionDoughnut, doughnutBacklog, doughnutRecords);
  await openUntilRead(page);
  const { backlog, readRevision } = parts(page);
  const card = (title: string) => backlog.getByRole("article", { name: title });
  const action = (title: string, workflow: Workflow) =>
    card(title).getByRole("button", { name: `Start ${workflow}` });
  const settled = () => expectSettledPage(page);
  return {
    card,
    action,
    settled,
    // Origin publishes the revision, and the page reads it: after a reload,
    // after being seen again (`reload: false`), or, given the `pace` that
    // lets the paused page clock pass its steady pace, in the open page by
    // its own revision check. A new revision can show before the cards it
    // brings, so the page settles after it.
    show: async (
      revision: string,
      {
        reload = true,
        pace,
      }:
        | { reload?: boolean; pace?: undefined }
        | { reload?: undefined; pace: () => Promise<void> } = {},
    ) => {
      origin.advanceTo(revision);
      if (pace !== undefined) await pace();
      else if (reload) await page.reload();
      else {
        await setPageVisibility(page, "hidden");
        await setPageVisibility(page, "visible");
      }
      await untilPublishedWorkRead(page);
      await expect(readRevision).toContainText(shortRevision(revision));
      await settled();
    },
    // Launches the workflow from the story's card, confirming its dialog, and
    // waits for startup's answers before checking that it reconciled. The
    // fresh published-work read after settlement reads every card's
    // preparation again, temporarily taking their Start actions away, so a
    // later launch begins on settled cards. When base CI asks (unread/failed
    // fake), Continue with the named confirmation so journeys that are not
    // asserting that gate still start (SEED-210).
    launch: async (title: string, workflow: Workflow) => {
      // After a project switch the Backlog card can arrive after settlement
      // words; wait for the Start control itself rather than a short enable.
      await expect(action(title, workflow)).toBeEnabled({ timeout: 30_000 });
      await action(title, workflow).click();
      const dialog = page.getByRole("dialog", {
        name: `Start ${workflow} in Claude Code`,
      });
      await dialog.getByRole("button", { name: "Start" }).click();
      const continueName = {
        name: /Continue (on failing base|while CI runs|without CI result)/,
      };
      const continueBaseCi = dialog.getByRole("button", continueName);
      // The dialog counts only while it offers no Continue, so one wait ends
      // when it closes or when it asks to continue without base CI, and no
      // second wait is left polling after the other answers.
      await dialog
        .filter({ hasNot: page.getByRole("button", continueName) })
        .waitFor({ state: "hidden" });
      if ((await continueBaseCi.count()) > 0) {
        await continueBaseCi.click();
      }
      await untilPageRequestsAnswered(page);
      await expect(page.getByText(/this story's actions/)).toHaveCount(0);
    },
  };
}
