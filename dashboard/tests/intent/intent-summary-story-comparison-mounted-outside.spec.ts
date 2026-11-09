// Primary-endpoint outside evidence is named independently of the visible tree.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  test,
  expect,
  mountComparison,
} from "../support/comparisonMountPage.ts";
import {
  serveComparison,
  summaryScopeFacts,
} from "../support/comparisonScopeFacts.ts";
import {
  evidenceLabel,
  evidenceLabels,
  expectEvidenceLabels,
  expectInFull,
  expectLabelInFull,
} from "../ciEvidenceLabelsPage.ts";
import { scopeTable } from "../intentScopeProofPage.ts";

const outsideRow = "Not in the rows above";

test("Summary names the ghost file and unbroken-down part outside its final row, and names Landed for an entry with no file breakdown", async ({
  page,
  comparisonServer,
  comparisonServices,
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
          .withParts(
            {
              part: 1,
              status: "present",
              passed: 6,
              failed: 0,
              other: 0,
              durationMs: 19_210,
              breakdown: true,
            },
            {
              part: 2,
              status: "present",
              passed: 1,
              failed: 0,
              other: 0,
              durationMs: 900,
            },
          )
          .please(),
      )
      .please(),
    makeMe.aCiProofEntry.at("tests").counting(1, "file").timed(500).please(),
  ];
  serveComparison(comparisonServices, facts, [
    facts.entries[0] ?? [],
    facts.entries[1] ?? [],
    landed,
  ]);
  const testsLocation = makeMe.anIntentLocation
    .at("tests")
    .ofKind("shell", ["*.sh"])
    .selecting("tests/check.sh")
    .please();
  await mountComparison(page, comparisonServer, {
    ...facts,
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
  await page.getByRole("button", { name: /^tests, shell,/ }).click();
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
  expect(comparisonServices.comparisons).toBe(1);
  expect(comparisonServices.proofs).toBe(3);
});
