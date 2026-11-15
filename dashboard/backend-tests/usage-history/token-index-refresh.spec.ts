// Incremental import, coalescing and failure preservation at the Refresh HTTP boundary.
import {
  appendFileSync,
  cpSync,
  readFileSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { responseKey, type UsageHistory } from "../../server/usageRecords.ts";
import { usageTaskSummaryFile } from "../../server/usageTaskSummary.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import {
  expect,
  test,
  usageServer,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const sol = "gpt-6.1-sol";
const longAgo = new Date("2026-11-01T00:00:00.000Z");
const counters = (output: number) => ({
  input_tokens: 10_000,
  cached_input_tokens: 8_000,
  cache_write_input_tokens: 0,
  output_tokens: output,
});
const finished = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: `SEED-7#${sessionId}`, title: `Story ${sessionId}` })
    .inCodexSession({ sessionId })
    .launchedAt("2026-11-14T09:00:00.000Z")
    .withFirstInput({ state: "confirmed", turnId: `${sessionId}-turn` })
    .completedWith({ message: "" })
    .please();
const rootRollout = (session: string, output: number) =>
  makeMe.aCodexRollout
    .forSession(session)
    .withTurnContext(`${session}-turn`, sol, "xhigh")
    .withResponse(`${session}-turn`, `${session}-${output}`, counters(output));
const assignments = (history: UsageHistory) =>
  Object.fromEntries(
    Object.values(history.associations).map(({ observationId, taskId }) => [
      observationId,
      taskId,
    ]),
  );

test("Refresh reads changed roots and their older workers like a full import; repeats coalesce without rewriting or double-counting", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions"),
    rollouts = path.join(sessions, "2026/11/14");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  const first = writeCodexSession(rollouts, rootRollout("first", 100).please());
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const usage = await usageServer(machine);
  const lastCheck = await usage.refresh();

  // Changed bytes whose mtime predates the check are deliberately not reread.
  const [late] = makeMe.aCodexRollout
    .forSession("first")
    .withResponse("first-turn", "first-late", counters(5))
    .rows();
  appendFileSync(first, `${JSON.stringify(late)}\n`);
  utimesSync(first, longAgo, longAgo);
  keepLaunchStore(home, {
    "open-dough": [finished("first"), finished("second")],
  });
  writeCodexSession(
    rollouts,
    rootRollout("second", 200).withSpawnedAgent("second-worker").please(),
  );
  const worker = writeCodexSession(
    rollouts,
    makeMe.aCodexRollout
      .forSession("second-worker")
      .withParent("second")
      .withTurnContext("worker-turn", sol, "xhigh")
      .withResponse("worker-turn", "worker-own", counters(70), {
        rootTurnId: "second-turn",
      })
      .please(),
  );
  utimesSync(worker, longAgo, longAgo);
  const checkedAt = await usage.refresh();

  expect(Date.parse(checkedAt)).toBeGreaterThan(Date.parse(lastCheck));
  const chart = await usage.chart();
  expect(chart.checkedAt).toBe(checkedAt);
  expect(
    chart.tasks.map(({ identity, coverage }) => [identity, coverage.kind]),
  ).toEqual([
    ["SEED-7#first", "measured"],
    ["SEED-7#second", "measured"],
  ]);
  const refreshed = assignments(readImported(home));
  expect(refreshed).not.toHaveProperty(
    responseKey("codex", "first", "first-late"),
  );
  expect(refreshed[responseKey("codex", "second-worker", "worker-own")]).toBe(
    chart.tasks[1]?.id,
  );

  const imported = path.join(machine.machine, "imported-home");
  cpSync(home, imported, {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith("usage"),
  });
  runImport(imported, path.join(imported, ".codex/sessions"));
  expect(assignments(readImported(imported))).toMatchObject(refreshed);

  const manifest = readFileSync(store),
    summary = readFileSync(usageTaskSummaryFile(store));
  const [again, alongside] = await Promise.all([
    usage.refresh(),
    usage.refresh(),
  ]);
  expect(alongside).toBe(again);
  expect(Date.parse(again)).toBeGreaterThan(Date.parse(checkedAt));
  expect(await usage.chart()).toEqual({ ...chart, checkedAt: again });
  expect(readFileSync(store)).toEqual(manifest);
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);
  runImport(home, sessions);
  expect((await usage.chart()).tasks[1]?.index).toBe(chart.tasks[1]?.index);
});

test("an unreadable store fails Refresh without replacing its summary or check time", async ({
  machine,
}) => {
  const { home } = machine;
  const sessions = path.join(home, ".codex/sessions");
  keepLaunchStore(home, { "open-dough": [finished("first")] });
  writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("first", 9).please(),
  );
  runImport(home, sessions);
  const store = usageHistoryFile(home);
  const usage = await usageServer(machine);
  const checkedAt = await usage.refresh(),
    chart = await usage.chart();
  const manifest = readFileSync(store),
    summary = readFileSync(usageTaskSummaryFile(store));

  writeFileSync(store, "{ not a usage store");
  const failed = await usage.request("POST", "/__usage/refresh");
  expect(failed).toEqual({
    status: 503,
    body: {
      error: `Usage could not be refreshed: Usage history is unreadable: ${store}`,
    },
  });
  expect(readFileSync(usageTaskSummaryFile(store))).toEqual(summary);
  writeFileSync(store, manifest);
  expect(await usage.chart()).toEqual({ ...chart, checkedAt });
});
