// Purpose and Proof tabs for a selected Intent file without a story
// (../../dashboard/src/IntentFileReading.tsx, ../../dashboard/src/IntentFileProof.tsx): Purpose is
// the published source; Proof is that file's judged-run CI row or gap wording
// from Intent's one evidence owner, with the chosen tab kept across file
// selections (SEED-247#restore-file-purpose-and-proof examples 1, 4, 6).
// From Project Intent CI, production, document and test source read at the
// shown revision while a newer one is available, and Home returns to the same
// CI overview with Intent only kept (SEED-420#browse-the-project-at-a-revision).

import type { Locator } from "@playwright/test";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  evidenceLabels,
  expectEvidenceLabels,
} from "../../dashboard/test-support/ciEvidenceLabelsPage.ts";
import { shortRevision } from "../../dashboard/test-support/dashboardParts.ts";
import {
  expect,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  artifactId,
  proofCalls,
} from "../../dashboard/test-support/intentCiProofPage.ts";
import {
  activateIntentHome,
  expectCiAnswer,
  judged,
} from "../../dashboard/test-support/intentCiStatusPage.ts";
import {
  chooseIntentOnly,
  fileSource,
  intentOnly,
  openProjectFile,
  sourceLineText,
} from "../../dashboard/test-support/intentCodeBrowsePage.ts";
import { fileProofTable } from "../../dashboard/test-support/intentFileProofPage.ts";
import {
  browserRevision,
  expandIntentFolders,
  expandIntentGroup,
  fileReadingTab,
  openFileProof,
  proofRegion,
  purposeRegion,
  revisionNotice,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  browsedAt,
  openIntentAtABeforeB,
} from "../../dashboard/test-support/intentProjectSourceFixtures.ts";
import {
  ancestorEvidence,
  bothEntriesSummary,
  openIntent,
} from "../../dashboard/test-support/intentSummaryCiProofFixtures.ts";
import { summaryTextZipAnswer } from "../../dashboard/test-support/support/ciProofCollected.ts";
import { intentFile } from "../../dashboard/test-support/support/intentStoryPage.ts";

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
  // The file's Proof shares the Summary's evidence labels.
  await expectEvidenceLabels(
    evidenceLabels(proof),
    ancestorEvidence(project.revision),
  );
  const table = proof.getByRole("table", {
    name: "CI proof of dashboard/tests/folder/a.spec.ts",
  });
  await expect(table.getByRole("columnheader")).toHaveText([
    "Scope",
    "Counts",
    "Test execution time",
  ]);
  await expect(table.locator("tbody").getByRole("row")).toHaveCount(1);
  await expect(
    table.locator("tbody").getByRole("row").nth(0).getByRole("rowheader"),
  ).toHaveText("dashboard/tests/folder/a.spec.ts");
  await expect(
    table.locator("tbody").getByRole("row").nth(0).getByRole("cell"),
  ).toHaveText(["1 passed and 1 failed test cases", "550 ms"]);

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

// Trunk's CI answer running at REVISION, and the evidence of the measured
// build it keeps judging.
const runningAt = (revision: string) =>
  `Running at ${shortSha(revision)} (Plan the next story)`;
const overviewEvidence = [
  "Run 41 · attempt 1",
  `Revision ${shortSha(judged)}`,
  "Completed ancestor",
  "CI wall time not recorded",
];

type BrowsedPath = keyof ReturnType<typeof browsedAt>;

// The opened file's Purpose shows each source line as published at A, the
// last newline's empty line too.
async function expectPurposeAtA(intent: Locator, path: BrowsedPath) {
  await fileReadingTab(intent, "Purpose").click();
  await expect(sourceLineText(fileSource(intent, path))).toHaveText(
    browsedAt("A")[path].split("\n"),
  );
}

test("from Project Intent CI, source reads at the shown revision A while B is available, and Home returns to the same overview", async ({
  page,
  afterGitHubStops,
}) => {
  const { intent, home, revisions } =
    await test.step("Given Project Intent CI shows revision A", async () => {
      await pausePageClockAt(page, new Date());
      const opened = await openIntentAtABeforeB(page, afterGitHubStops, () =>
        summaryTextZipAnswer(bothEntriesSummary(true)),
      );
      return { ...opened, revisions: opened.project.revisions };
    });
  await test.step("And its CI answer runs at A", () =>
    expectCiAnswer(home, runningAt(revisions.A)));
  await test.step("Given trunk's move to B has been checked", () =>
    passTimeUntilChecked(page));
  await test.step("Then the browser stays at A with the newer revision noticed", async () => {
    await expect(revisionNotice(intent)).toContainText(
      "New revision available",
    );
    await expect(browserRevision(intent)).toContainText(
      shortRevision(revisions.A),
    );
  });
  await test.step("Then the CI overview judges B over the same measured build", async () => {
    await expectCiAnswer(home, runningAt(revisions.B));
    await expectEvidenceLabels(evidenceLabels(home), overviewEvidence);
  });

  await test.step("When I open production source, it reads at A", async () => {
    await openProjectFile(intent, "dashboard/src/login.ts");
    await expectPurposeAtA(intent, "dashboard/src/login.ts");
  });
  await test.step("Then its Proof explains the absent file-level result of the measured build", async () => {
    await openFileProof(page);
    await expectEvidenceLabels(
      evidenceLabels(proofRegion(intent)),
      ancestorEvidence(revisions.A),
    );
    await expect(
      proofRegion(intent).locator(".intent-summary-evidence-absent"),
    ).toHaveText(
      "This CI proof summary declares no entry holding dashboard/src/login.ts.",
    );
  });
  await test.step("When I open a neighboring document, it reads at A", async () => {
    await openProjectFile(intent, "docs/login.md");
    await expectPurposeAtA(intent, "docs/login.md");
  });
  await test.step("When I open a configured test, it reads at A", async () => {
    await openProjectFile(intent, "dashboard/tests/folder/a.spec.ts");
    await expectPurposeAtA(intent, "dashboard/tests/folder/a.spec.ts");
  });
  await test.step("Then its Proof measures it in the measured build", async () => {
    await openFileProof(page);
    await expectEvidenceLabels(
      evidenceLabels(proofRegion(intent)),
      ancestorEvidence(revisions.A),
    );
    await expect(
      fileProofTable(proofRegion(intent), "dashboard/tests/folder/a.spec.ts")
        .locator("tbody")
        .getByRole("cell"),
    ).toHaveText(["1 passed and 1 failed test cases", "550 ms"]);
  });

  const back =
    await test.step("When I keep Intent only on and press Home", async () => {
      await chooseIntentOnly(intent);
      return activateIntentHome(intent);
    });
  await test.step("Then the same CI overview returns", async () => {
    await expectCiAnswer(back, runningAt(revisions.B));
    await expectEvidenceLabels(evidenceLabels(back), overviewEvidence);
  });
  await test.step("And Intent only stays on", () =>
    expect(intentOnly(intent)).toBeChecked());
});
