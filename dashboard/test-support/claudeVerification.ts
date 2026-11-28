import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
// Shared uncertain Claude story launch precondition for listing and own-record
// verification journeys, with the installed workflow and the Board reading
// the same bare origin.
import type { Page } from "@playwright/test";
import { nextAcceptedAttemptId } from "./acceptedAttemptPage.ts";
import { attempts } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardParts.ts";
import { expect } from "./dashboardTest.ts";
import { openInstalledStoryBoard } from "./installedStoryCardPage.ts";
import { readyStory } from "./launchJourney.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { StartOrigin } from "./support/startOrigin.ts";
import { identityB } from "../../Distribution/tests/skills/dough-execute-plan/workspace-publication-fixtures.mjs";

export { expect } from "./dashboardTest.ts";
export { test } from "./support/startOriginTest.ts";
export const subject = `${readyStory} (${identityB})`;
export const storyRequest = makeMe.aLaunchRequest
  .executing({ identity: identityB, title: readyStory })
  .please();
export const recoveryOf = (page: Page) => parts(page).startupRecovery;

export async function attemptOf(dashboard: DashboardServer, id: string) {
  const attempt = (await attempts(dashboard)).find((entry) => entry.id === id);
  if (attempt === undefined) throw new Error(`Missing launch attempt ${id}`);
  return attempt;
}

// Starts Story B's execution from its card and waits until its launch
// settled uncertain: what the card, the start and the launch call are.
export async function uncertainLaunch(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
  { oneShot = false }: { oneShot?: boolean } = {},
) {
  const board = await openInstalledStoryBoard(page, origin, {
    keepsOpenedTrunk: true,
  });
  const launch = await board.open(readyStory, "Execution");
  if (oneShot) await launch.chooseOneShot();
  const acceptance = nextAcceptedAttemptId(page);
  await launch.submit();
  const attemptId = await acceptance;
  await expect
    .poll(() => dashboard.claudeLaunchCalls(), {
      timeout: 30_000,
      intervals: [100],
    })
    .toHaveLength(1);
  await dashboard.endLaunchWait();
  await expect
    .poll(async () => (await attemptOf(dashboard, attemptId)).outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("uncertain");
  const [call] = dashboard.claudeLaunchCalls();
  const argv = call?.argv ?? [];
  const attempt = await attemptOf(dashboard, attemptId);
  await expect(
    recoveryOf(page).getByRole("button", { name: `Recheck ${subject}` }),
  ).toBeEnabled();
  return {
    card: board.card(readyStory),
    start: board.action(readyStory, "Execution"),
    showPublished: () => board.showPublished(),
    attemptId,
    name: argv[argv.indexOf("--name") + 1] ?? "",
    cwd: call?.cwd ?? "",
    acceptedAt: Date.parse(attempt.acceptedAt),
  };
}
