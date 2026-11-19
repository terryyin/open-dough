// Unpriced tasks are counted; missing usage stays partial and out of the median.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  day,
  readCohort,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

test("standard and unrecorded tiers are priced; a fast worker leaves the entire task unpriced", async ({
  home,
}) => {
  const tasks = [
    makeMe.aUsageTaskHistory
      .identifiedAs("standard")
      .withResponse({ serviceTier: "default" })
      .please(),
    makeMe.aUsageTaskHistory.identifiedAs("unrecorded").please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("fast-worker")
      .withResponse({ serviceTier: "default" })
      .withWorkerResponse({ serviceTier: "fast" })
      .please(),
  ];
  const cohort = await readCohort(
    home,
    makeMe.aUsageHistory.with({ tasks }).please(),
  );
  const answer = cohort();
  expect(answer.tasks.map(({ id, index }) => [id, index])).toEqual([
    ["standard", 1_950],
    ["unrecorded", 1_950],
  ]);
  expect(answer.unpriced).toBe(1);
});

test("an unrated worker model is estimated at the reference rates beside its rated root, kept under the root's model", async ({
  home,
}) => {
  const cohort = await readCohort(
    home,
    makeMe.aUsageHistory
      .with({
        tasks: [
          makeMe.aUsageTaskHistory
            .identifiedAs("mixed")
            .withResponse({ model: "gpt-6-astra" })
            .withWorkerResponse({ model: "gpt-9-nova" })
            .withWorkerResponse({ model: "gpt-9-nova" })
            .please(),
        ],
      })
      .please(),
  );
  const [task] = cohort({ model: "gpt-6-astra" }).tasks;
  // Astra root (1,000×250 + 9,000×25 + 100×1,250) / 50 = 12,000, plus two
  // worker groups at GPT-6.1 Sol rates, 1,950 each.
  expect(task?.index).toBe(15_900);
  expect(task?.observed.model?.id).toBe("gpt-6-astra");
  expect(task?.substitutions).toEqual([
    {
      model: { id: "gpt-9-nova", name: "gpt-9-nova" },
      substitute: { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
    },
  ]);
});

test("a wholly estimated complete task plots without joining the ten-task rolling median", async ({
  home,
}) => {
  const exact = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((date) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`exact-${date}`)
      .endedAt(day(date))
      .please(),
  );
  const estimated = makeMe.aUsageTaskHistory
    .identifiedAs("estimated")
    .endedAt(day(10))
    .withResponse({ model: "gpt-9-nova" })
    .please();
  const answer = (
    await readCohort(
      home,
      makeMe.aUsageHistory.with({ tasks: [...exact, estimated] }).please(),
    )
  )();
  expect(answer.tasks).toHaveLength(10);
  expect(answer.tasks.at(-1)?.coverage).toEqual({ kind: "measured" });
  expect(answer.average).toEqual([]);
});

test("only complete tasks, including a measured zero, fill the ten-task rolling median window", async ({
  home,
}) => {
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
        { task: { id: "other-task" }, responses: [] },
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
  history.observations.push(stray);
  history.associations.push(
    makeMe.aUsageAssociation
      .ambiguousAmong({
        observation: stray,
        tasks: [{ id: "unattributed" }, { id: "other-task" }],
      })
      .please(),
  );
  const answer = (await readCohort(home, history))();

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
  expect(answer.unpriced).toBe(0);
});

test("median observations at a tied completion time each name their own eligible task, in task ID order", async ({
  home,
}) => {
  const task = (id: string, date: number) =>
    makeMe.aUsageTaskHistory.identifiedAs(id).endedAt(day(date)).please();
  const earlier = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((date) =>
    task(`earlier-${date}`, date),
  );
  const cohort = await readCohort(
    home,
    makeMe.aUsageHistory
      .with({ tasks: [...earlier, task("tied-b", 10), task("tied-a", 10)] })
      .please(),
  );
  expect(cohort().average).toEqual([
    { at: day(10), task: "tied-a", value: 1_950 },
    { at: day(10), task: "tied-b", value: 1_950 },
  ]);
});
