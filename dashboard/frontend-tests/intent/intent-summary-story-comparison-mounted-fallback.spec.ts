import { comparisonReading } from "../../tests/intentCiComparisonPage.ts";
// The actual scope owners share endpoint choice and fallback explanation.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/support/pageTest.ts";
import {
  comparisonLabels,
  expectLeadingEvidenceLabels,
} from "../../tests/ciEvidenceLabelsPage.ts";

test("Taken Trunk Summary and file Proof name the same Provisional endpoint and unused Landed explanation", async ({
  page,
  renderComparison,
}) => {
  const story = makeMe.aComparedStory.inSummaryScope().takenOnTrunk();
  await renderComparison(story.please());
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  for (const region of [
    summary,
    page.getByRole("region", { name: "Proof", exact: true }),
  ]) {
    if (region !== summary) {
      await renderComparison(
        story.selecting("dashboard/tests/root.spec.ts", "file").please(),
      );
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
    await expect(comparisonReading(region).fallbackReason).toContainText(
      "has not landed yet",
    );
  }
});

for (const landed of ["running", "no proof"] as const) {
  test(`Landed ${landed} preserves one Branch fallback through entry, folders and file Proof`, async ({
    page,
    renderComparison,
  }) => {
    const story = makeMe.aComparedStory.inSummaryScope();
    if (landed === "running") story.withLanded({ kind: "running" });
    else
      story.withProofAt("landed", makeMe.aCiProof.unavailable("none").please());
    await renderComparison(story.please());
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
      await renderComparison(
        story
          .selecting(path, path === "dashboard/tests" ? "location" : "folder")
          .please(),
      );
      await expect(
        summary.getByRole("heading", {
          name: "Baseline compared with Branch",
          exact: true,
        }),
      ).toBeVisible();
      await expect(comparisonReading(summary).fallbackReason).toHaveText(
        reason,
      );
    }
    await renderComparison(
      story
        .selecting("dashboard/tests/folder/nested/c.spec.ts", "file")
        .please(),
    );
    const proof = page.getByRole("region", { name: "Proof", exact: true });
    await expect(
      proof.getByRole("heading", {
        name: "Baseline compared with Branch",
        exact: true,
      }),
    ).toBeVisible();
    await expect(comparisonReading(proof).fallbackReason).toHaveText(reason);
    await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
      "+70 ms",
    );
  });
}
