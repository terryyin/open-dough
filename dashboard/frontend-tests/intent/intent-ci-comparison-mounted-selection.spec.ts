import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Late HTTP answers cannot replace the selected story or its attempt's proof.
import {
  test,
  expect,
  mountComparison,
  updateComparison,
} from "../../tests/support/comparisonMountPage.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { otherComparedStory } from "../../tests/support/comparisonMountSelections.ts";

test("a held comparison for an old selection cannot replace the current story's endpoints", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const first = preparedComparison();
  const next = otherComparedStory(first);
  const held = comparisonServices.hold();
  Object.assign(comparisonServices, {
    comparison: (params: URLSearchParams) =>
      params.get("identity") === first.identity
        ? held.promise
        : { json: next.answer },
    proof: (params: URLSearchParams) => ({
      json: next.proof(Number(params.get("run"))),
    }),
  });
  const panel = await mountComparison(page, comparisonServer, first);
  await expect.poll(() => comparisonServices.comparisons).toBe(1);
  const aborted = page.waitForEvent("requestfailed", {
    predicate: (request) => {
      const params = new URL(request.url()).searchParams;
      return (
        params.get("intent") === "ci-comparison" &&
        params.get("identity") === first.identity
      );
    },
  });
  await updateComparison(page, next);
  await expect(comparisonReading(panel).identities.first()).toContainText(
    "ddddddd",
  );
  await expect(comparisonReading(panel).overallCounts).toHaveText(
    "10 → 4 test cases (−6)",
  );
  const cancelled = await aborted;
  expect(cancelled.failure()?.errorText).toMatch(/abort|cancel/i);
  held.resolve({ json: first.answer });
  await expect(comparisonReading(panel).identities.first()).toContainText(
    "ddddddd",
  );
  await expect(comparisonReading(panel).identities.first()).not.toContainText(
    "aaaaaaa",
  );
  expect(comparisonServices.comparisons).toBe(2);
});

test("a held endpoint proof for an old story cannot paint the current story's counts", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const first = preparedComparison();
  const next = otherComparedStory(first);
  const held = comparisonServices.hold();
  Object.assign(comparisonServices, {
    comparison: (params: URLSearchParams) => ({
      json:
        params.get("identity") === first.identity ? first.answer : next.answer,
    }),
    proof: (params: URLSearchParams) =>
      Number(params.get("run")) === 1
        ? held.promise
        : { json: next.proof(Number(params.get("run"))) },
  });
  const panel = await mountComparison(page, comparisonServer, first);
  await expect.poll(() => comparisonServices.proofs).toBe(3);
  const aborted = page.waitForEvent("requestfailed", {
    predicate: (request) => {
      const params = new URL(request.url()).searchParams;
      return (
        params.get("intent") === "ci-proof" &&
        params.get("run") === "1" &&
        params.get("revision") === first.answer.baseline.revision
      );
    },
  });
  await updateComparison(page, next);
  await expect(comparisonReading(panel).overallCounts).toHaveText(
    "10 → 4 test cases (−6)",
  );
  const cancelled = await aborted;
  expect(cancelled.failure()?.errorText).toMatch(/abort|cancel/i);
  held.resolve({ json: first.proof(1) });
  await expect(comparisonReading(panel).overallCounts).toHaveText(
    "10 → 4 test cases (−6)",
  );
  expect(comparisonServices.comparisons).toBe(2);
  expect(comparisonServices.proofs).toBe(6);
});
