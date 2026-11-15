// How a cohort's specific Model and Effort select finished dashboard Codex
// tasks (../../server/tokenIndexCohort.ts) from a summary derived from a usage
// store: a task's primary observed setting is the value most of its root
// conversation's responses ran with, counted by response; workers do not
// decide it; a tie leaves it unknown, so the task appears only under the
// broad option; and the options are the primary settings the finished tasks
// show in every launch workflow. The page's journey is
// ../../../e2e/configuration/system-settings-usage-cohort.spec.ts.
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
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import {
  defaultCohort,
  type TokenIndexCohort,
} from "../../src/usageTokenIndex.ts";

const sol = "gpt-6.1-sol";
const astra = "gpt-6-astra";
const small = { uncachedInput: 100, cacheRead: 1_000, output: 10 };
const large = { uncachedInput: 90_000, cacheRead: 900_000, output: 9_000 };

let home: string;
test.beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "dough-usage-cohort-"));
});
test.afterEach(() => {
  rmSync(home, { recursive: true, force: true });
});

// A finished Codex launch of Open Dough from the dashboard, ended on `day`.
function finished(
  id: string,
  workflow: string,
  day: number,
  responses: readonly {
    readonly model: string;
    readonly effort: string;
    readonly worker?: true;
    readonly tokens: typeof small;
  }[],
) {
  return {
    task: {
      id,
      kind: "launch" as const,
      origin: "dashboard" as const,
      project: "open-dough",
      workflow,
      outcome: {
        kind: "reported-complete" as const,
        at: `2026-11-${String(day).padStart(2, "0")}T12:00:00.000Z`,
      },
    },
    responses,
  };
}

test("a specific model or effort keeps the tasks whose root responses mostly ran with it, and the options span every workflow's finished tasks", async () => {
  const tasks = [
    finished("mostly-astra", "refinement", 1, [
      { model: astra, effort: "high", tokens: small },
      { model: astra, effort: "high", tokens: small },
      { model: sol, effort: "high", tokens: small },
    ]),
    finished("sol-with-astra-workers", "refinement", 2, [
      { model: sol, effort: "medium", tokens: small },
      { model: astra, effort: "high", worker: true, tokens: small },
      { model: astra, effort: "high", worker: true, tokens: small },
    ]),
    finished("model-tie", "refinement", 3, [
      { model: sol, effort: "high", tokens: small },
      { model: astra, effort: "high", tokens: small },
    ]),
    // One large Astra response against two small Sol ones.
    finished("counted-by-response", "refinement", 4, [
      { model: astra, effort: "xhigh", tokens: large },
      { model: sol, effort: "xhigh", tokens: small },
      { model: sol, effort: "xhigh", tokens: small },
    ]),
    finished("effort-tie", "refinement", 5, [
      { model: sol, effort: "xhigh", tokens: small },
      { model: sol, effort: "max", tokens: small },
    ]),
    finished("execution", "execution", 6, [
      { model: sol, effort: "ultra", tokens: small },
    ]),
  ];
  const store = usageHistoryFile(home);
  await writeUsageHistory(makeMe.aUsageHistory.with({ tasks }).please(), store);
  const summary = await deriveUsageTaskSummary(store);
  const cohort = (choice: Partial<TokenIndexCohort>) =>
    tokenIndexCohort(
      summary,
      {
        projects: new Map([["open-dough", "Open Dough"]]),
        launches: new Map(),
        tariff: codexTariff,
      },
      { ...defaultCohort, workflow: "refinement", ...choice },
    );
  const ids = (choice: Partial<TokenIndexCohort>) =>
    cohort(choice).tasks.map((task) => task.id);

  expect(ids({})).toEqual([
    "mostly-astra",
    "sol-with-astra-workers",
    "model-tie",
    "counted-by-response",
    "effort-tie",
  ]);
  expect(ids({ model: astra })).toEqual(["mostly-astra"]);
  expect(ids({ model: sol })).toEqual([
    "sol-with-astra-workers",
    "counted-by-response",
    "effort-tie",
  ]);
  expect(ids({ effort: "high" })).toEqual(["mostly-astra", "model-tie"]);
  expect(ids({ effort: "xhigh" })).toEqual(["counted-by-response"]);
  expect(ids({ model: sol, effort: "medium" })).toEqual([
    "sol-with-astra-workers",
  ]);
  expect(ids({ workflow: "execution", effort: "ultra" })).toEqual([
    "execution",
  ]);

  const { options } = cohort({ model: astra });
  expect(options.models.map((model) => model.id)).toEqual([sol, astra]);
  expect(options.efforts).toEqual(["high", "medium", "ultra", "xhigh"]);
});
