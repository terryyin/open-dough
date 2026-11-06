// Purpose and Proof tabs for a selected Intent file without a story
// (../../src/IntentFileReading.tsx, ../../src/IntentFileProof.tsx): Purpose is
// the published source; Proof is that file's judged-run CI row or gap wording
// from Intent's one evidence owner, with the chosen tab kept across file
// selections (SEED-247#restore-file-purpose-and-proof examples 1, 4, 6).

import { expect, test } from "../dashboardTest.ts";
import { artifactId, proofCalls } from "../intentCiProofPage.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  proofRegion,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import { intentFile } from "../support/intentStoryPage.ts";
import {
  allParts,
  ancestorEvidence,
  bothEntriesSummary,
  openIntent,
} from "../intentSummaryCiProofFixtures.ts";
import { summaryTextZipAnswer } from "../support/ciProofCollected.ts";

test.setTimeout(90_000);

test("a selected file offers Purpose source and Proof CI results, keeping the chosen tab across files", async ({
  page,
}) => {
  const text = bothEntriesSummary(true);
  const { project, intent } = await openIntent(page, () =>
    summaryTextZipAnswer(text),
  );

  await expandIntentGroup(intent, "dashboard/tests");
  await expandIntentFolders(intent, "dashboard/tests");
  await intentFile(intent, "dashboard/tests/folder/a.spec.ts").click();
  const purposeTab = fileReadingTab(intent, "Purpose");
  const proofTab = fileReadingTab(intent, "Proof");
  await expect(purposeTab).toHaveAttribute("aria-selected", "true");
  await expect(purposeRegion(intent)).toContainText('test("a"');
  await expect(purposeRegion(intent).getByRole("table")).toHaveCount(0);

  await proofTab.click();
  const proof = proofRegion(intent);
  await expect(proofTab).toHaveAttribute("aria-selected", "true");
  await expect(proof.locator(".intent-summary-evidence")).toHaveText(
    ancestorEvidence,
  );
  const table = proof.getByRole("table", {
    name: "CI proof of dashboard/tests/folder/a.spec.ts",
  });
  await expect(table.getByRole("columnheader")).toHaveText([
    "Scope",
    "Counts",
    "Test execution time",
    "Parts",
  ]);
  await expect(table.locator("tbody").getByRole("row")).toHaveCount(1);
  await expect(
    table.locator("tbody").getByRole("row").nth(0).getByRole("rowheader"),
  ).toHaveText("dashboard/tests/folder/a.spec.ts");
  await expect(
    table.locator("tbody").getByRole("row").nth(0).getByRole("cell"),
  ).toHaveText(["1 passed and 1 failed tests", "550 ms", allParts]);

  await test.step("choosing another file keeps Proof and shows that file's gap without borrowing", async () => {
    await intentFile(intent, "dashboard/tests/added.spec.ts").click();
    await expect(fileReadingTab(intent, "Proof")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const added = proofRegion(intent);
    const addedTable = added.getByRole("table", {
      name: "CI proof of dashboard/tests/added.spec.ts",
    });
    await expect(addedTable.getByRole("cell")).toHaveText([
      "no CI result",
      "no CI result",
      allParts,
    ]);
    await expect(added.getByRole("table")).toHaveCount(1);
  });

  await test.step("Proof reused the homepage's one CI evidence read", () => {
    expect(proofCalls(project.requests)).toEqual([
      `artifacts of run 41: ci-proof-summary-attempt-1`,
      `zip ${String(artifactId)}`,
    ]);
  });
});
