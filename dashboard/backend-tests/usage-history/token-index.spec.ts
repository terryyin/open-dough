import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readTokenIndex,
  tokenIndexAnswer,
} from "../../server/tokenIndexRead.ts";
import { writeUsageHistory } from "../../server/usageHistory.ts";
import {
  summaryFormat,
  usageTaskSummaryFile,
} from "../../server/usageTaskSummary.ts";
import { currentUsageTaskSummary } from "../../server/usageTaskSummaryCache.ts";
import { codexTariff, usageTariffs } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";

const openDough = makeMe.aPublishedSource.openDough.please();

test("the default chart weighs roots and workers for all configured projects", async () => {
  const hidden = makeMe.aConfiguredProject
    .with({
      id: "doughnut",
      label: "Doughnut",
      repository: "nerds-odd-e/doughnut",
      localPath: "~/git/doughnut",
      hidden: true,
    })
    .please();
  const hiddenTaskEnd = "2026-11-02T12:00:00.000Z";
  const checkedAt = "2026-11-03T12:00:00.000Z";
  const summary = makeMe.aUsageTaskSummary
    .with({
      tasks: [
        makeMe.aSummaryTask.identifiedAs("single").please(),
        makeMe.aSummaryTask
          .identifiedAs("with-worker")
          .endedAt(hiddenTaskEnd)
          .with({ project: hidden.id, outcome: null })
          .withUsage({
            tokens: { uncachedInput: 2_000, cacheRead: 3_000, output: 40 },
          })
          .withUsage({
            tokens: {
              uncachedInput: 500,
              cacheWrite: 200,
              cacheRead: 1_000,
              output: 60,
            },
          })
          .withUsage({
            root: false,
            model: "gpt-6-astra",
            tokens: { uncachedInput: 300, cacheRead: 700, output: 20 },
          })
          .please(),
        makeMe.aSummaryTask
          .identifiedAs("retired")
          .with({ project: "retired-project" })
          .please(),
      ],
    })
    .please();

  const answer = await readTokenIndex("GET", new URLSearchParams(), (tool) => ({
    summary,
    projects: [openDough, hidden],
    launches: new Map([
      ["with-worker", { outcome: null, doneAt: hiddenTaskEnd }],
    ]),
    tariff: usageTariffs[tool],
    checkedAt,
  }));
  expect(answer.cohort).toEqual({
    tool: "codex",
    workflow: "execution",
    model: null,
    effort: null,
  });
  expect(
    answer.tasks.map(({ id, index, project }) => [id, index, project.label]),
  ).toEqual([
    ["single", 1_950, openDough.label],
    ["with-worker", 5_750, hidden.label],
  ]);
  expect(answer.tariff.version).toBe(codexTariff.version);
  expect(answer.checkedAt).toBe(checkedAt);
});

test("a stale summary rebuilds from usage history without rewriting the store", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "token-index-"));
  onTestFinished(() => rm(directory, { recursive: true, force: true }));
  const store = path.join(directory, "usage.json");
  await writeUsageHistory(
    makeMe.aUsageHistory
      .with({
        tasks: [
          makeMe.aUsageTaskHistory
            .identifiedAs("dashboard")
            .withResponse({
              tokens: {
                uncachedInput: 1_000,
                cacheRead: 9_000,
                output: 100,
                reasoningOutput: 45,
              },
            })
            .please(),
          ...(["native", "unknown"] as const).map((origin) =>
            makeMe.aUsageTaskHistory
              .identifiedAs(origin)
              .withTask({ origin })
              .please(),
          ),
        ],
      })
      .please(),
    store,
  );
  const cacheFile = usageTaskSummaryFile(store);
  const stale = makeMe.aUsageTaskSummary
    .with({
      format: summaryFormat,
      store: "old-store",
      tasks: [makeMe.aSummaryTask.identifiedAs("old-task").please()],
    })
    .please();
  await writeFile(cacheFile, JSON.stringify(stale));
  const before = await readFile(store);

  const summary = await currentUsageTaskSummary(store);
  const answer = tokenIndexAnswer(
    {
      summary,
      projects: [openDough],
      launches: new Map(),
      tariff: codexTariff,
      checkedAt: null,
    },
    defaultCohort,
  );
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    ["dashboard", 1_950],
  ]);
  expect(JSON.parse(await readFile(cacheFile, "utf8"))).toEqual(summary);
  expect(await readFile(store)).toEqual(before);
});

test("finished GPT-6.2 Sol and Astra tasks have a priced Token index point", () => {
  const summary = makeMe.aUsageTaskSummary
    .with({
      tasks: [
        makeMe.aSummaryTask
          .identifiedAs("sol")
          .withUsage({ model: "gpt-6.2-sol", tier: "default" })
          .please(),
        makeMe.aSummaryTask
          .identifiedAs("astra")
          .withUsage({ model: "gpt-6.2-astra", tier: "default" })
          .please(),
      ],
    })
    .please();

  const { tasks } = tokenIndexAnswer(
    {
      summary,
      projects: [openDough],
      launches: new Map(),
      tariff: codexTariff,
      checkedAt: null,
    },
    defaultCohort,
  );
  expect(
    Object.fromEntries(
      tasks.map(({ id, index, observed }) => [
        id,
        [observed.model?.name, index],
      ]),
    ),
  ).toEqual({
    sol: ["GPT-6.2 Sol", 1_950],
    astra: ["GPT-6.2 Astra", 7_800],
  });
});

test("a new tariff reweighs the same summary counters", () => {
  const summary = makeMe.aUsageTaskSummary
    .with({ tasks: [makeMe.aSummaryTask.please()] })
    .please();
  const tariff = {
    ...codexTariff,
    version: "later",
    models: {
      "gpt-6.1-sol": {
        name: "GPT-6.1 Sol",
        input: 100,
        cachedInput: 10,
        output: 400,
      },
    },
  };

  const answer = tokenIndexAnswer(
    {
      summary,
      projects: [openDough],
      launches: new Map(),
      tariff,
      checkedAt: null,
    },
    defaultCohort,
  );
  expect(answer.tasks.map(({ index }) => index)).toEqual([2_300]);
});

test.each([
  { method: "GET", query: "workflow=planning", status: 400 },
  { method: "GET", query: "tool=cursor", status: 400 },
  { method: "POST", query: "", status: 405 },
])(
  "refuses $method $query before reading usage",
  async ({ method, query, status }) => {
    const load = vi.fn<() => never>();

    await expect(
      readTokenIndex(method, new URLSearchParams(query), load),
    ).rejects.toMatchObject({ status });
    expect(load).not.toHaveBeenCalled();
  },
);
