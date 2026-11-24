// Cohort choices use the most common root setting, counted by response.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { tokenIndexCohort } from "../../server/tokenIndexCohort.ts";
import { codexTariff } from "../../server/usageTariffs.ts";
import {
  defaultCohort,
  type TokenIndexCohort,
} from "../../src/usageTokenIndex.ts";

const sol = "gpt-6.1-sol",
  astra = "gpt-6-astra";

test("model and effort filter by root response counts, with ties unknown and options spanning workflows", () => {
  const twoResponses = { uncachedInput: 2_000, cacheRead: 18_000, output: 200 };
  const tasks = [
    makeMe.aSummaryTask
      .identifiedAs("mostly-astra")
      .with({ workflow: "refinement" })
      .withUsage({
        model: astra,
        effort: "high",
        responses: 2,
        tokens: twoResponses,
      })
      .withUsage({ effort: "high" })
      .please(),
    makeMe.aSummaryTask
      .identifiedAs("sol-with-workers")
      .with({ workflow: "refinement" })
      .withUsage({ effort: "medium" })
      .withUsage({
        root: false,
        model: astra,
        effort: "high",
        responses: 2,
        tokens: twoResponses,
      })
      .please(),
    makeMe.aSummaryTask
      .identifiedAs("model-tie")
      .with({ workflow: "refinement" })
      .withUsage({ effort: "high" })
      .withUsage({ model: astra, effort: "high" })
      .please(),
    makeMe.aSummaryTask
      .identifiedAs("counted-by-response")
      .with({ workflow: "refinement" })
      .withUsage({
        model: astra,
        tokens: { uncachedInput: 90_000, cacheRead: 900_000, output: 9_000 },
      })
      .withUsage({ responses: 2, tokens: twoResponses })
      .please(),
    makeMe.aSummaryTask
      .identifiedAs("effort-tie")
      .with({ workflow: "refinement" })
      .withUsage({})
      .withUsage({ effort: "max" })
      .please(),
    makeMe.aSummaryTask
      .identifiedAs("recovered-refinement")
      .with({
        kind: "recovered",
        workflow: "dough-story-refinement",
        outcome: null,
      })
      .withUsage({ effort: "medium" })
      .please(),
    makeMe.aSummaryTask
      .identifiedAs("execution")
      .withUsage({ effort: "ultra" })
      .please(),
  ];
  const summary = makeMe.aUsageTaskSummary.with({ tasks }).please();
  const project = makeMe.aPublishedSource.openDough.please();
  const reading = {
    projects: new Map([[project.id, project.label]]),
    launches: new Map(),
    tariff: codexTariff,
    checkedAt: null,
  };
  const ids = (choice: Partial<TokenIndexCohort> = {}) =>
    tokenIndexCohort(summary, reading, {
      ...defaultCohort,
      workflow: "refinement",
      ...choice,
    }).tasks.map(({ id }) => id);

  expect(ids()).toEqual([
    "counted-by-response",
    "effort-tie",
    "model-tie",
    "mostly-astra",
    "recovered-refinement",
    "sol-with-workers",
  ]);
  expect(ids({ model: astra })).toEqual(["mostly-astra"]);
  expect(ids({ model: sol })).toEqual([
    "counted-by-response",
    "effort-tie",
    "recovered-refinement",
    "sol-with-workers",
  ]);
  expect(ids({ effort: "high" })).toEqual(["model-tie", "mostly-astra"]);
  expect(ids({ effort: "xhigh" })).toEqual(["counted-by-response"]);
  expect(ids({ model: sol, effort: "medium" })).toEqual([
    "recovered-refinement",
    "sol-with-workers",
  ]);
  expect(ids({ workflow: "execution", effort: "ultra" })).toEqual([
    "execution",
  ]);
  expect(
    tokenIndexCohort(summary, reading, { ...defaultCohort, model: astra })
      .options,
  ).toEqual({
    models: [
      { id: sol, name: "GPT-6.1 Sol" },
      { id: astra, name: "GPT-6 Astra" },
    ],
    efforts: ["high", "medium", "ultra", "xhigh"],
  });
});
