// Project-owned generation instructions survive the published read and appear
// with historical proof in a file's Proof. They are text, while missing or
// invalid instructions leave successful proof readable.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import {
  featuresPath,
  publishIntentProject,
  pygardon,
  pygardonFeatureSources,
  pygardonSettings,
  stooqPath,
} from "./intentEntryFolderSummariesFixtures.ts";

const command =
  "RECORD_CUCUMBER_PROOF=1 npm run test:e2e -- --name 'Refresh quotes'";
const skill = "generate-quotes-proof";

for (const [situation, generation, instruction] of [
  [
    "a command",
    { command },
    `Generate or refresh proof from the repository root: ${command}`,
  ],
  [
    "a skill",
    { skill },
    `Generate or refresh proof with this project’s skill: ${skill}`,
  ],
  ["missing configuration", undefined, "Proof generation is not configured."],
  [
    "two competing instructions",
    { command, skill },
    "Proof generation is invalid.",
  ],
] as const) {
  test(`Intent shows ${situation} beside readable published proof`, async ({
    page,
  }) => {
    const settings = JSON.parse(pygardonSettings) as {
      intent: { locations: { proofGeneration?: unknown }[] };
    };
    if (generation !== undefined) {
      const first = settings.intent.locations[0];
      if (first !== undefined) first.proofGeneration = generation;
    }
    await publishIntentProject(
      page,
      pygardon,
      JSON.stringify(settings),
      pygardonFeatureSources,
    );
    await openUntilRead(page, "/?project=pygardon");
    const { intent, intentChoice } = parts(page);
    await intentChoice.click();
    await expandIntentGroup(intent, featuresPath);
    await expandIntentFolders(intent, featuresPath);
    await intent.getByRole("button", { name: stooqPath, exact: true }).click();
    const proof = await chooseReadingTab(intent, "Proof");
    await expect(proof).toContainText(instruction);
    await expect(proof).toContainText("Proof is a published snapshot.");
    await expect(proof).toContainText("normal test runs leave it untouched");
    await expect(proof).toContainText(
      "do not establish present product health",
    );
    await expect(proof.getByRole("table")).toContainText("Refresh quotes");
    await expect(proof).toContainText(
      "Last successful proof: 2 scenarios: 2 passed",
    );
    await expect(proof.getByRole("button")).toHaveCount(0);
    await expect(proof.getByRole("link")).toHaveCount(0);
    if (
      generation === undefined ||
      ("skill" in generation && "command" in generation)
    ) {
      await expect(proof).toContainText(".planning/open-dough.json");
      await expect(proof).toContainText("exactly one command or skill");
    }
  });
}
