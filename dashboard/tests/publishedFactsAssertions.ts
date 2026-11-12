// The same published canonical, story-card-assignment, and done facts must survive
// both independent arrivals and failures. These assertions observe rendered
// evidence; raw published records remain in publishedFactsArrival.ts.

import type { Locator } from "@playwright/test";
import { canonicalRecord, inspectedDetail } from "./storyCardControls.ts";
import { expectBadges, storyPurpose } from "./storyCardFacts.ts";
import { credit } from "./agentCredit.ts";
import { dependencyDisclosure } from "./storyReference.ts";
import { expect } from "./dashboardTest.ts";
import { preparer, preparingPath, purpose } from "./publishedFactsArrival.ts";
import { executed } from "./recentlyDoneRecords.ts";
import { planPath, repository, revision } from "./sliceClockRecords.ts";

export async function expectCanonicalFacts(queuedCard: Locator) {
  // A Ready assessment behind its blocking dependency is not yet eligible.
  await expectBadges(queuedCard, {
    shown: ["Slice planned", "Blocked by 1 dependency"],
    absent: ["Ready for execution"],
  });
  const detail = await inspectedDetail(queuedCard);
  await expect(storyPurpose(detail)).toHaveText(purpose);
  await expect(detail).toContainText("Assessment: Ready");
  await expect(detail).not.toContainText("Ready for execution");
  await expect(detail).toContainText("1 of 2 slices recorded complete");
  await expect(
    detail.getByRole("link", { name: /^Slice plan/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${revision}/${planPath("preparing")}`,
  );
  await expect(canonicalRecord(detail)).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${revision}/${preparingPath}#preparing`,
  );
  const dependencies = dependencyDisclosure(queuedCard);
  await dependencies
    .getByText("Dependencies · 1 blocking", { exact: true })
    .click();
  await expect(dependencies).toContainText(
    "The consumer needs the supplier's canonical contract.",
  );
  await expect(dependencies).toContainText(
    "The supplier's contract is integrated and verified.",
  );
  await dependencies
    .getByText("Dependencies · 1 blocking", { exact: true })
    .click();
}

export async function expectStoryCardAssignments(
  branchCard: Locator,
  queuedCard: Locator,
) {
  await expect(credit(credit(branchCard).owner).line).toContainText(
    "Akiho-chan · Fixture Committer · Claude Code",
  );
  await expect(credit(queuedCard).preparing).toContainText(
    `PreparingKirara-chan · ${preparer} · Codex`,
  );
}

export async function expectDoneFacts(doneCard: Locator) {
  await expect(doneCard).toContainText(executed.identity);
  await expect(doneCard).toContainText("Terry Yin");
}
