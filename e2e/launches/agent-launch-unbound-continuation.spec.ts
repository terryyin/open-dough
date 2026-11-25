import { mkdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { openDoughFolder } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import { keepHistoricalClaudeStart } from "../../dashboard/test-support/historicalClaudeRecovery.ts";
import { openTakenBacklog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  continueAdHocRecovery,
  loseNextContinueReply,
} from "../../dashboard/test-support/responsiveRecovery.ts";
import { keptAttempts } from "../../dashboard/test-support/acceptedAttempts.ts";
import {
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  expectTerminalText,
  terminalPanel,
} from "../../dashboard/test-support/terminalScreenPage.ts";

test.use({ projectFolders: ["open-dough"] });

test("Startup recovery opens the original historical Claude conversation without adding a Board session", async ({
  dashboard,
  page,
  launchJourney,
}) => {
  const workspace = path.join(openDoughFolder(dashboard), "retained");
  mkdirSync(workspace);
  const { attempt, sessionId } = await keepHistoricalClaudeStart(
    dashboard,
    workspace,
  );
  await openTakenBacklog(page, launchJourney);
  const { taken, recentlyDone, startupRecovery } = parts(page);
  await expect(startupRecovery).toContainText("Startup needs reconciliation");

  await loseNextContinueReply(page);
  await continueAdHocRecovery(page);
  await expect(startupRecovery).toContainText("could not be reached");
  const [settled] = keptAttempts(dashboard);
  expect(settled).toMatchObject({
    id: attempt.id,
    outcome: { kind: "launched", session: { host: "claude", sessionId } },
  });
  expect(dashboard.claudeAttaches()).toEqual([]);
  await page.reload();
  await continueAdHocRecovery(page);

  await expectTerminalText(terminalPanel(page), "attached");
  expect(dashboard.claudeAttaches()).toEqual([
    expect.objectContaining({ id: sessionId.slice(0, 8), lines: [] }),
  ]);
  expect(
    dashboard.claudeCalls().find(({ argv }) => argv[0] === "attach"),
  ).toEqual({
    argv: ["attach", sessionId.slice(0, 8)],
    cwd: realpathSync(workspace),
  });
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(keptAttempts(dashboard)).toEqual([settled]);
  await expect(sessionEntriesIn(taken)).toHaveCount(0);
  await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
});
