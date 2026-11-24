import { rmSync } from "node:fs";
import { costViews } from "../../test-support/usage-history/agentEffortCost.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { writeCodexSession } from "../../test-support/usage-history/importHarness.ts";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";

test("a stored-only worker leaves its peak unavailable without qualifying the retained coordinator maximum", async ({
  home,
  root,
}) => {
  keepLaunchStore(home, { "open-dough": [launch("root", "turn")] });
  const usage = {
    input_tokens: 100,
    cached_input_tokens: 60,
    cache_write_input_tokens: 10,
    output_tokens: 5,
  };
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("root")
      .withResponse("turn", "own", usage)
      .please(),
  );
  const workerFile = writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("worker")
      .spawnedFrom("root")
      .withResponse("work", "work", usage, { rootTurnId: "turn" })
      .please(),
  );
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  await importUsageHistory(options);
  rmSync(workerFile);
  const {
    json: actual,
    readable,
    stated,
  } = costViews(home, [
    "--task",
    "SEED-358#reconstruct-codex-and-claude-code-usage-history",
  ]);
  expect(readable).toEqual(stated);
  expect(
    actual.agents.find((agent) => agent.sessionId === "root"),
  ).toMatchObject({
    peakInput: { value: 100, status: "observed-maximum" },
  });
  expect(
    actual.agents.find((agent) => agent.sessionId === "worker"),
  ).toMatchObject({
    provenance: "stored-session-contribution",
    peakInput: { value: null, status: "unavailable" },
    totals: { totalInput: { value: 100, status: "partial" } },
  });
  expect(actual.totals.totalInput).toMatchObject({
    value: 200,
    status: "partial",
  });
  expect(actual.gaps).toEqual(
    expect.arrayContaining([
      "native-files-unavailable",
      "stored-ownership-and-agent-detail-unavailable",
      "stored-counter-time-coverage-unknown",
    ]),
  );
});
