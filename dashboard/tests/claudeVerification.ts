import { makeMe } from "../../tests/support/makeMe.mjs";
// Shared uncertain Claude story launch precondition for listing and own-record
// verification journeys, on the worker's published origin (../dashboardTest.ts
// `launchJourney`).
import type { Page } from "@playwright/test";
import { attempts } from "./agentLaunchBoundary.ts";
import { parts } from "./dashboardParts.ts";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchStoryCardPage.ts";
import { readyStory, type LaunchJourney } from "./launchJourney.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { identityB } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";

export { expect, test } from "./dashboardTest.ts";
export const subject = `${readyStory} (${identityB})`;
export const storyRequest = makeMe.aLaunchRequest
  .executing({ identity: identityB, title: readyStory })
  .please();
export const recoveryOf = (page: Page) => parts(page).startupRecovery;

export function useUncertainLaunch() {
  test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 3_000 });
  return uncertainLaunch;
}

// Starts Story B's execution from its card and waits until its launch
// settled uncertain: what the card, the start and the launch call are.
async function uncertainLaunch(
  page: Page,
  dashboard: DashboardServer,
  journey: LaunchJourney,
) {
  const opened = await openTakenBacklog(page, journey);
  await opened.start(readyStory).click();
  await opened.dialog.getByRole("button", { name: "Start" }).click();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("uncertain");
  const [call] = dashboard.claudeLaunchCalls();
  const argv = call?.argv ?? [];
  const [attempt] = await attempts(dashboard);
  await expect(
    recoveryOf(page).getByRole("button", { name: `Recheck ${subject}` }),
  ).toBeEnabled();
  return {
    card: opened.card(readyStory),
    start: opened.start(readyStory),
    name: argv[argv.indexOf("--name") + 1] ?? "",
    cwd: call?.cwd ?? "",
    acceptedAt: Date.parse(attempt?.acceptedAt ?? ""),
  };
}
