// Shared uncertain Claude story launch precondition for listing and own-record
// verification journeys. Each spec keeps its own published bare origin.
import type { Page } from "@playwright/test";
import { attempts } from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { identityB } from "../../src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs";

export { expect, test } from "./dashboardTest.ts";
export const subject = `${readyStory} (${identityB})`;
export const storyRequest = {
  source: "open-dough",
  identity: identityB,
  title: readyStory,
  workflow: "execution",
  host: "claude",
};
export const recoveryOf = (page: Page) =>
  page.getByRole("region", { name: "Startup recovery" });

export function useUncertainLaunch() {
  let journey: LaunchJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    journey = await publishLaunchJourney();
  });
  test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
  test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 3_000 });

  // Starts Story B's execution from its card and waits until its launch
  // settled uncertain: what the card, the start and the launch call are.
  return async function uncertainLaunch(
    page: Page,
    dashboard: DashboardServer,
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
  };
}
