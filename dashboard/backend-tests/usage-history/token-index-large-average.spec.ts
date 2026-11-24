import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";

test("an isolated 65-million task leaves the ten-task median at one million", () => {
  const indexes = [
    1_000_000, 1_000_000, 1_000_000, 1_000_000, 65_000_000, 1_000_000,
    1_000_000, 1_000_000, 1_000_000, 1_000_000,
  ];
  const tasks = indexes.map((index, at) =>
    makeMe.aSummaryTask
      .identifiedAs(`task-${at}`)
      .endedAt(`2026-11-${String(at + 1).padStart(2, "0")}T12:00:00.000Z`)
      .withUsage({
        tokens: { uncachedInput: index, cacheRead: 0, output: 0 },
      })
      .please(),
  );
  const summary = makeMe.aUsageTaskSummary.with({ tasks }).please();
  const project = makeMe.aPublishedSource.openDough.please();
  const answer = tokenIndexCohort(
    summary,
    {
      projects: new Map([[project.id, project.label]]),
      launches: new Map(),
      tariff: codexTariff,
      checkedAt: null,
    },
    defaultCohort,
  );
  expect(answer.tasks.map((task) => task.index)).toEqual(indexes);
  expect(answer.average).toEqual([
    { at: "2026-11-10T12:00:00.000Z", task: "task-9", value: 1_000_000 },
  ]);
});
