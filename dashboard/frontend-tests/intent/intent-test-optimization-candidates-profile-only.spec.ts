// Intent reads a four-section Test Optimization Candidates record
// (../../src/IntentCandidatesRecord.tsx) without its leading pass summary;
// the profile-only note names its mechanism, links it at the shown revision
// and precedes its entries.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { PublishedWork } from "../../src/publishedWork.ts";
import {
  intentCandidates,
  textAsRead,
  textsOf,
} from "./intent-candidates-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-revision-fixtures.ts";

const revision = "97".repeat(20);
const work: PublishedWork = makeMe.aPublishedWork.ofPygardon
  .at(revision)
  .please();
const candidatesTab = page
  .getByRole("tablist", { name: "Project Intent views" })
  .getByRole("tab", { name: "Optimization Candidates", exact: true });
const record = page.getByRole("region", {
  name: "Test Optimization Candidates",
  exact: true,
});

test("Intent reads a four-section record and the note naming its profile-only mechanism without presenting its leading pass summary", async () => {
  const mechanism =
    "Existing mechanism: `@skipOptimizationDueToKnownNecessarySlowness` on a\nScenario or Feature; normal verification and CI still run them. See\n[E2E profiling guidance](../.agents/skills/e2e-authoring/SKILL.md#test-optimization-profiling).";
  const passSummaryRecord = makeMe.aTestOptimizationCandidatesRecord
    .pending(
      "e2e-batch-cold-start",
      `\`${pygardonFeatures.jobs}\` cold start`,
      {
        observedCost: "55.0s first run against 41.9s warm",
      },
    )
    .profileOnly(
      "bazaar-subscription-journey",
      "`bazaar_subscription.feature`, subscribe and unsubscribe",
    )
    .profileOnlyMechanism(mechanism)
    .please()
    .replace(
      "# Test Optimization Candidates\n",
      "# Test Optimization Candidates\n\n## Latest pass\n\n- **Outcome:** Historical pass measurements.\n",
    );
  const { readSource } = publishedWithCandidates(passSummaryRecord);
  await mountPageIntentReading(readSource, work);
  await userEvent.click(candidatesTab);

  await intentCandidates().shows("e2e-batch-cold-start");
  expect(textsOf(record.getByRole("heading", { level: 3 }))).toEqual([
    "Test Optimization Candidates",
    "Pending candidates",
    "Accepted necessary costs",
    "Profile-only exclusions",
    "Transferred obligations",
  ]);
  await expect
    .poll(() =>
      textAsRead(record.getByRole("article", { name: "e2e-batch-cold-start" })),
    )
    .toContain("55.0s first run against 41.9s warm");
  const profileOnly = record.getByRole("region", {
    name: "Profile-only exclusions",
  });
  const note = profileOnly.getByRole("paragraph");
  await expect
    .poll(() => textAsRead(note))
    .toContain(
      "Existing mechanism: `@skipOptimizationDueToKnownNecessarySlowness` on a Scenario or Feature; normal verification and CI still run them.",
    );
  await expect
    .element(note.getByRole("link", { name: /E2E profiling guidance/ }))
    .toHaveAttribute(
      "href",
      `https://github.com/${work.source.repository}/blob/${revision}/.agents/skills/e2e-authoring/SKILL.md#test-optimization-profiling`,
    );
  const exclusion = profileOnly.getByRole("article", {
    name: "bazaar-subscription-journey",
  });
  expect(
    note.element().compareDocumentPosition(exclusion.element()) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    "the note precedes its entries",
  ).toBeTruthy();
  expect(textAsRead(record)).not.toContain("Historical pass measurements.");
});
