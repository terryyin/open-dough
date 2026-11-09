// The actual scope owners share endpoint choice and fallback explanation.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import { takenTrunkComparison } from "../support/comparisonMountSelections.ts";
import {
  serveComparison,
  summaryScopeFacts,
} from "../support/comparisonScopeFacts.ts";
import {
  comparisonLabels,
  expectLeadingEvidenceLabels,
} from "../ciEvidenceLabelsPage.ts";
import { childName } from "../intentScopeProofPage.ts";

test("Taken Trunk Summary and file Proof name the same Provisional endpoint and unused Landed explanation", async ({
  page,
  comparisonServer,
  comparisonServices,
}) => {
  const facts = summaryScopeFacts();
  const taken = takenTrunkComparison(facts);
  const answer = makeMe.aStoryCiComparison
    .with({
      ...taken.answer,
      baseline: facts.answer.baseline,
    })
    .please();
  serveComparison(comparisonServices, facts, facts.entries);
  Object.assign(comparisonServices, { comparison: () => ({ json: answer }) });
  await mountComparison(page, comparisonServer, { ...facts, ...taken });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  for (const region of [
    summary,
    page.getByRole("region", { name: "Proof", exact: true }),
  ]) {
    if (region !== summary) {
      await page
        .getByRole("button", { name: /^dashboard\/tests\/root\.spec\.ts,/ })
        .click();
    }
    await expect(
      region.getByRole("heading", {
        name: "Baseline compared with Provisional",
        exact: true,
      }),
    ).toBeVisible();
    await expectLeadingEvidenceLabels(comparisonLabels(region, "Story A"), [
      "Baseline No build aaaaaaa",
      "Branch Not applicable",
      "Provisional bbbbbbb",
      "Landed Not landed yet",
    ]);
    await expect(
      region.locator(".intent-ci-comparison-active-reason"),
    ).toContainText("has not landed yet");
  }
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(2);
});

for (const landed of ["running", "no proof"] as const) {
  test(`Landed ${landed} preserves one Branch fallback through entry, folders and file Proof`, async ({
    page,
    comparisonServer,
    comparisonServices,
  }) => {
    const facts = summaryScopeFacts();
    const answer = makeMe.aStoryCiComparison
      .with({
        ...facts.answer,
        ...(landed === "running"
          ? { landed: { ...facts.answer.landed, kind: "running" as const } }
          : {}),
      })
      .please();
    serveComparison(comparisonServices, facts, facts.entries);
    const standardProof = comparisonServices.proof;
    Object.assign(comparisonServices, {
      comparison: () => ({ json: answer }),
      proof: (params: URLSearchParams) => {
        if (landed !== "no proof" || params.get("run") !== "3")
          return standardProof(params);
        return {
          json: {
            ...facts.proof(3),
            proof: makeMe.aCiProof.unavailable("none").please(),
          },
        };
      },
    });
    await mountComparison(page, comparisonServer, facts);
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const reason =
      landed === "running"
        ? "Landed is not used: Build is still running."
        : "Landed is not used: This run published no CI proof summary.";
    for (const child of [undefined, "folder/", "nested/"]) {
      if (child !== undefined) await childName(summary, child).click();
      await expect(
        summary.getByRole("heading", {
          name: "Baseline compared with Branch",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        summary.locator(".intent-ci-comparison-active-reason"),
      ).toHaveText(reason);
    }
    await childName(summary, "c.spec.ts").click();
    const proof = page.getByRole("region", { name: "Proof", exact: true });
    await expect(
      proof.getByRole("heading", {
        name: "Baseline compared with Branch",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      proof.locator(".intent-ci-comparison-active-reason"),
    ).toHaveText(reason);
    await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
      "+70 ms",
    );
    expect(comparisonServices.comparisons).toBe(1);
    expect(comparisonServices.proofs).toBe(landed === "running" ? 2 : 3);
  });
}
