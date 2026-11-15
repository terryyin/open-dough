// Pricing and read-only/rebuildable derivation at the real usage HTTP boundary.
import { rmSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageTaskSummaryFile } from "../../server/usageTaskSummary.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import {
  configureProjects,
  expect,
  readCohort,
  storeHashes,
  test,
  usageServer,
  writeTaskUsage,
} from "../../tests/usage-history/tokenIndexHarness.ts";

const sol = "gpt-6.1-sol",
  astra = "gpt-6-astra";

test("configured dashboard tasks weigh roots and workers without modifying the store, even when rebuilding its summary", async ({
  machine,
}) => {
  configureProjects(machine.home, [
    makeMe.aConfiguredProject
      .with({
        id: "open-dough",
        label: "Open Dough",
        repository: "terryyin/open-dough",
        localPath: "~/git/open-dough",
      })
      .please(),
    makeMe.aConfiguredProject
      .with({
        id: "doughnut",
        label: "Doughnut",
        repository: "nerds-odd-e/doughnut",
        localPath: "~/git/doughnut",
        hidden: true,
      })
      .please(),
  ]);
  const tasks = [
    makeMe.aUsageTaskHistory.identifiedAs("single").please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("with-worker")
      .withTask({ project: "doughnut" })
      .endedAt("2026-11-02T12:00:00.000Z")
      .withResponse({
        tokens: { uncachedInput: 2_000, cacheRead: 3_000, output: 40 },
      })
      // Cache writes join uncached input; reasoning is already included in output.
      .withResponse({
        turnId: "resumed",
        tokens: {
          uncachedInput: 500,
          cacheWrite: 200,
          cacheRead: 1_000,
          output: 60,
          reasoningOutput: 45,
        },
      })
      .withWorkerResponse({
        model: astra,
        tokens: { uncachedInput: 300, cacheRead: 700, output: 20 },
      })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("retired")
      .withTask({ project: "retired-project" })
      .please(),
    ...(["native", "unknown"] as const).map((origin) =>
      makeMe.aUsageTaskHistory
        .identifiedAs(origin)
        .withTask({ origin })
        .please(),
    ),
  ];
  const store = await writeTaskUsage(machine.home, tasks);
  const before = storeHashes(store);
  const usage = await usageServer(machine);

  const answer = await usage.chart();
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    ["single", 1_950],
    ["with-worker", 5_750],
  ]);
  expect(answer.tariff.version).toBe("codex-2026-11-15");
  expect(storeHashes(store)).toEqual(before);
  rmSync(usageTaskSummaryFile(store));
  expect((await usage.chart()).tasks).toEqual(answer.tasks);
  expect(storeHashes(store)).toEqual(before);
});

test("a new tariff reweighs the same stored counters", async ({ machine }) => {
  const history = makeMe.aUsageHistory
    .with({ tasks: [makeMe.aUsageTaskHistory.please()] })
    .please();
  const cohort = await readCohort(machine.home, history, {
    ...codexTariff,
    version: "later",
    models: {
      [sol]: { name: "GPT-6.1 Sol", input: 100, cachedInput: 10, output: 400 },
    },
  });
  expect(cohort().tasks.map(({ index }) => index)).toEqual([2_300]);
});

test("an unknown launch workflow is refused", async ({ machine }) => {
  const usage = await usageServer(machine);
  const response = await usage.request(
    "GET",
    "/__usage/token-index?workflow=planning",
  );
  expect(response.status, JSON.stringify(response.body)).toBe(400);
});
