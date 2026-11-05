// A selected file's Proof keeps its last successful proof after a later
// legacy result invalidates one scenario's earlier success.

import { expect, test } from "./dashboardTest.ts";
import type { CucumberObservation } from "../src/cucumberProof.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import {
  featuresPath,
  proofRunPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
  stooqPath,
} from "./intentEntryFolderSummariesFixtures.ts";

test("a file's Proof retains last successful proof and clears a newer unsuccessful scenario", async ({
  page,
}) => {
  const earlier = JSON.parse(pygardonFeatureSources[proofRunPath]) as {
    observations: CucumberObservation[];
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
  await expandIntentFolders(intent, featuresPath);
  await intent.getByRole("button", { name: stooqPath, exact: true }).click();
  const proof = await chooseReadingTab(intent, "Proof");
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
