// An unlisted model is estimated at its closest listed family version until a
// later rate card lists it, which reweighs the same stored counters.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  claudeTariff2026_11_15,
  codexTariff,
  codexTariff2026_11_15,
} from "../../server/usageTariffs.ts";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  day,
  readCohort,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const astra = "gpt-6.2-astra";

// Nine GPT-6.1 Sol tasks and a tenth GPT-6.2 Astra task, read under the
// November 15 card that lacks GPT-6.2 Astra and the November 19 card that
// lists it.
async function replayAstraUpdate(home: string) {
  const sol = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((date) =>
    makeMe.aUsageTaskHistory
      .identifiedAs(`sol-${date}`)
      .endedAt(day(date))
      .please(),
  );
  const history = makeMe.aUsageHistory
    .with({
      tasks: [
        ...sol,
        makeMe.aUsageTaskHistory
          .identifiedAs("astra")
          .endedAt(day(10))
          .withResponse({ model: astra })
          .please(),
      ],
    })
    .please();
  const estimated = (await readCohort(home, history, codexTariff2026_11_15))();
  const updated = await readCohort(home, history, codexTariff);
  return { sol, estimated, updated };
}

test("a GPT-6.2 Astra task is estimated from GPT-6 Astra, then reweighed once the November 19 card lists it", async ({
  home,
}) => {
  const { sol, estimated, updated } = await replayAstraUpdate(home);

  // (1,000×250 + 9,000×25 + 100×1,250) / 50 at GPT-6 Astra rates
  expect(estimated.tasks.map(({ index }) => index)).toEqual([
    ...sol.map(() => 1_950),
    12_000,
  ]);
  expect(estimated.tasks.at(-1)?.substitutions).toEqual([
    {
      model: { id: astra, name: astra },
      substitute: { id: "gpt-6-astra", name: "GPT-6 Astra" },
    },
  ]);
  // (1,000×200 + 9,000×10 + 100×1,000) / 50 at its own GPT-6.2 Astra rates
  expect(updated().tasks.map(({ index }) => index)).toEqual([
    ...sol.map(() => 1_950),
    7_800,
  ]);
  expect(updated().tasks.at(-1)?.substitutions).toBeUndefined();
});

test("the median first appears once the tenth task's estimate gives way to an explicit rate", async ({
  home,
}) => {
  const { estimated, updated } = await replayAstraUpdate(home);

  expect(estimated.average).toEqual([]);
  expect(updated().average).toEqual([
    { at: day(10), task: "astra", value: 1_950 },
  ]);
});

test("the GPT-6.2 Astra model filter still finds the reweighed task", async ({
  home,
}) => {
  const { updated } = await replayAstraUpdate(home);

  expect(updated({ model: astra }).tasks.map(({ id }) => id)).toEqual([
    "astra",
  ]);
});

test("a mixed task sums each group at its own rates and keeps an outstanding substitution after the update", async ({
  home,
}) => {
  const history = makeMe.aUsageHistory
    .with({
      tasks: [
        makeMe.aUsageTaskHistory
          .identifiedAs("mixed")
          .withResponse({ model: astra })
          .withWorkerResponse({ model: "gpt-9-nova" })
          .please(),
      ],
    })
    .please();
  const nova = {
    model: { id: "gpt-9-nova", name: "gpt-9-nova" },
    substitute: { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" },
  };
  const [before] = (await readCohort(home, history, codexTariff2026_11_15))()
    .tasks;
  const [after] = (await readCohort(home, history, codexTariff))().tasks;

  // Astra root at GPT-6 Astra rates 12,000 plus the worker at Sol rates 1,950.
  expect(before?.index).toBe(13_950);
  expect(before?.substitutions).toEqual([
    {
      model: { id: astra, name: astra },
      substitute: { id: "gpt-6-astra", name: "GPT-6 Astra" },
    },
    nova,
  ]);
  expect(after?.index).toBe(9_750);
  expect(after?.substitutions).toEqual([nova]);
});

for (const [model, substitute, index] of [
  ["claude-fable-5-3", "claude-fable-5-2", 3_000],
  ["claude-fable-5-15", "claude-fable-5-2", 3_000],
  ["claude-mythos-6", "claude-opus-5-5", 1_500],
] as const) {
  test(`unlisted ${model} is estimated at ${substitute} rates`, async ({
    home,
  }) => {
    const history = makeMe.aUsageHistory
      .with({
        tasks: [
          makeMe.aUsageTaskHistory
            .inClaudeCode()
            .withResponse({
              model,
              tokens: {
                uncachedInput: 1_000,
                cacheRead: 0,
                cacheWrite: 0,
                output: 100,
              },
            })
            .please(),
        ],
      })
      .please();
    const [task] = (await readCohort(home, history, claudeTariff2026_11_15))({
      tool: "claude",
    }).tasks;
    expect(task?.index).toBe(index);
    expect(task?.substitutions?.map(({ substitute }) => substitute.id)).toEqual(
      [substitute],
    );
  });
}

for (const [model, substitute, tariff] of [
  // Minor 10 is closer to 2 than to 1, never read as 6.1.
  ["gpt-6.10-sol", "gpt-6.2-sol", codexTariff],
  // Equally far from 6.1 and 6.3 Astra: a tie takes the reference.
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
  test(`unlisted ${model} is estimated at ${substitute} rates on ${tariff.version}`, async ({
    home,
  }) => {
    const history = makeMe.aUsageHistory
      .with({
        tasks: [makeMe.aUsageTaskHistory.withResponse({ model }).please()],
      })
      .please();
    const [task] = (await readCohort(home, history, tariff))().tasks;
    expect(task?.substitutions?.map(({ substitute }) => substitute.id)).toEqual(
      [substitute],
    );
  });
}
