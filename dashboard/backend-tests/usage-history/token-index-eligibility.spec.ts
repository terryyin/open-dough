// Unpriced tasks are counted; missing usage stays partial and out of the median.
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import { writeUsageHistory } from "../../server/usageHistory.ts";
import { deriveUsageTaskSummary } from "../../server/usageTaskSummary.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";

const project = makeMe.aPublishedSource.openDough.please();
const reading = {
  projects: new Map([[project.id, project.label]]),
  launches: new Map(),
  tariff: codexTariff,
  checkedAt: null,
};
const day = (date: number) =>
  `2026-11-${String(date).padStart(2, "0")}T12:00:00.000Z`;

test("standard and unrecorded tiers are priced; a fast worker leaves the entire task unpriced", () => {
  const tasks = [
    makeMe.aSummaryTask
      .identifiedAs("standard")
      .withUsage({ tier: "default" })
      .please(),
    makeMe.aSummaryTask.identifiedAs("unrecorded").please(),
    makeMe.aSummaryTask
      .identifiedAs("fast-worker")
      .withUsage({ tier: "default" })
      .withUsage({ root: false, tier: "fast" })
      .please(),
  ];
  const answer = tokenIndexCohort(
    makeMe.aUsageTaskSummary.with({ tasks }).please(),
    reading,
    defaultCohort,
  );
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    ["standard", 1_950],
    ["unrecorded", 1_950],
  ]);
  expect(answer.unpriced).toBe(1);
});

test("an unrated worker model is estimated at the reference rates beside its rated root, kept under the root's model", () => {
  const mixed = makeMe.aSummaryTask
    .identifiedAs("mixed")
    .withUsage({ model: "gpt-6-astra" })
    .withUsage({
      root: false,
      model: "gpt-9-nova",
      responses: 2,
      tokens: { uncachedInput: 2_000, cacheRead: 18_000, output: 200 },
    })
    .please();
  const summary = makeMe.aUsageTaskSummary.with({ tasks: [mixed] }).please();
  const [task] = tokenIndexCohort(summary, reading, {
    ...defaultCohort,
    model: "gpt-6-astra",
  }).tasks;
  // The Astra root is 12,000 and the two worker responses are 1,950 each
  // using GPT-6.1 Sol rates.
  expect(task?.index).toBe(15_900);
  expect(task?.observed.model?.id).toBe("gpt-6-astra");
  expect(task?.substitutions).toEqual([
    {
      model: { id: "gpt-9-nova", name: "gpt-9-nova" },
      substitute: { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
    },
  ]);
});

test("a wholly estimated complete task plots without joining the ten-task rolling median", () => {
  const exact = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((date) =>
    makeMe.aSummaryTask
      .identifiedAs(`exact-${date}`)
      .endedAt(day(date))
      .please(),
  );
  const estimated = makeMe.aSummaryTask
    .identifiedAs("estimated")
    .endedAt(day(10))
    .withUsage({ model: "gpt-9-nova" })
    .please();
  const answer = tokenIndexCohort(
    makeMe.aUsageTaskSummary.with({ tasks: [...exact, estimated] }).please(),
    reading,
    defaultCohort,
  );
  expect(answer.tasks).toHaveLength(10);
  expect(answer.tasks.at(-1)?.coverage).toEqual({ kind: "measured" });
  expect(answer.average).toEqual([]);
});

test("only measured and priced tasks, including a measured zero, fill the ten-task rolling median window", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "token-index-gaps-"));
  onTestFinished(() => rm(directory, { recursive: true, force: true }));
  const store = path.join(directory, "usage.json");
  const eligibleDays = [1, 3, 5, 7, 9, 10, 11, 12, 13, 14, 15];
  const eligible = eligibleDays.map((date, at) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`eligible-${date}`)
      .endedAt(day(date))
      .withResponse({
        tokens:
          at === 0
            ? { uncachedInput: 0, cacheRead: 0, output: 0 }
            : { uncachedInput: 1_000, cacheRead: 9_000, output: 100 * at },
      })
      .please(),
  );
  const history = makeMe.aUsageHistory
    .with({
      tasks: [
        ...eligible,
        makeMe.aUsageTaskHistory
          .identifiedAs("worker-missing")
          .endedAt(day(2))
          .withWorkerGaps("missing-worker-evidence")
          .please(),
        makeMe.aUsageTaskHistory
          .identifiedAs("counts-missing")
          .endedAt(day(4))
          .withResponse({
            tokens: { uncachedInput: 1_000, cacheRead: 9_000, output: null },
          })
          .please(),
        makeMe.aUsageTaskHistory
          .identifiedAs("unattributed")
          .endedAt(day(6))
          .please(),
        makeMe.aUsageTaskHistory
          .identifiedAs("no-response")
          .endedAt(day(8))
          .withoutResponses()
          .please(),
        makeMe.aUsageTaskHistory
          .identifiedAs("unpriced")
          .endedAt(day(8))
          .withResponse({ serviceTier: "fast" })
          .please(),
        makeMe.aUsageTaskHistory
          .identifiedAs("other-task")
          .withoutResponses()
          .please(),
      ],
    })
    .please();
  const stray = makeMe.aUsageObservation
    .with({
      sessionId: "unattributed",
      responseId: "stray",
      tokens: { uncachedInput: 1_000, cacheRead: 9_000, output: 100 },
    })
    .please();
  const ambiguous = makeMe.aUsageAssociation
    .ambiguousAmong({
      observation: stray,
      tasks: [{ id: "unattributed" }, { id: "other-task" }],
    })
    .please();
  await writeUsageHistory(
    {
      ...history,
      observations: [...history.observations, stray],
      associations: [...history.associations, ambiguous],
    },
    store,
  );
  const answer = tokenIndexCohort(
    await deriveUsageTaskSummary(store),
    reading,
    defaultCohort,
  );

  expect(
    Object.fromEntries(answer.tasks.map(({ id, coverage }) => [id, coverage])),
  ).toMatchObject({
    "worker-missing": { kind: "partial", gaps: ["missing-worker-evidence"] },
    "counts-missing": { kind: "partial", gaps: ["missing-token-components"] },
    unattributed: { kind: "partial", gaps: ["unresolved-task-association"] },
    "no-response": {
      kind: "partial",
      gaps: ["no-attributable-response-usage"],
    },
    "eligible-1": { kind: "measured" },
  });
  expect(answer.tasks.find(({ id }) => id === "eligible-1")?.index).toBe(0);
  expect(
    answer.tasks
      .filter(({ coverage }) => coverage.kind === "measured")
      .map(({ id }) => id),
  ).toEqual(eligibleDays.map((date) => `eligible-${date}`));
  expect(answer.average).toEqual([
    { at: day(14), task: "eligible-14", value: 3_700 },
    { at: day(15), task: "eligible-15", value: 4_200 },
  ]);
  expect(answer.unpriced).toBe(1);
});

test("median observations at a tied completion time each name their own eligible task, in task ID order", () => {
  const task = (id: string, date: number) =>
    makeMe.aSummaryTask.identifiedAs(id).endedAt(day(date)).please();
  const earlier = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((date) =>
    task(`earlier-${date}`, date),
  );
  const answer = tokenIndexCohort(
    makeMe.aUsageTaskSummary
      .with({ tasks: [...earlier, task("tied-b", 10), task("tied-a", 10)] })
      .please(),
    reading,
    defaultCohort,
  );
  expect(answer.average).toEqual([
    { at: day(10), task: "tied-a", value: 1_950 },
    { at: day(10), task: "tied-b", value: 1_950 },
  ]);
});
