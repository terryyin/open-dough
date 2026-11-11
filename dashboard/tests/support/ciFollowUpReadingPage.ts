// The retained original feeds the existing Summary and file Proof navigation.
import type { Page } from "@playwright/test";
import { expect } from "./pageTest.ts";
import { chooseStoryTab, intentFile, storyOnly } from "./intentStoryPage.ts";
import {
  expandIntentGroup,
  intentLocationName,
  fileReadingTab,
  proofRegion,
} from "../intentPerspectivePage.ts";
import { evidenceLabels } from "../ciEvidenceLabelsPage.ts";
import { summaryRegion } from "../intentScopeProofPage.ts";

export async function expectOriginalProofNavigation(page: Page) {
  const intent = page.getByRole("main", { name: "Intent", exact: true });
  await chooseStoryTab(intent, "Changed tests");
  if (await storyOnly(intent).isChecked()) await storyOnly(intent).uncheck();
  await intentLocationName(intent, "dashboard/tests").click();
  const summary = summaryRegion(intent);
  await expect(
    evidenceLabels(summary).getByRole("link", { name: "Run 71 · attempt 1" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/terryyin/open-dough/actions/runs/71/attempts/1",
  );
  await expect(
    summary.getByRole("link", { name: "Run 71 · attempt 2" }),
  ).toHaveCount(0);
  await expect(summary).toContainText("2092 passed test cases");
  await expect(evidenceLabels(summary)).not.toContainText("story branch of");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, "dashboard/tests/a.spec.ts").click();
  await fileReadingTab(intent, "Proof").click();
  await expect(
    evidenceLabels(proofRegion(intent)).getByRole("link", {
      name: "Run 71 · attempt 1",
    }),
  ).toBeVisible();
  await expect(
    proofRegion(intent).getByRole("link", { name: "Run 71 · attempt 2" }),
  ).toHaveCount(0);
  for (const link of await proofRegion(intent)
    .getByRole("link", { name: "Run 71 · attempt 1", exact: true })
    .all())
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/terryyin/open-dough/actions/runs/71/attempts/1",
    );
  await chooseStoryTab(intent, "CI comparison");
}
