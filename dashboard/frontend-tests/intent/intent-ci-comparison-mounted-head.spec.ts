import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// The actual evidence owner follows a Taken story's newly observed trunk head.
import {
  test,
  expect,
  mountComparison,
  updateComparison,
} from "../../tests/support/comparisonMountPage.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { takenTrunkComparison } from "../../tests/support/comparisonMountSelections.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test("a Taken comparison keeps the same observed tip and reads again once that tip changes", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = preparedComparison();
  const taken = takenTrunkComparison(facts);
  const changed = makeMe.aStoryCiComparison
    .with({ ...taken.answer, provisional: facts.answer.landed })
    .please();
  Object.assign(comparisonServices, {
    comparison: () => ({
      json: comparisonServices.comparisons === 1 ? taken.answer : changed,
    }),
    proof: (params: URLSearchParams) => ({
      json: facts.proof(Number(params.get("run"))),
    }),
  });
  const panel = await mountComparison(page, comparisonServer, taken);
  await expect(comparisonReading(panel).identities.nth(2)).toContainText(
    "bbbbbbb",
  );
  await expect.poll(() => comparisonServices.proofs).toBe(2);
  await updateComparison(page, {
    ...taken,
    work: makeMe.aPublishedWork.with({ ...taken.work }).please(),
  });
  await expect(comparisonReading(panel).identities.nth(2)).toContainText(
    "bbbbbbb",
  );
  expect(comparisonServices.comparisons).toBe(1);
  const changedWork = makeMe.aPublishedWork
    .with({ ...taken.work, revision: facts.answer.landed.revision })
    .please();
  await updateComparison(page, { ...taken, work: changedWork });
  await expect(comparisonReading(panel).identities.nth(2)).toContainText(
    "ccccccc",
  );
  await expect.poll(() => comparisonServices.proofs).toBe(3);
  expect(comparisonServices.comparisons).toBe(2);
  await expect(
    panel.getByRole("button", { name: "Check again", exact: true }),
  ).toHaveCount(0);
});
