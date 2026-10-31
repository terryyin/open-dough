// After the page has read offers, a Host switch re-reads through
// `rereadOffers` marked fresh (`../src/machineSessionsReads.ts`): under a
// long reuse window the dialog shows the Codex option installed after that
// read, without waiting for the next 15-second poll. Regular polls stay
// unmarked. Story launch and Start session share that path.

import type { Page } from "@playwright/test";
import { agentLaunchEndpoint } from "../src/launchRequest.ts";
import { sessionsFreshHeader } from "../src/machineSessionsRevision.ts";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  installRefinementSkill,
  openTakenBacklog,
  showOptions,
  startSession,
  startSessionDialog,
} from "./launchStoryCardPage.ts";
import { notRefinedStory } from "./launchJourney.ts";
import { codexSkill } from "./support/codexLaunch.ts";

test.use({
  projectFolders: ["open-dough"],
  extraEnv: { DOUGH_SESSIONS_REUSE_MS: "60000" },
});

function sessionsGets(page: Page) {
  const asks: { fresh: boolean }[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") return;
    let pathname: string;
    try {
      pathname = new URL(request.url()).pathname;
    } catch {
      return;
    }
    if (pathname !== agentLaunchEndpoint) return;
    asks.push({
      fresh: request.headers()[sessionsFreshHeader] !== undefined,
    });
  });
  return asks;
}

test("story launch Host switch shows Codex options observed after the switch without waiting for the poll", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const asks = sessionsGets(page);
  installRefinementSkill(dashboard.home);
  codexSkill(dashboard.home, "--option-a", "Option A");
  const { refine, refinementDialog } = await openTakenBacklog(
    page,
    launchJourney,
  );

  await expect.poll(() => asks.some((ask) => !ask.fresh)).toBe(true);
  const beforeChange = asks.length;

  codexSkill(dashboard.home, "--option-b", "Option B");
  await refine(notRefinedStory).click();
  await refinementDialog
    .getByRole("combobox", { name: "Host" })
    .selectOption("codex");
  // The dialog's accessible name follows its Host.
  const codexDialog = page.getByRole("dialog", {
    name: "Start refinement in Codex",
  });
  await expect(codexDialog).toBeVisible();
  await showOptions(codexDialog);
  await expect(
    codexDialog.getByRole("checkbox", { name: "Option B", exact: true }),
  ).toBeVisible();
  await expect(
    codexDialog.getByRole("checkbox", { name: "Option A", exact: true }),
  ).toHaveCount(0);

  const afterSwitch = asks.slice(beforeChange);
  expect(afterSwitch.some((ask) => ask.fresh)).toBe(true);
});

// Start session shares the fresh Host-switch re-read. Regular polls stay
// unmarked is proven by the asks before the switch; a post-switch
// `runFor(checkIntervalMs)` is hostile under pause + open dialog because the
// next poll is only armed after the fresh read settles, and advancing the
// clock before that settles leaves no timeout to fire (story launch already
// proves Option B without waiting for that poll).
test("Start session Host switch takes the same fresh re-read; regular polls stay unmarked", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  await pausePageClockAt(page, new Date());
  const asks = sessionsGets(page);
  installRefinementSkill(dashboard.home);
  codexSkill(dashboard.home, "--option-a", "Option A");
  await openTakenBacklog(page, launchJourney);

  await expect.poll(() => asks.length).toBeGreaterThan(0);
  expect(asks.every((ask) => !ask.fresh)).toBe(true);

  codexSkill(dashboard.home, "--option-b", "Option B");
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  const beforeSwitch = asks.length;
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await expect(
    page.getByRole("dialog", {
      name: "Start a session in Open Dough in Codex",
    }),
  ).toBeVisible();

  await expect
    .poll(() => asks.slice(beforeSwitch).some((ask) => ask.fresh))
    .toBe(true);
  expect(asks.slice(0, beforeSwitch).every((ask) => !ask.fresh)).toBe(true);
});
