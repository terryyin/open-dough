// Cohort choices use the most common root setting, counted by response.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { readCohort } from "../../test-support/usage-history/tokenIndexHarness.ts";
import type { TokenIndexCohort } from "../../src/usageTokenIndex.ts";

const sol = "gpt-6.1-sol",
  astra = "gpt-6-astra";

test("model and effort filter by root response counts, with ties unknown and options spanning workflows", async ({
  home,
}) => {
  const tasks = [
    makeMe.aUsageTaskHistory
      .identifiedAs("mostly-astra")
      .inWorkflow("refinement")
      .withResponse({ model: astra, effort: "high" })
      .withResponse({ model: astra, effort: "high" })
      .withResponse({ effort: "high" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("sol-with-workers")
      .inWorkflow("refinement")
      .withResponse({ effort: "medium" })
      .withWorkerResponse({ model: astra, effort: "high" })
      .withWorkerResponse({ model: astra, effort: "high" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("model-tie")
      .inWorkflow("refinement")
      .withResponse({ effort: "high" })
      .withResponse({ model: astra, effort: "high" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("counted-by-response")
      .inWorkflow("refinement")
      .withResponse({
        model: astra,
        tokens: { uncachedInput: 90_000, cacheRead: 900_000, output: 9_000 },
      })
      .withResponse({})
      .withResponse({})
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("effort-tie")
      .inWorkflow("refinement")
      .withResponse({})
      .withResponse({ effort: "max" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("recovered-refinement")
      .recovered()
      .inWorkflow("refinement")
      .withResponse({ effort: "medium" })
      .please(),
    makeMe.aUsageTaskHistory
      .identifiedAs("execution")
      .withResponse({ effort: "ultra" })
      .please(),
  ];
  const cohort = await readCohort(
    home,
    makeMe.aUsageHistory.with({ tasks }).please(),
  );
  const ids = (choice: Partial<TokenIndexCohort> = {}) =>
    cohort({ workflow: "refinement", ...choice }).tasks.map(({ id }) => id);

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
  expect(cohort({ model: astra }).options).toEqual({
    models: [
      { id: sol, name: "GPT-6.1 Sol" },
      { id: astra, name: "GPT-6 Astra" },
    ],
    efforts: ["high", "medium", "ultra", "xhigh"],
  });
});
