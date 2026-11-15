// The Claude Code cohort's population and moving average follow the Codex
// cohort's rules. Default Claude task responses run Claude Opus 5.5 (Anthropic
// API list prices read 2026-11-15: input $4, cache read $0.20, output $20 per
// 1M tokens), so 1,000 uncached, 9,000 read and O output tokens weigh
// (1,000×4 + 9,000×0.20 + O×20) / 4 = 1,450 + 5×O Opus 5.5 input tokens.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedUsageTasks } from "../../server/retainedUsageTasks.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import { keepRetainedLaunch } from "../../tests/usage-history/importHarness.ts";
import {
  day,
  expect,
  readCohort,
  test,
  usageServer,
  writeTaskUsage,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const launch = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: "SEED-7#claude-story", title: "Claude story" })
    .inClaudeSession({ sessionId })
    .launchedAt(day(2));

test("retained, Done-marked and recovered Claude dashboard tasks are each their own point, and a running launch is not", async ({
  machine,
}) => {
  keepRetainedLaunch(
    machine.home,
    launch("aged-out").markedDoneAt(day(4)).please(),
  );
  keepLaunchStore(machine.home, {
    "open-dough": [
      launch("done").markedDoneAt(day(5)).please(),
      launch("running").please(),
    ],
  });
  const imported = await retainedUsageTasks(machine.home);
  await writeTaskUsage(machine.home, [
    ...imported.map((task) =>
      makeMe.aUsageTaskHistory
        .inClaudeCode()
        .withTask({ ...task, lastActivityAt: day(9) })
        .endedAt(day(9))
        .please(),
    ),
    makeMe.aUsageTaskHistory
      .identifiedAs("recovered")
      .inClaudeCode()
      .recovered()
      .endedAt(day(10))
      .please(),
  ]);
  const usage = await usageServer(machine);
  const sessionOf = (id: string) =>
    imported.find((task) => task.id === id)?.sessionId ?? id;

  const answer = await usage.chart("?tool=claude");
  expect(
    answer.tasks
      .map(({ id, endedAt, index }) => [sessionOf(id), endedAt, index])
      .toSorted(),
  ).toEqual([
    // 1,450 + 5×100 each.
    ["aged-out", day(9), 1_950],
    ["done", day(9), 1_950],
    ["recovered", day(10), 1_950],
  ]);
});

test("the Claude Code moving average spans its ten latest eligible tasks, leaving an unpriced fast task out", async ({
  machine,
}) => {
  const priced = [...Array<number>(10).keys()].map((at) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`priced-${String(at + 1).padStart(2, "0")}`)
      .inClaudeCode()
      .endedAt(day(at + 1))
      .withResponse({
        tokens: {
          uncachedInput: 1_000,
          cacheRead: 9_000,
          output: 100 * (at + 1),
        },
      })
      .please(),
  );
  const fast = makeMe.aUsageTaskHistory
    .identifiedAs("fast")
    .inClaudeCode()
    .endedAt(day(5))
    .withResponse({ serviceTier: "fast" })
    .please();
  const cohort = await readCohort(
    machine.home,
    makeMe.aUsageHistory.with({ tasks: [...priced, fast] }).please(),
  );

  const answer = cohort({ tool: "claude" });
  expect(answer.unpriced).toBe(1);
  // Indices 1,950, 2,450, … 6,450 (1,450 + 500×k for k = 1…10):
  // their mean is 1,450 + 500×5.5 = 4,200.
  expect(answer.average).toEqual([{ at: day(10), value: 4_200 }]);
});
