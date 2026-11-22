// A Refresh counts the turns after a developer reply in a dashboard launch's
// Claude Code session into the launch, as an import does, once the session
// goes on after the launch was imported.
import { recordUsageCheck } from "../../server/usageCheck.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import {
  claudeLaunch,
  claudeSession,
  importClaude,
  launchIn,
  refreshedClaudeIndex,
  writeLaunchSession,
  writeWorker,
} from "../../test-support/usage-history/claudeReplyLaunch.ts";
import {
  expect,
  test,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

// Imports the launch's session with only its launch turn answered, then lets
// the session go on as `rows` and Refreshes: each task's index.
async function refreshedIndex(
  machine: Parameters<typeof usageServer>[0],
  rows: object[],
  launches = [claudeLaunch],
) {
  importClaude(machine.home, claudeSession().please(), launches);
  writeLaunchSession(machine.home, rows);
  return refreshedClaudeIndex(machine);
}

test("Refresh counts a reply read late, the worker it starts after the last check, each response once", async ({
  machine,
}) => {
  const { home } = machine;
  importClaude(home, claudeSession().please());
  writeLaunchSession(home, claudeSession().withDeveloperReply().please());
  // A check past the reply, as a Refresh that read the launch before it
  // finished leaves it.
  await recordUsageCheck(usageHistoryFile(home), new Date().toISOString());
  writeWorker(home);
  writeLaunchSession(
    home,
    claudeSession()
      .withDeveloperReply()
      .withWorkerResult({ agentId: "worker" })
      .please(),
  );
  const usage = await usageServer(machine);
  const points = [];
  for (let check = 0; check < 3; check++) {
    await usage.refresh();
    const chart = await usage.chart("?tool=claude");
    points.push(
      chart.tasks.map(({ identity, index, coverage }) => [
        identity,
        index,
        coverage.kind,
      ]),
    );
  }
  // Launch response 1,950, reply response 2,950 and worker 1,950.
  const corrected = [["SEED-7#claude", 6_850, "measured"]];
  expect(points).toEqual([corrected, corrected, corrected]);
});

test("Refresh leaves a typed landing after a reply and its later replies out of the launch", async ({
  machine,
}) => {
  const index = await refreshedIndex(
    machine,
    claudeSession()
      .withDeveloperReply()
      .withUser({ uuid: "land", content: "/dough-land" })
      .withCountedOpusResponse({ uuid: "landing", outputTokens: 700 })
      .withUser({ uuid: "ok", content: "ok" })
      .withCountedOpusResponse({ uuid: "after-ok", outputTokens: 900 })
      .please(),
  );
  // Launch response 1,950 and reply response 2,950.
  expect(index).toEqual([["SEED-7#claude", 4_900]]);
});

test("Refresh gives another launch's reporting context after a reply its own turns", async ({
  machine,
}) => {
  const second = "ca7430bd-0d52-499d-a1bd-000000000002";
  const index = await refreshedIndex(
    machine,
    claudeSession()
      .withDeveloperReply()
      .withLaunchInput({ uuid: "second-launch", reference: second })
      .withCountedOpusResponse({ uuid: "second-first", outputTokens: 700 })
      .withUser({ uuid: "ok", content: "ok" })
      .withCountedOpusResponse({ uuid: "after-ok", outputTokens: 900 })
      .please(),
    [
      claudeLaunch,
      launchIn("SEED-7#second", second, "2026-11-14T09:30:00.000Z"),
    ],
  );
  // The first: 1,950 + 2,950; the second: 4,950 + 5,950.
  expect(Object.fromEntries(index)).toEqual({
    "SEED-7#claude": 4_900,
    "SEED-7#second": 10_900,
  });
});
