// Published Done and machine-local starting facts for sidebar review journeys.
import path from "node:path";
import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { describedRevision } from "./describedRevisions.ts";
import {
  openDough,
  openDoughSettings,
  publishIntentProject,
} from "./intentCodeBrowseFixtures.ts";
import {
  keepSelectionSessions,
  linked,
  publishSelectionProjects,
} from "./recentlyDoneSelectionJourney.ts";
import { keepMoreLaunchRecords } from "./support/launchStore.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { showRecentlyDone } from "./recentlyDoneSessionsSidebarPage.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { storyReviewStateEndpoint } from "../src/storyReviewState.ts";
import { showColumn } from "./boardPage.ts";

export const localTitle = "The same story identity completed in Open Dough";
export const localSessionTitle =
  "Open Dough session of the identical story identity";
export const duplicateTitle = "Another Pygardon session of the finished story";
export const longSessionTitle =
  "A very long completed story session title that must leave Needs review visible at narrow touch width without hiding Select or Open";

export function cueSession(
  dashboard: DashboardServer,
  title: string,
  index: number,
  source = "pygardon",
) {
  return makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title, source })
    .inClaudeSession({
      sessionId: `cue-session-${source}-${String(index)}`,
      shortId: `cue-${String(index)}`,
    })
    .onStoryBranch({
      workspace: path.join(dashboard.home, `retired-cue-${String(index)}`),
      branch: "claude/retired-cue",
    })
    .completedWith({ message: `Report for ${title}.` })
    .launchedAt(new Date(Date.now() - (index + 10) * 60_000).toISOString())
    .markedDoneAt(new Date(Date.now() - (index + 1) * 1000).toISOString())
    .please();
}

export async function keepReviewCueProjects(
  page: Page,
  dashboard: DashboardServer,
) {
  const now = Date.now();
  await publishSelectionProjects(page, now);
  keepSelectionSessions(dashboard, now);
  const record = makeMe.aDoneRecord
    .completed({
      identity: linked.identity,
      title: localTitle,
      completedAt: new Date(now - 3_600_000).toISOString(),
    })
    .please();
  const publication = describedRevision(
    makeMe.aRepository
      .withRevision("done", { files: openDough.files, doneRecords: [record] })
      .please(),
    openDough.revision,
  );
  await publishIntentProject(
    page,
    { ...openDough, ...publication },
    openDoughSettings,
    {},
  );
  keepMoreLaunchRecords(dashboard, [
    cueSession(dashboard, localSessionTitle, 20, "open-dough"),
  ]);
  keepMoreLaunchRecords(
    dashboard,
    [cueSession(dashboard, duplicateTitle, 21)],
    "pygardon",
  );
  const saved = await page.request.post(
    `${dashboard.baseURL}${storyReviewStateEndpoint}?id=open-dough`,
    {
      headers: { Origin: dashboard.origin },
      data: { identity: linked.identity, reviewed: true },
    },
  );
  if (!saved.ok()) throw new Error(`review setup: ${await saved.text()}`);
}

export async function showReviewCueSessions(page: Page) {
  await openUntilRead(page);
  await showColumn(page, "Recently done");
  return showRecentlyDone(page);
}
