// The real control stays usable through repeated unavailable Baseline answers.
import {
  test,
  expect,
  mountComparison,
  type ComparisonReply,
} from "../support/comparisonMountPage.ts";
import { preparedComparison } from "../support/comparisonMountFacts.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test("each failed Baseline Check again holds the button disabled and retains the query and failure reason", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = preparedComparison();
  const reason = `head_sha=${facts.answer.baseline.revision}: GitHub is unreachable`;
  const failed = makeMe.aStoryCiComparison
    .with({
      ...facts.answer,
      baseline: { kind: "unavailable", explanation: reason },
    })
    .please();
  let nextRead: Promise<ComparisonReply> | undefined;
  Object.assign(comparisonServices, {
    comparison: () => nextRead ?? { json: failed },
    proof: (params: URLSearchParams) => ({
      json: facts.proof(Number(params.get("run"))),
    }),
  });
  const panel = await mountComparison(page, comparisonServer, facts);
  const baseline = panel.locator(".intent-ci-comparison-identity").first();
  const check = panel.getByRole("button", { name: "Check again", exact: true });
  await expect(baseline).toHaveText(reason);
  for (let round = 0; round < 2; round += 1) {
    const held = comparisonServices.hold();
    nextRead = held.promise;
    await check.click();
    await expect(check).toBeDisabled();
    await expect.poll(() => comparisonServices.comparisons).toBe(round + 2);
    held.resolve({ json: failed });
    await expect(check).toBeEnabled();
    await expect(baseline).toHaveText(reason);
  }
  await expect.poll(() => comparisonServices.proofs).toBe(6);
});
