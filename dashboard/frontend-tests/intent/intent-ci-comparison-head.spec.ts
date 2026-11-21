import { comparisonReading } from "../../test-support/intentCiComparisonPage.ts";
// The actual evidence owner follows a Taken story's newly observed trunk head.
import {
  test,
  expect,
  mountComparison,
  updateComparison,
} from "../../test-support/support/comparisonMountPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("a Taken comparison keeps the same observed tip and reads again once that tip changes", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const story = makeMe.aComparedStory.takenOnTrunk();
  const taken = story.please();
  const advanced = story.trunkHeadAdvanced().please();
  Object.assign(comparisonServices, {
    comparison: () => ({
      json:
        comparisonServices.comparisons === 1 ? taken.answer : advanced.answer,
    }),
    proof: (params: URLSearchParams) => ({
      json: taken.proof(Number(params.get("run"))),
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
  await updateComparison(page, advanced);
  await expect(comparisonReading(panel).identities.nth(2)).toContainText(
    "ccccccc",
  );
  await expect.poll(() => comparisonServices.proofs).toBe(3);
  expect(comparisonServices.comparisons).toBe(2);
  await expect(
    panel.getByRole("button", { name: "Check again", exact: true }),
  ).toHaveCount(0);
});
