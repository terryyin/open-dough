// An unlisted model is estimated at its closest listed family version until a
// later rate card lists it, which reweighs the same counters.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import {
  claudeTariff2026_11_15,
  codexTariff,
  codexTariff2026_11_15,
} from "../../server/usageTariffs.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";

const astra = "gpt-6.2-astra";
const reading = {
  projects: [makeMe.aPublishedSource.openDough.please()],
  launches: new Map(),
  checkedAt: null,
};
const oldCodex = { ...reading, tariff: codexTariff2026_11_15 };
const currentCodex = { ...reading, tariff: codexTariff };
const astraSubstitution = {
  model: { id: astra, name: astra },
  substitute: { id: "gpt-6-astra", name: "GPT-6 Astra" },
};
const astraTask = () =>
  makeMe.aSummaryTask.identifiedAs("astra").withUsage({ model: astra });

test("a GPT-6.2 Astra task is estimated from GPT-6 Astra, then reweighed once the November 19 card lists it", () => {
  const summary = makeMe.aUsageTaskSummary
    .with({ tasks: [astraTask().please()] })
    .please();
  const [estimated] = tokenIndexAnswer(
    { ...oldCodex, summary },
    defaultCohort,
  ).tasks;
  const [updated] = tokenIndexAnswer(
    { ...currentCodex, summary },
    defaultCohort,
  ).tasks;

  // (1,000×250 + 9,000×25 + 100×1,250) / 50 at GPT-6 Astra rates
  expect(estimated?.index).toBe(12_000);
  expect(estimated?.substitutions).toEqual([astraSubstitution]);
  // (1,000×200 + 9,000×10 + 100×1,000) / 50 at its own GPT-6.2 Astra rates
  expect(updated?.index).toBe(7_800);
  expect(updated?.substitutions).toBeUndefined();
});

test("the median first appears once the tenth task's estimate gives way to an explicit rate", () => {
  const sol = [...Array<number>(9).keys()].map((index) =>
    makeMe.aSummaryTask
      .identifiedAs(`sol-${index + 1}`)
      .endedAt(`2026-11-0${index + 1}T12:00:00.000Z`)
      .please(),
  );
  const end = "2026-11-10T12:00:00.000Z";
  const summary = makeMe.aUsageTaskSummary
    .with({ tasks: [...sol, astraTask().endedAt(end).please()] })
    .please();

  const estimated = tokenIndexAnswer({ ...oldCodex, summary }, defaultCohort);
  const updated = tokenIndexAnswer({ ...currentCodex, summary }, defaultCohort);
  expect(estimated.average).toEqual([]);
  expect(updated.average).toEqual([{ at: end, task: "astra", value: 1_950 }]);
});

test("the GPT-6.2 Astra model filter still finds the reweighed task", () => {
  const summary = makeMe.aUsageTaskSummary
    .with({
      tasks: [
        makeMe.aSummaryTask.identifiedAs("sol").please(),
        astraTask().please(),
      ],
    })
    .please();

  const updated = tokenIndexAnswer(
    { ...currentCodex, summary },
    { ...defaultCohort, model: astra },
  );
  expect(updated.tasks.map(({ id }) => id)).toEqual(["astra"]);
});

test("a mixed task sums each group at its own rates and keeps an outstanding substitution after the update", () => {
  const mixed = astraTask()
    .identifiedAs("mixed")
    .withUsage({ model: "gpt-9-nova", root: false })
    .please();
  const summary = makeMe.aUsageTaskSummary.with({ tasks: [mixed] }).please();
  const nova = {
    model: { id: "gpt-9-nova", name: "gpt-9-nova" },
    substitute: { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
  };

  const [before] = tokenIndexAnswer(
    { ...oldCodex, summary },
    defaultCohort,
  ).tasks;
  const [after] = tokenIndexAnswer(
    { ...currentCodex, summary },
    defaultCohort,
  ).tasks;
  // Astra root at GPT-6 Astra rates 12,000 plus the worker at Sol rates 1,950.
  expect(before?.index).toBe(13_950);
  expect(before?.substitutions).toEqual([astraSubstitution, nova]);
  expect(after?.index).toBe(9_750);
  expect(after?.substitutions).toEqual([nova]);
});

for (const [model, substitute, index] of [
  ["claude-fable-5-3", "claude-fable-5-2", 3_000],
  ["claude-fable-5-15", "claude-fable-5-2", 3_000],
  ["claude-mythos-6", "claude-opus-5-5", 1_500],
] as const) {
  test(`unlisted ${model} is estimated at ${substitute} rates`, () => {
    const task = makeMe.aSummaryTask
      .with({ host: "claude" })
      .withUsage({ model, tier: "standard", tokens: { cacheRead: 0 } })
      .please();
    const summary = makeMe.aUsageTaskSummary.with({ tasks: [task] }).please();

    const [actual] = tokenIndexAnswer(
      { ...reading, summary, tariff: claudeTariff2026_11_15 },
      { ...defaultCohort, tool: "claude" },
    ).tasks;
    expect(actual?.index).toBe(index);
    expect(
      actual?.substitutions?.map(({ substitute }) => substitute.id),
    ).toEqual([substitute]);
  });
}

for (const [model, substitute, tariff] of [
  // Minor 10 is closer to 2 than to 1, never read as 6.1.
  ["gpt-6.10-sol", "gpt-6.2-sol", codexTariff],
  // Equally far from 6.1 and 6.3 Astra. A tie takes the reference.
  [
    astra,
    "gpt-6.1-sol",
    {
      ...codexTariff2026_11_15,
      models: {
        "gpt-6.1-sol": {
          name: "GPT-6.1 Sol",
          input: 50,
          cachedInput: 2.5,
          output: 250,
        },
        "gpt-6.1-astra": {
          name: "GPT-6.1 Astra",
          input: 1,
          cachedInput: 1,
          output: 1,
        },
        "gpt-6.3-astra": {
          name: "GPT-6.3 Astra",
          input: 1,
          cachedInput: 1,
          output: 1,
        },
      },
    },
  ],
] as const) {
  test(`unlisted ${model} is estimated at ${substitute} rates on ${tariff.version}`, () => {
    const task = makeMe.aSummaryTask.withUsage({ model }).please();
    const summary = makeMe.aUsageTaskSummary.with({ tasks: [task] }).please();

    const [actual] = tokenIndexAnswer(
      { ...reading, summary, tariff },
      defaultCohort,
    ).tasks;
    expect(
      actual?.substitutions?.map(({ substitute }) => substitute.id),
    ).toEqual([substitute]);
  });
}
