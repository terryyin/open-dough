import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import {
  terminalPanel,
  terminalScreenParts,
  openTerminalControl,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import {
  sessionStateOf,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  openTakenBacklog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { listed } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { stored } from "../../dashboard/test-support/support/codexLaunch.ts";
import {
  followUpContextOf,
  quietSession,
  quietTitle,
  retiredSession,
  retiredTitle,
} from "../../dashboard/test-support/support/followUpSources.ts";
import {
  takenIdentity,
  takenStory,
} from "../../dashboard/test-support/launchJourney.ts";
import { publishCommittedFiles } from "../../dashboard/test-support/publishedOrigin.ts";
import {
  publishedFiles,
  repository,
} from "../../dashboard/test-support/recentlyDoneRecords.ts";
import {
  doneStoryRecords,
  recoverStory,
} from "../../dashboard/test-support/support/followUpStories.ts";
import { sessionFollowUpPage } from "../../dashboard/test-support/support/sessionFollowUpPage.ts";
import { radio } from "../../dashboard/test-support/support/sessionDialog.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { sidePanelContents } from "../../dashboard/test-support/support/sidePanelContents.ts";
import { readFinalReportControl } from "../../dashboard/test-support/finalReportPages.ts";
import { expectAdHocReportingInput } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";

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
    storyIdentity: recoverStory.identity,
  });

test("a Done session whose workspace is gone offers Read final report and Follow up; Start sends the context with the request, opens nothing, returns the keyboard to Follow up and leaves the source as it was", async ({
  page,
  dashboard,
}) => {
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source]);
  dashboard.claudeScenario("launched");
  publishCommittedFiles(page, {
    repository,
    files: publishedFiles({
      doneRecords: doneStoryRecords(
        [recoverStory],
        new Date(Date.now() - 120_000).toISOString(),
      ),
    }),
  });
  await page.goto("/");
  const board = sessionFollowUpPage(page);
  const done = board.done(recoverStory.title);
  const entry = board.session(
    done,
    standaloneSessionName("Ad hoc", retiredTitle),
  );
  const { dialog } = board;

  await expect(sessionStateOf(entry)).toHaveText("Done");
  await expect(readFinalReportControl(entry)).toBeVisible();
  await board.followUp(entry, retiredTitle).click();

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(`Follows up ${retiredTitle}`);
  await expect(board.context).toHaveText([
    "Workflow: Ad hoc",
    `Story: ${recoverStory.identity}`,
    `Original request: ${retiredTitle}`,
    `Final report (Completed with attention): ${report}`,
    `Landed at revision: ${landed}`,
  ]);
  await expect(startSessionField(dialog)).toBeFocused();
  await expect(startSessionField(dialog)).toHaveValue("");
  for (const [group, name] of [
    ["Workspace", "Execution checkout"],
    ["After checks", "Wait for review"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeChecked();

  const text = "Is it still slow?";
  await board.submit(text);

  const started = board.session(done, standaloneSessionName("Ad hoc", text));
  await expect(started).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(started).not.toContainText(retiredTitle);
  // The startup ended: its button is available again and holds the keyboard,
  // and the Side panel is still closed.
  await expect(board.followUp(entry, retiredTitle)).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(sidePanelContents(page)).toHaveCount(0);
  expectFollowUpInput(
    dashboard,
    source.session.sessionId,
    recoverStory.identity,
    [
      followUpContextOf(retiredTitle, [
        "- Workflow: Ad hoc",
        `- Story: ${recoverStory.identity}`,
        `- Original request: ${retiredTitle}`,
        `- Final report (Completed with attention): ${report}`,
        `- Landed at revision: ${landed}`,
      ]),
      text,
    ].join("\n\n"),
  );
  expect(dashboard.claudeLaunches()).toMatchObject([
    { name: `Open Dough · Ad hoc · ${text}` },
  ]);

  // The source stays Done in Recently done with its actions, its record as kept.
  await expect(sessionStateOf(entry)).toHaveText("Done");
  await expect(readFinalReportControl(entry)).toBeVisible();
  await expect(board.followUp(entry, retiredTitle)).toBeVisible();
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
    quietSession(sessionId, new Date(Date.now() - 120_000), takenIdentity),
  ]);
  await openTakenBacklog(page, launchJourney);
  const board = sessionFollowUpPage(page);
  const taken = board.taken(takenStory);
  const history = await board.showDoneHistory(taken);
  const entry = board.session(history, "Ad hoc session");

  await expect(openTerminalControl(entry)).toBeVisible();
  await expect(board.followUp(entry, quietTitle)).toHaveCount(0);

  dashboard.claudeSessionBecomes(sessionId, "forgotten");
  await page.reload();
  await board.showDoneHistory(taken);
  await expect(board.followUp(entry, quietTitle)).toBeVisible();
  await expect(openTerminalControl(entry)).toHaveCount(0);
  await board.followUp(entry, quietTitle).click();
  const { dialog } = board;
  await expect(dialog).toContainText(`Follows up ${quietTitle}`);
  await expect(board.context).toHaveText([
    "Workflow: Ad hoc",
    `Story: ${takenIdentity}`,
    `Original request: ${quietTitle}`,
    "Final report: No final report was submitted.",
  ]);

  dashboard.claudeScenario("launched");
  await board.submit(" \t\n ");

  await expect(board.openedSessions(taken)).toHaveCount(1, {
    timeout: launchWaitMs,
  });
  // The context is not typed text: the terminal opens with the keyboard.
  await expect(terminalScreenParts(terminalPanel(page)).input).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(sidePanelContents(page)).toHaveAccessibleName("Terminal");
  const [started] = dashboard.claudeLaunches();
  expect(started?.name).toMatch(
    /^Open Dough · Ad hoc · \d{1,2} \w{3}, \d\d:\d\d$/,
  );
  expectFollowUpInput(
    dashboard,
    sessionId,
    takenIdentity,
    followUpContextOf(quietTitle, [
      "- Workflow: Ad hoc",
      `- Story: ${takenIdentity}`,
      `- Original request: ${quietTitle}`,
      "- Final report: No final report was submitted.",
    ]),
  );
  await expect(sessionStateOf(entry)).toHaveText("Done");
});

function expectFollowUpInput(
  dashboard: DashboardServer,
  sourceSessionId: string,
  storyIdentity: string,
  instruction: string,
) {
  const records = stored(dashboard.home);
  expect(records).toHaveLength(2);
  const record = records.find(
    ({ session }) => session.sessionId !== sourceSessionId,
  );
  if (record === undefined)
    throw new Error("Missing the new follow-up record.");
  expect(record.request).toMatchObject({ storyIdentity });
  expect(dashboard.claudeListing()).toContainEqual(
    expect.objectContaining({ sessionId: record.session.sessionId }),
  );
  expectAdHocReportingInput(
    dashboard.claudeLaunches()[0]?.instruction ?? "",
    instruction,
    record.request,
    dashboard,
  );
}
