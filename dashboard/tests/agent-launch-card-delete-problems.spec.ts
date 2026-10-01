// A card's Delete record… that is overtaken, refused, or fails says so and
// never brings a deleted entry back (the delete itself is
// ./agent-launch-card-delete.spec.ts). Once the listing is readable again the
// question and the button go and the entry shows its state; a click that
// finds the state known keeps the record and says "This session's state is
// now known"; an unwritable record file says "The session record could not be
// deleted." with the boundary's reason, leaves the buttons and the keyboard
// where they were, and a retry once it is writable deletes; a read answered
// after the deletion does not list the session again. The page's own
// dashboard server drives the synthetic `claude` (./fixtures/fake-claude);
// the real one is never reached. The page clock stands still unless the
// journey lets it pass.

import { chmodSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  cardSessionOf,
  cardSessions,
  parts,
  recentSessionName,
  sessionNamedBy,
  sessionStateOf,
} from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import type { Page } from "@playwright/test";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { givePageItsTurns } from "./pageRequestNotes.ts";
import { holdSessionAnswers, watchRecordReads } from "./sessionStatePace.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const unknownWords =
  "State unknown: Claude Code's session list could not be read";
const question =
  "Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.";

async function unknownSession(page: Page, dashboard: DashboardServer) {
  await pausePageClockAt(page, new Date());
  const pace = watchRecordReads(page);
  dashboard.claudeScenario("launched");
  const { card, start, dialog } = await openTakenBacklog(page, journey);
  await start(readyStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();
  const entry = cardSessionOf(card(readyStory), "Execution");
  const inRecent = parts(page).recentSessions.getByRole("article", {
    name: recentSessionName("Execution", readyStory),
  });
  const session = await sessionNamedBy(entry);
  await expect(sessionStateOf(entry)).toHaveText("Working");
  // The published read that reconciles the start lands before page time
  // passes, so its wait bound never ends it.
  await expect(
    card(readyStory).getByRole("button", { name: "Inspect story" }),
  ).toBeEnabled();
  dashboard.claudeListingFails(true);
  await pace.passOnePace();
  await expect(sessionStateOf(entry)).toHaveText(unknownWords);
  const storedFile = path.join(
    dashboard.home,
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
  return {
    card,
    entry,
    inRecent,
    session,
    pace,
    stored: () => readFileSync(storedFile, "utf8"),
    deleteButton: entry.getByRole("button", { name: "Delete record…" }),
    confirm: entry.getByRole("button", { name: "Delete record", exact: true }),
    keep: entry.getByRole("button", { name: "Keep" }),
    status: entry.getByRole("status"),
  };
}

test("the question and Delete record… go when a later read lists the session as known, deleting nothing", async ({
  page,
  dashboard,
}) => {
  const s = await unknownSession(page, dashboard);
  await s.deleteButton.click();
  await expect(s.entry.getByText(question)).toBeVisible();

  dashboard.claudeListingFails(false);
  await s.pace.passOnePace();

  await expect(sessionStateOf(s.entry)).toHaveText("Working");
  await expect(s.entry.getByText(question)).toHaveCount(0);
  await expect(s.deleteButton).toHaveCount(0);
  await expect(s.confirm).toHaveCount(0);
  expect(s.stored()).toContain(s.session);
});

test("a click that finds the state known keeps the record and says so beside the state", async ({
  page,
  dashboard,
}) => {
  const s = await unknownSession(page, dashboard);
  dashboard.claudeListingFails(false);
  await s.deleteButton.click();
  await expect(s.entry.getByText(question)).toBeVisible();

  await s.confirm.click();

  await expect(s.status).toContainText("This session's state is now known");
  await expect(sessionStateOf(s.entry)).toHaveText("Working");
  await expect(s.entry.getByText(question)).toHaveCount(0);
  await expect(s.deleteButton).toHaveCount(0);
  await expect(s.inRecent).toBeVisible();
  expect(s.stored()).toContain(s.session);
  expect(
    dashboard.claudeCalls().filter((call) => call.argv[0] === "stop"),
  ).toEqual([]);
});

test("an unwritable record file says why in the entry, changes no buttons or keyboard, and a retry once writable deletes", async ({
  page,
  dashboard,
}) => {
  const s = await unknownSession(page, dashboard);
  await s.deleteButton.click();
  const directory = path.join(dashboard.home, ".open-dough", "dashboard");
  chmodSync(directory, 0o500);
  try {
    await s.confirm.click();

    await expect(s.status).toContainText(
      "The session record could not be deleted.",
    );
    await expect(s.status).toContainText("EACCES");
    await expect(s.entry.getByText(question)).toBeVisible();
    await expect(s.confirm).toBeEnabled();
    await expect(s.keep).toBeEnabled();
    await expect(s.confirm).toBeFocused();
    await expect(s.entry).toBeVisible();
    expect(s.stored()).toContain(s.session);
  } finally {
    chmodSync(directory, 0o700);
  }

  await s.confirm.click();

  await expect(s.entry).toHaveCount(0);
  await expect(s.inRecent).toHaveCount(0);
  expect(s.stored()).not.toContain(s.session);
});

test("a read asked before the deletion and answered after it does not bring the entry back", async ({
  page,
  dashboard,
}) => {
  const s = await unknownSession(page, dashboard);
  const held = await holdSessionAnswers(page);
  await page.clock.runFor(checkIntervalMs);
  await held.reachedServer;
  await s.deleteButton.click();
  await s.confirm.click();
  await expect(s.entry).toHaveCount(0);

  held.answer();
  await givePageItsTurns(page);
  await givePageItsTurns(page);

  await expect(s.entry).toHaveCount(0);
  await expect(s.inRecent).toHaveCount(0);
  await expect(cardSessions(s.card(readyStory))).toHaveCount(0);
});
