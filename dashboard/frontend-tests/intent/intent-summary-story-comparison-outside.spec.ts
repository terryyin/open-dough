// Primary-endpoint outside evidence is named independently of the visible tree.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expect, test } from "vitest";
import { ciReadingText } from "./intent-attempt-proof-page.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
  labelsHeardAs,
  expectLabelInFull,
} from "./intent-summary-evidence-page.ts";
import { openSummary, scopeTable } from "./intent-summary-proof-page.ts";

const outsideRow = "Not in the rows above";

test("Summary names the ghost file and unbroken-down part outside its final row, and names Landed for an entry with no file breakdown", async () => {
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
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withEntriesAt("landed", landed)
    .withLocations(
      makeMe.anIntentLocation
        .at("tests")
        .ofKind("shell", ["*.sh"])
        .selecting("tests/check.sh")
        .please(),
    );
  await openSummaryComparison(story.please());
  const summary = await openSummary("dashboard/tests");
  const last = scopeTable(summary, "dashboard/tests")
    .getByRole("rowheader")
    .last();
  await expect
    .poll(() => ciReadingText(last.query()?.textContent))
    .toBe(outsideRow);
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
  expect(labelsHeardAs(summary, "No file breakdown")).toHaveLength(0);
  await openSummary("tests");
  await expect.element(evidenceLabels(summary, "About these figures"))
    .toMatchAriaInlineSnapshot(`
    - list "About these figures":
      - listitem: No file breakdown , The Landed CI proof summary does not break tests down by file
  `);
  await expectLabelInFull(
    summary,
    "No file breakdown",
    "The Landed CI proof summary does not break tests down by file",
  );
  await expect
    .element(evidenceLabels(summary, outsideRow))
    .not.toBeInTheDocument();
});
