import { expect, test } from "../../tests/support/pageTest.ts";
import { timeWithoutRunnerWaits } from "../../server/ciTimeWithoutRunnerWaits.ts";
import { comparisonWorkflow } from "../../tests/support/storyCiComparisonFixture.ts";
import {
  observedBaselineJobs,
  observedBranchJobs,
  observedRerunJobs,
} from "../../tests/support/storyCiObservedJobs.ts";

test("the observed builds count the longest dependency chain despite different runner waits", () => {
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedBaselineJobs, false),
  ).toEqual({
    milliseconds: 295_000,
  });
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedBranchJobs, false),
  ).toEqual({
    milliseconds: 287_000,
  });
});

test("a re-run retains the durations of carried-over jobs even when they started before their reported creation", () => {
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, observedRerunJobs, false),
  ).toEqual({
    milliseconds: 312_000,
  });
  // Make a carried-over shard longer than the re-run shard. It finished
  // before the second attempt was created but can still own the longest chain.
  const withLongerCarryover = observedRerunJobs.map((job) =>
    job.name === "dashboard (3/12)"
      ? { ...job, completed_at: "2026-11-06T09:47:07Z" }
      : job,
  );
  expect(
    timeWithoutRunnerWaits(comparisonWorkflow, withLongerCarryover, false),
  ).toEqual({
    milliseconds: 337_000,
  });
});
