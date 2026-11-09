// Project Intent's CI wall time history journeys
// (./intent/intent-ci-wall-time-history.spec.ts,
// ./intent/intent-ci-wall-time-history-pending.spec.ts): Open Dough's trunk
// published from its real bare origin (./support/startOrigin.ts) with the CI
// runs a journey serves, Project Intent's CI status with nothing selected,
// and the history region in it (../src/IntentCiHistory.tsx).

import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus } from "./intentCiStatusPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { actionsForRuns, type CiRunAnswer } from "./support/baseCiActions.ts";
import { originMain } from "./support/sessionDialog.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import type { Locator, Page } from "@playwright/test";

// The CI wall time history in a CI status panel.
export const historyOf = (panel: Locator) =>
  panel.getByRole("region", { name: "CI wall time history", exact: true });

// Open Dough's trunk as published, its main followed as it moves, with
// `runs` as the selected workflow's push runs whenever they are asked for.
export async function publishTrunk(
  page: Page,
  origin: StartOrigin,
  runs: () => readonly CiRunAnswer[],
) {
  const committed = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: await originMain(origin),
    repository: "terryyin/open-dough",
    follows: true,
  });
  committed.serveActions((argv, head) => actionsForRuns(runs())(argv, head));
}

// Project Intent's CI status, with nothing selected.
export async function openProjectCiStatus(page: Page) {
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  return chooseCiStatus(intent);
}
