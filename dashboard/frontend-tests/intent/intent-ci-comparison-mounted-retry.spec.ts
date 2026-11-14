import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// Real providers, authenticated readers and Check again, with prepared service answers.
import {
  test,
  expect,
  mountComparison,
} from "../../tests/support/comparisonMountPage.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("Check again disables while a failed whole comparison is read again and recovers its endpoints", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = preparedComparison();
  const initial = comparisonServices.hold();
  const retry = comparisonServices.hold();
  Object.assign(comparisonServices, {
    comparison: () =>
      comparisonServices.comparisons === 1 ? initial.promise : retry.promise,
    proof: (params: URLSearchParams) => ({
      json: facts.proof(Number(params.get("run"))),
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  const check = panel.getByRole("button", { name: "Check again", exact: true });
  await expect(check).toBeDisabled();
  initial.resolve({
    status: 503,
    json: { error: "Comparison temporarily unavailable" },
  });
  await expect(comparisonReading(panel).gap).toHaveText(
    "Comparison temporarily unavailable",
  );
  await expect(check).toBeEnabled();
  await check.click();
  await expect(check).toBeDisabled();
  await expect.poll(() => comparisonServices.comparisons).toBe(2);
  retry.resolve({ json: facts.answer });
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(comparisonReading(panel).identities).toContainText([
    "aaaaaaa",
    "bbbbbbb",
    "ccccccc",
  ]);
  await expect(check).toBeEnabled();
  await expect.poll(() => comparisonServices.proofs).toBe(3);
});

test("Check again retries an unavailable whole answer and replaces its explanation", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = preparedComparison();
  const unavailable = makeMe.aStoryCiComparison
    .with({
      kind: "unavailable",
      identity: facts.identity,
      checkedAt: facts.answer.checkedAt,
      explanation: "Published execution history is incomplete",
    })
    .please();
  Object.assign(comparisonServices, {
    comparison: () => ({
      json: comparisonServices.comparisons === 1 ? unavailable : facts.answer,
    }),
    proof: (params: URLSearchParams) => ({
      json: facts.proof(Number(params.get("run"))),
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  await expect(comparisonReading(panel).gap).toHaveText(
    unavailable.explanation,
  );
  await panel.getByRole("button", { name: "Check again", exact: true }).click();
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(comparisonReading(panel).gap).toHaveCount(0);
  await expect.poll(() => comparisonServices.proofs).toBe(3);
  expect(comparisonServices.comparisons).toBe(2);
});

test("Check again reads all endpoint proofs afresh and replaces Branch fallback with recovered Landed proof", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = preparedComparison();
  const retry = comparisonServices.hold();
  let landedReads = 0;
  Object.assign(comparisonServices, {
    comparison: () =>
      comparisonServices.comparisons === 1
        ? { json: facts.answer }
        : retry.promise,
    proof: (params: URLSearchParams) => {
      const run = Number(params.get("run"));
      if (run === 3) {
        landedReads += 1;
      }
      const answer = facts.proof(run);
      return {
        json:
          run === 3 && landedReads === 1
            ? {
                ...answer,
                proof: makeMe.aCiProof
                  .unavailable("unreadable", "Endpoint proof unavailable")
                  .please(),
              }
            : answer,
      };
    },
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(comparisonReading(panel).overallCounts).toHaveText(
    "2 → 3 test cases (+1)",
  );
  await expect.poll(() => comparisonServices.proofs).toBe(3);
  const check = panel.getByRole("button", { name: "Check again", exact: true });
  await check.click();
  await expect(check).toBeDisabled();
  await expect.poll(() => comparisonServices.comparisons).toBe(2);
  retry.resolve({ json: facts.answer });
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  await expect(comparisonReading(panel).overallCounts).toHaveText(
    "2 → 4 test cases (+2)",
  );
  await expect(check).toBeEnabled();
  await expect.poll(() => comparisonServices.proofs).toBe(6);
  expect(landedReads).toBe(2);
});
