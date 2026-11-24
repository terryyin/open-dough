// The Claude Code cohort's population and rolling median follow the Codex
// cohort's rules. Default Claude task responses run Claude Opus 5.5 (Anthropic
// API list prices read 2026-11-15: input $4, cache read $0.20, output $20 per
// 1M tokens), so 1,000 uncached, 9,000 read and O output tokens weigh
// (1,000×4 + 9,000×0.20 + O×20) / 4 = 1,450 + 5×O Opus 5.5 input tokens.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  retainedLaunchEnds,
  retainedUsageTasks,
} from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { writeUsageHistory } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import { keepRetainedLaunch } from "../../test-support/usage-history/importHarness.ts";

const cohort = { ...defaultCohort, tool: "claude" as const };
const reading = {
  projects: [makeMe.aPublishedSource.openDough.please()],
  tariff: usageTariffs.claude,
  checkedAt: null,
};
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;
const launch = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity: "SEED-7#claude-story", title: "Claude story" })
    .inClaudeSession({ sessionId })
    .launchedAt(day(2));

test("retained, Done-marked and recovered Claude dashboard tasks are each their own point, and a running launch is not", async () => {
  const home = await mkdtemp(
    path.join(tmpdir(), "token-index-claude-launches-"),
  );
  onTestFinished(() => rm(home, { recursive: true, force: true }));
  const store = path.join(home, "usage.json");
  keepRetainedLaunch(home, launch("aged-out").markedDoneAt(day(4)).please());
  keepLaunchStore(home, {
    "open-dough": [
      launch("done").markedDoneAt(day(5)).please(),
      launch("running").please(),
    ],
  });
  const imported = await retainedUsageTasks(home);
  const tasks = [
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
  ];
  await writeUsageHistory(makeMe.aUsageHistory.with({ tasks }).please(), store);
  const sessionOf = (id: string) =>
    imported.find((task) => task.id === id)?.sessionId ?? id;

  const answer = tokenIndexAnswer(
    {
      ...reading,
      launches: await retainedLaunchEnds(home),
      summary: await deriveUsageTaskSummary(store),
    },
    cohort,
  );
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

test("the Claude Code rolling median spans its ten latest eligible tasks, leaving an unpriced fast task out", () => {
  const priced = [...Array<number>(10).keys()].map((at) =>
    makeMe.aSummaryTask
      .identifiedAs(`priced-${String(at + 1).padStart(2, "0")}`)
      .with({ host: "claude" })
      .endedAt(day(at + 1))
      .withUsage({
        model: "claude-opus-5-5",
        tier: "standard",
        tokens: { output: 100 * (at + 1) },
      })
      .please(),
  );
  const fast = makeMe.aSummaryTask
    .identifiedAs("fast")
    .with({ host: "claude" })
    .endedAt(day(5))
    .withUsage({ model: "claude-opus-5-5", tier: "fast" })
    .please();
  const summary = makeMe.aUsageTaskSummary
    .with({ tasks: [...priced, fast] })
    .please();

  const answer = tokenIndexAnswer(
    { ...reading, launches: new Map(), summary },
    cohort,
  );
  expect(answer.unpriced).toBe(1);
  // Indices 1,950, 2,450, … 6,450 (1,450 + 500×k for k = 1…10):
  // their median is 1,450 + 500×5.5 = 4,200.
  expect(answer.average).toEqual([
    { at: day(10), task: "priced-10", value: 4_200 },
  ]);
});
