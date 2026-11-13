// Primary-endpoint outside evidence is named independently of the visible tree.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { test, expect } from "../../tests/support/pageTest.ts";
import { renderComparison } from "../../tests/support/comparisonRendering.ts";
import { comparisonRenderFacts } from "../../tests/support/comparisonRenderFacts.ts";
import { summaryScopeFacts } from "../../tests/support/comparisonScopeFacts.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
} from "../../tests/ciEvidenceLabelsPage.ts";
import { scopeTable } from "../../tests/intentScopeProofPage.ts";

const outsideRow = "Not in the rows above";

test("Summary names the ghost file and unbroken-down part outside its final row, and names Landed for an entry with no file breakdown", async ({
  page,
  comparisonRenderer,
}) => {
  const facts = summaryScopeFacts();
  const landed = [
    makeMe.aCiProofEntry
      .at("dashboard/tests")
      .holding(
        makeMe.aCiProofEvidence
          .brokenDown(
            {
              path: "dashboard/tests/folder/a.spec.ts",
              passed: 1,
              durationMs: 14_000,
            },
            {
              path: "dashboard/tests/folder/nested/c.spec.ts",
              passed: 1,
              durationMs: 410,
            },
            {
              path: "dashboard/tests/root.spec.ts",
              passed: 1,
              durationMs: 1_200,
            },
            {
              path: "dashboard/tests/added.spec.ts",
              passed: 1,
              durationMs: 800,
            },
            {
              path: "dashboard/tests/renamed.spec.ts",
              passed: 1,
              durationMs: 2_100,
            },
            {
              path: "dashboard/tests/ghost.spec.ts",
              passed: 1,
              durationMs: 700,
            },
          )
          .withUnbrokenPart({ passed: 1, durationMs: 900 })
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry.at("tests").counting(1, "file").timed(500).please(),
  ];
  const rendered = comparisonRenderFacts(facts, [
    facts.entries[0] ?? [],
    facts.entries[1] ?? [],
    landed,
  ]);
  const testsLocation = makeMe.anIntentLocation
    .at("tests")
    .ofKind("shell", ["*.sh"])
    .selecting("tests/check.sh")
    .please();
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      locations: [...facts.scope.locations, testsLocation],
    },
  });
  const summary = page.getByRole("region", { name: "Summary", exact: true });
  await expect(
    scopeTable(summary, "dashboard/tests")
      .locator("tbody")
      .getByRole("row")
      .last()
      .getByRole("rowheader"),
  ).toHaveText(outsideRow);
  const outside = evidenceLabels(summary, outsideRow);
  await expectEvidenceLabels(outside, [
    "1 file not in the tree",
    "Part 2 no breakdown",
  ]);
  await expectLabelInFull(
    outside,
    "1 file not in the tree",
    "Not in the tree: dashboard/tests/ghost.spec.ts",
  );
  await expectLabelInFull(
    outside,
    "Part 2 no breakdown",
    "part 2 of 2 has no file breakdown",
  );
  await expect(evidenceLabel(summary, "No file breakdown")).toHaveCount(0);
  await renderComparison(page, comparisonRenderer, {
    ...rendered,
    scope: {
      ...facts.scope,
      locations: [...facts.scope.locations, testsLocation],
      selection: { path: "tests", scope: "location" },
    },
  });
  await expect(summary.locator(".intent-summary-path")).toHaveText("tests");
  await expect(evidenceLabels(summary, "About these figures"))
    .toMatchAriaSnapshot(`
    - list "About these figures":
      - listitem: No file breakdown , The Landed CI proof summary does not break tests down by file
  `);
  await expectInFull(
    evidenceLabel(summary, "No file breakdown"),
    "The Landed CI proof summary does not break tests down by file",
  );
  await expect(evidenceLabels(summary, outsideRow)).toHaveCount(0);
});
