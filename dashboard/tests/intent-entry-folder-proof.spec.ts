// Successful proof agrees across folder, child and selected-file readings
// after a later legacy result invalidates one scenario's earlier success.

import { expect, test } from "./dashboardTest.ts";
import type { ProofObservation } from "../src/cucumberProof.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  expandIntentGroup,
  intentFolderName,
} from "./intentPerspectivePage.ts";
import {
  featuresPath,
  proofRunPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
  stooqPath,
} from "./intentEntryFolderSummariesFixtures.ts";

test("folder summaries retain last successful proof and clear a newer unsuccessful scenario", async ({
  page,
}) => {
  const earlier = JSON.parse(pygardonFeatureSources[proofRunPath]) as {
    observations: ProofObservation[];
  };
  await publishIntentProject(page, pygardon, pygardonSettings, {
    ...pygardonFeatureSources,
    [`${proofRunPath}.later.json`]: JSON.stringify({
      version: 1,
      observations: [
        {
          ...earlier.observations[1],
          outcome: "failed",
          finishedAt: "2026-11-01T11:00:00.000Z",
        },
      ],
    }),
  });
  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, featuresPath);
  await intentFolderName(intent, "jobs").click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary).toContainText(
    "Last successful proof: 5 scenarios: 1 passed, 4 without successful proof",
  );
  const children = summary.getByRole("list", {
    name: "Summary by folder and file",
  });
  await expect(children.locator(":scope > li").nth(1)).toContainText(
    "Last successful proof: 2 scenarios: 1 passed, 1 without successful proof",
  );
  await intent.getByRole("button", { name: stooqPath, exact: true }).click();
  const proof = intent.getByRole("region", { name: "Proof" });
  await expect(proof).toContainText(
    "Last successful proof: 2 scenarios: 1 passed, 1 without successful proof",
  );
  const rows = proof.getByRole("row");
  await expect(rows.filter({ hasText: "Refresh quotes" })).toContainText(
    "Passed",
  );
  await expect(rows.filter({ hasText: "Refresh again" })).toContainText(
    "No successful proof",
  );
});
