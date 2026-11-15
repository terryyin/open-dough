// Unpriced tasks are counted; missing usage stays partial and out of the average.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  day,
  readCohort,
} from "../../tests/usage-history/tokenIndexHarness.ts";

test("standard and unrecorded tiers are priced; an unrated model or fast worker leaves the entire task unpriced", async ({
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
    makeMe.aUsageTaskHistory
      .identifiedAs("unrated")
      .withResponse({ model: "gpt-5-nova" })
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
  expect(answer.unpriced).toBe(2);
});

test("only complete tasks, including a measured zero, fill the ten-task moving-average window", async ({
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
    { at: day(14), value: 3_555 },
    { at: day(15), value: 4_200 },
  ]);
  expect(answer.unpriced).toBe(0);
});
