// The actual scope owners share endpoint choice and fallback explanation.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "../support/pageTest.ts";
import { renderComparison } from "../support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import { takenTrunkComparison } from "../support/comparisonMountSelections.ts";
import { summaryScopeFacts } from "../support/comparisonScopeFacts.ts";
import {
  comparisonLabels,
  expectLeadingEvidenceLabels,
} from "../ciEvidenceLabelsPage.ts";

test("Taken Trunk Summary and file Proof name the same Provisional endpoint and unused Landed explanation", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const taken = takenTrunkComparison(facts);
  const answer = makeMe.aStoryCiComparison
    .with({
      ...taken.answer,
      baseline: facts.answer.baseline,
    })
    .please();
  const rendered = comparisonRenderFacts(
    { ...facts, ...taken, answer },
    facts.entries,
  );
  await renderComparison(page, comparisonRenderer, rendered);
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  for (const region of [
    summary,
    page.getByRole("region", { name: "Proof", exact: true }),
  ]) {
    if (region !== summary) {
      await renderComparison(page, comparisonRenderer, {
        ...rendered,
        scope: {
          ...facts.scope,
          selection: { path: "dashboard/tests/root.spec.ts", scope: "file" },
        },
      });
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
});

for (const landed of ["running", "no proof"] as const) {
  test(`Landed ${landed} preserves one Branch fallback through entry, folders and file Proof`, async ({
    page,
    comparisonRenderer,
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
    const supplied = facts.entries.map((entries, at) =>
      landed === "no proof" && at === 2
        ? makeMe.aCiProof.unavailable("none").please()
        : makeMe.aCiProof.summaryFor(facts.proof(at + 1), entries).please(),
    );
    const rendered = comparisonRenderFacts(
      { ...facts, answer },
      undefined,
      supplied,
    );
    await renderComparison(page, comparisonRenderer, rendered);
    const summary = page.getByRole("region", { name: "Summary", exact: true });
    const reason =
      landed === "running"
        ? "Landed is not used: Build is still running."
        : "Landed is not used: This run published no CI proof summary.";
    for (const path of [
      "dashboard/tests",
      "dashboard/tests/folder",
      "dashboard/tests/folder/nested",
    ]) {
      await renderComparison(page, comparisonRenderer, {
        ...rendered,
        scope: {
          ...facts.scope,
          selection: {
            path,
            scope: path === "dashboard/tests" ? "location" : "folder",
          },
        },
      });
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
    await renderComparison(page, comparisonRenderer, {
      ...rendered,
      scope: {
        ...facts.scope,
        selection: {
          path: "dashboard/tests/folder/nested/c.spec.ts",
          scope: "file",
        },
      },
    });
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
  });
}
