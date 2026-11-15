// Which finished dashboard Codex tasks a cohort (../../server/tokenIndexCohort.ts)
// plots and averages, from a summary derived from a usage store: a task with
// a response the tariff has no rate for, an unknown model or a speed tier it
// does not price, has no point and is counted unpriced, while a response
// recorded at the tariff's own tier or with none is priced at it; a task
// whose recorded gaps show usage missing keeps its point, partial with those
// gaps, and stays out of the moving average; a measured zero is an eligible
// zero point. The page's journey is
// ../../../e2e/configuration/system-settings-usage-coverage.spec.ts.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import {
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import type { UsageTokens } from "../../server/usageRecords.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";

const sol = "gpt-6.1-sol";
const tokens = { uncachedInput: 1_000, cacheRead: 9_000, output: 100 };

let home: string;
test.beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "dough-usage-eligibility-"));
});
test.afterEach(() => {
  rmSync(home, { recursive: true, force: true });
});

// A finished Codex Execution launch of Open Dough from the dashboard, ended
// on day `day` of November, with its responses and any worker gaps.
function finished(
  id: string,
  day: number,
  responses: readonly {
    readonly model: string;
    readonly serviceTier?: string;
    readonly worker?: true;
    readonly tokens: Partial<UsageTokens>;
  }[],
  workerGaps: readonly string[] = [],
) {
  return {
    task: {
      id,
      kind: "launch" as const,
      origin: "dashboard" as const,
      project: "open-dough",
      workflow: "execution",
      outcome: {
        kind: "reported-complete" as const,
        at: `2026-11-${String(day).padStart(2, "0")}T12:00:00.000Z`,
      },
    },
    responses,
    workerGaps,
  };
}

async function executionCohort(
  history: ReturnType<ReturnType<typeof makeMe.aUsageHistory.with>["please"]>,
) {
  const store = usageHistoryFile(home);
  await writeUsageHistory(history, store);
  return tokenIndexCohort(
    await deriveUsageTaskSummary(store),
    {
      projects: new Map([["open-dough", "Open Dough"]]),
      launches: new Map(),
      tariff: codexTariff,
    },
    defaultCohort,
  );
}

test("a response the tariff has no rate for leaves its task unpriced, counted without a point, while the tariff's recorded tier or none is priced at it", async () => {
  const answer = await executionCohort(
    makeMe.aUsageHistory
      .with({
        tasks: [
          finished("standard", 1, [
            { model: sol, serviceTier: "default", tokens },
          ]),
          finished("unrecorded", 2, [{ model: sol, tokens }]),
          finished("fast-worker", 3, [
            { model: sol, serviceTier: "default", tokens },
            { model: sol, serviceTier: "fast", worker: true, tokens },
          ]),
          finished("unrated", 4, [{ model: "gpt-5-nova", tokens }]),
        ],
      })
      .please(),
  );

  expect(answer.tasks.map((task) => task.id)).toEqual([
    "standard",
    "unrecorded",
  ]);
  const [standard, unrecorded] = answer.tasks;
  expect(unrecorded?.index).toBe(standard?.index);
  expect(answer.unpriced).toBe(2);
});

test("a task whose recorded gaps show usage missing keeps a partial point with those gaps and stays out of the average, and a measured zero is an eligible zero point", async () => {
  const eligibleDays = [1, 3, 5, 7, 9, 10, 11, 12, 13, 14];
  const eligible = eligibleDays.map((day, at) =>
    finished(`eligible-${String(day)}`, day, [
      {
        model: sol,
        tokens:
          at === 0
            ? { uncachedInput: 0, cacheRead: 0, output: 0 }
            : { ...tokens, output: 100 * at },
      },
    ]),
  );
  const history = makeMe.aUsageHistory
    .with({
      tasks: [
        ...eligible,
        finished(
          "worker-missing",
          2,
          [{ model: sol, tokens }],
          ["missing-worker-evidence"],
        ),
        finished("counts-missing", 4, [
          { model: sol, tokens: { ...tokens, output: null } },
        ]),
        finished("unattributed", 6, [{ model: sol, tokens }]),
        finished("no-response", 8, []),
        // Another task the import could not tell it from.
        { task: { id: "other-task" }, responses: [] },
      ],
    })
    .please();
  // A response the import could not give to one of its candidate tasks.
  const stray = makeMe.aUsageObservation
    .with({ sessionId: "unattributed", responseId: "stray", tokens })
    .please();
  history.observations.push(stray);
  history.associations.push(
    makeMe.aUsageAssociation
      .ambiguousAmong({
        observation: stray,
        tasks: [{ id: "unattributed" }, { id: "other-task" }],
      })
      .please(),
  );

  const answer = await executionCohort(history);

  const coverage = Object.fromEntries(
    answer.tasks.map((task) => [task.id, task.coverage]),
  );
  expect(coverage).toMatchObject({
    "worker-missing": { kind: "partial", gaps: ["missing-worker-evidence"] },
    "counts-missing": { kind: "partial", gaps: ["missing-token-components"] },
    unattributed: { kind: "partial", gaps: ["unresolved-task-association"] },
    "no-response": {
      kind: "partial",
      gaps: ["no-attributable-response-usage"],
    },
    "eligible-1": { kind: "measured" },
  });
  expect(answer.tasks.find((task) => task.id === "eligible-1")?.index).toBe(0);
  const measured = answer.tasks.filter(
    (task) => task.coverage.kind === "measured",
  );
  expect(measured.map((task) => task.id)).toEqual(
    eligible.map(({ task }) => task.id),
  );
  // Only the tenth eligible task completes a window of ten.
  expect(answer.average).toEqual([
    {
      at: eligible.at(-1)?.task.outcome.at,
      value: measured.reduce((sum, task) => sum + task.index, 0) / 10,
    },
  ]);
  expect(answer.unpriced).toBe(0);
});
