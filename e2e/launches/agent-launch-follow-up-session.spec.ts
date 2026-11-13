// Follow up on a standalone Done session in Recently done whose earlier
// conversation can no longer be continued: Read final report stays beside
// Follow up, which opens the project's Start session dialog naming the
// session and listing the context it supplies; Start sends that context with
// the request to the synthetic `claude` (./fixtures/fake-claude), the new
// session reads in Taken labelled by its request, and the source stays Done
// and unchanged. With typed text the Side panel stays closed and the keyboard
// returns to Follow up; with only whitespace the new session's terminal
// opens with the keyboard. A Done session that still offers Open terminal
// offers no Follow up until its conversation is confirmed unavailable. The
// first input's order with reporting and an established workspace:
// ../../dashboard/backend-tests/launches/agent-launch-follow-up-boundary.spec.ts;
// identity and retries: agent-launch-follow-up-identity.spec.ts there.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/tests/terminalScreenPage.ts";
import {
  parts,
  sessionStateOf,
  standaloneSessionName,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  openTakenBacklog,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import { listed } from "../../dashboard/tests/recentlyDoneColumn.ts";
import { stored } from "../../dashboard/tests/support/codexLaunch.ts";
import {
  followUpContextOf,
  quietSession,
  quietTitle,
  retiredSession,
  retiredTitle,
} from "../../dashboard/tests/support/followUpSources.ts";
import { radio } from "../../dashboard/tests/support/sessionDialog.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { launchWaitMs } from "../../dashboard/tests/support/launchWait.ts";
import { sidePanelContents } from "../../dashboard/tests/support/sidePanelContents.ts";

test.use({ projectFolders: ["open-dough"] });

const report = "The cache key changed; I restored it.";
const landed = "ab".repeat(20);

// A Done session whose isolated workspace was retired, with its final report
// and the revision its work landed at.
const reported = (home: string) =>
  retiredSession(home, {
    report,
    landed,
    doneAt: new Date(Date.now() - 60_000),
  });

const entryOf = (page: Page, title: string) =>
  parts(page).recentlyDone.getByRole("article", {
    name: standaloneSessionName("Ad hoc", title),
  });

const followUp = (entry: Locator, title: string) =>
  entry.getByRole("button", { name: `Follow up ${title}` });

const contextList = (dialog: Locator) =>
  dialog.getByRole("list", { name: "Follow-up context" }).getByRole("listitem");

test("a Done session whose workspace is gone offers Read final report and Follow up; Start sends the context with the request, opens nothing, returns the keyboard to Follow up and leaves the source as it was", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source]);
  dashboard.claudeScenario("launched");
  await openTakenBacklog(page, launchJourney);
  const entry = entryOf(page, retiredTitle);
  const dialog = startSessionDialog(page, "Open Dough");

  await expect(sessionStateOf(entry)).toHaveText("Done");
  await expect(
    entry.getByRole("button", { name: "Read final report" }),
  ).toBeVisible();
  await followUp(entry, retiredTitle).click();

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`Follows up ${retiredTitle}`);
  await expect(contextList(dialog)).toHaveText([
    "Workflow: Ad hoc",
    `Original request: ${retiredTitle}`,
    `Final report (Completed with attention): ${report}`,
    `Landed at revision: ${landed}`,
  ]);
  await expect(startSessionField(dialog)).toBeFocused();
  await expect(startSessionField(dialog)).toHaveValue("");
  for (const [group, name] of [
    ["Workspace", "Default main"],
    ["After checks", "Wait for review"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeChecked();

  const text = "Is it still slow?";
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const started = parts(page).taken.getByRole("article", {
    name: standaloneSessionName("Ad hoc", text),
  });
  await expect(started).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(started).not.toContainText(retiredTitle);
  // The startup ended: its button is available again and holds the keyboard,
  // and the Side panel is still closed.
  await expect(followUp(entry, retiredTitle)).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(sidePanelContents(page)).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        `Open Dough · Ad hoc · ${text}`,
        [
          followUpContextOf(retiredTitle, [
            "- Workflow: Ad hoc",
            `- Original request: ${retiredTitle}`,
            `- Final report (Completed with attention): ${report}`,
            `- Landed at revision: ${landed}`,
          ]),
          text,
        ].join("\n\n"),
      ],
      cwd: expect.any(String),
    },
  ]);

  // The source stays Done in Recently done with its actions, its record as kept.
  await expect(sessionStateOf(entry)).toHaveText("Done");
  await expect(
    entry.getByRole("button", { name: "Read final report" }),
  ).toBeVisible();
  await expect(followUp(entry, retiredTitle)).toBeVisible();
  expect(
    stored(dashboard.home).find(
      (record) => record.session.sessionId === "reported-source",
    ),
  ).toEqual(source);
});

test("a Done session that still opens its terminal offers no Follow up until its conversation is confirmed unavailable, then a whitespace-only follow-up sends the context alone and opens the new session's terminal", async ({
  page,
  dashboard,
  launchJourney,
}) => {
  const sessionId = listed(dashboard, Date.now(), quietTitle, 10 * 60_000);
  keepLaunchRecords(dashboard, [
    quietSession(sessionId, new Date(Date.now() - 120_000)),
  ]);
  await openTakenBacklog(page, launchJourney);
  const entry = entryOf(page, quietTitle);

  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toBeVisible();
  await expect(followUp(entry, quietTitle)).toHaveCount(0);

  dashboard.claudeSessionBecomes(sessionId, "forgotten");
  await page.reload();
  await expect(followUp(entry, quietTitle)).toBeVisible();
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(0);
  await followUp(entry, quietTitle).click();
  const dialog = startSessionDialog(page, "Open Dough");
  await expect(dialog).toContainText(`Follows up ${quietTitle}`);
  await expect(contextList(dialog)).toHaveText([
    "Workflow: Ad hoc",
    `Original request: ${quietTitle}`,
    "Final report: No final report was submitted.",
  ]);

  dashboard.claudeScenario("launched");
  await startSessionField(dialog).fill(" \t\n ");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(parts(page).taken.locator(".session-entry")).toHaveCount(1);
  // The context is not typed text: the terminal opens with the keyboard.
  await expect(terminalScreenParts(terminalPanel(page)).input).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(sidePanelContents(page)).toHaveAccessibleName("Terminal");
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.argv.at(2)).toMatch(
    /^Open Dough · Ad hoc · \d{1,2} \w{3}, \d\d:\d\d$/,
  );
  expect(call?.argv.at(3)).toBe(
    followUpContextOf(quietTitle, [
      "- Workflow: Ad hoc",
      `- Original request: ${quietTitle}`,
      "- Final report: No final report was submitted.",
    ]),
  );
  await expect(sessionStateOf(entry)).toHaveText("Done");
});
