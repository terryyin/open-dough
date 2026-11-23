import { expect, test } from "vitest";
import type { ComparedStory } from "../../../Distribution/tests/support/comparedStoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { ciReadingText } from "./intent-attempt-proof-page.ts";
import { openSummaryComparison } from "./intent-summary-comparison-fixture.ts";
import {
  comparisonLabels,
  expectFallback,
  fileProofTable,
  openComparedFileProof,
  openComparedFolder,
} from "./intent-summary-comparison-page.ts";
import { expectEvidenceLabels } from "./intent-summary-evidence-page.ts";
import { openSummary } from "./intent-summary-proof-page.ts";

const entry = "dashboard/tests";
const folder = `${entry}/folder`;
const nested = `${folder}/nested`;

test("Taken Trunk Summary and file Proof name the same Provisional endpoint and unused Landed explanation", async () => {
  const story = makeMe.aComparedStory.inSummaryScope().takenOnTrunk().please();
  await openSummaryComparison(story);
  const summary = await openSummary(entry);
  const showsProvisional = async (region: typeof summary) => {
    await expectFallback(region, "Provisional", "has not landed yet", {
      partial: true,
    });
    await expectEvidenceLabels(
      comparisonLabels(region, "Story A"),
      [
        "Baseline No build aaaaaaa",
        "Branch Not applicable",
        "Provisional bbbbbbb",
        "Landed Not landed yet",
      ],
      { leading: true },
    );
  };
  await showsProvisional(summary);
  await openComparedFolder(summary, folder);
  await showsProvisional(summary);
  await openSummary(entry);
  const proof = await openComparedFileProof(summary, "root.spec.ts");
  await showsProvisional(proof);
});

async function showsBranchFallback(story: ComparedStory, reason: string) {
  await openSummaryComparison(story);
  const summary = await openSummary(entry);
  await expectFallback(summary, "Branch", reason);
  await openComparedFolder(summary, folder);
  await expectFallback(summary, "Branch", reason);
  await openComparedFolder(summary, nested);
  await expectFallback(summary, "Branch", reason);
  const proof = await openComparedFileProof(summary, "c.spec.ts");
  await expectFallback(proof, "Branch", reason);
  const time = fileProofTable(proof, `${nested}/c.spec.ts`)
    .getByRole("cell")
    .nth(2);
  await expect
    .poll(() => ciReadingText(time.query()?.textContent))
    .toBe("+70 ms");
}

test("Landed running preserves one Branch fallback through entry, folders and file Proof", async () => {
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withLanded({ kind: "running" })
    .please();
  await showsBranchFallback(
    story,
    "Landed is not used: Build is still running.",
  );
});

test("Landed no proof preserves one Branch fallback through entry, folders and file Proof", async () => {
  const story = makeMe.aComparedStory
    .inSummaryScope()
    .withProofAt("landed", makeMe.aCiProof.unavailable("none").please())
    .please();
  await showsBranchFallback(
    story,
    "Landed is not used: This run published no CI proof summary.",
  );
});
