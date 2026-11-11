import { fileSource, sourceFile } from "../intentCodeBrowsePage.ts";
// Intent reads the published Test Optimization Candidates record at the
// observed revision (../../src/IntentCandidatesRecord.tsx) on its own
// Optimization Candidates tab (../../src/IntentPage.tsx): entering Intent
// shows the Intent tab with locations and CI status; the record shows
// labelled Pending and Accepted groups with every recorded field (example 1)
// across the content area without the locations. A four-section record's
// leading pass summary stays unshown, and the note naming its profile-only
// mechanism shows before that section's entries.

import { findingEntryFields } from "../../src/testOptimizationCandidatesRecord.ts";
import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  expandIntentGroup,
  intentGroupToggle,
  purposeRegion,
} from "../intentPerspectivePage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  intentModeTab,
} from "../intentModePage.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import {
  doughnutFeaturePath,
  publishDoughnutWithCandidates,
  publishOpenDoughWithCandidates,
} from "../intentCandidatesFixtures.ts";
import { doughnut, openDough } from "../intentCodeBrowseFixtures.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

const requiredFieldLabels = findingEntryFields
  .filter((field) => field.required)
  .map((field) => field.label);
const allFieldLabels = findingEntryFields.map((field) => field.label);

test("Intent opens on its Intent tab; Optimization Candidates shows Pending and Accepted groups with every recorded field without the locations and resolves evidence links at the named revision", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishOpenDoughWithCandidates(page);

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  const record = candidatesRecord(intent);
  const intentTab = intentModeTab(intent, "CI status");
  const candidatesTab = intentModeTab(intent, "Optimization Candidates");
  const locations = intent.locator(".intent-locations");

  await test.step("entering Intent selects the Intent tab: locations and CI homepage, no locations-column candidates control", async () => {
    await expect(
      intent
        .getByRole("tablist", { name: "Project Intent views" })
        .getByRole("tab"),
    ).toHaveText(["CI status", "Optimization Candidates"]);
    await expect(intentTab).toHaveAttribute("aria-selected", "true");
    await expect(candidatesTab).toHaveAttribute("aria-selected", "false");
    await expect(intentGroupToggle(intent, "dashboard/tests")).toBeVisible();
    await expect(
      intent.getByRole("region", { name: "CI status", exact: true }),
    ).toBeVisible();
    await expect(purposeRegion(intent)).toHaveCount(0);
    await expect(
      intent.getByRole("button", { name: "Test Optimization Candidates" }),
    ).toHaveCount(0);
    await expect(record).toHaveCount(0);
  });

  await chooseOptimizationCandidates(intent);
  await expect(intentTab).toHaveAttribute("aria-selected", "false");
  await expect(purposeRegion(intent)).toHaveCount(0);
  await expectCandidatesRevision(intent, openDough.revision);
  const [content, report] = await Promise.all([
    intent.boundingBox(),
    intent
      .getByRole("tabpanel", { name: "Optimization Candidates" })
      .boundingBox(),
  ]);
  expect(report?.x, "the record starts at Intent's left edge").toBe(content?.x);
  expect(report?.width, "the record spans Intent's width").toBe(content?.width);

  await test.step("Ex 1: pending and accepted groups, slugs, and every recorded field in record order", async () => {
    const pending = record.getByRole("region", {
      name: "Pending candidates",
    });
    const accepted = record.getByRole("region", {
      name: "Accepted necessary costs",
    });
    await expect(pending.getByRole("article")).toHaveCount(2);
    await expect(accepted.getByRole("article")).toHaveCount(3);
    await expect(pending.getByRole("heading", { level: 4 })).toHaveText([
      "launch-records-poll-waits",
      "moved-test-after-record",
    ]);
    await expect(accepted.getByRole("heading", { level: 4 })).toHaveText([
      "story-review-completed-journey-landed-runs-tail",
      "agent-launch-poles",
      "long-integrated-journeys",
    ]);

    const pendingEntry = pending.getByRole("article", {
      name: "launch-records-poll-waits",
    });
    await expect(pendingEntry.getByRole("term")).toHaveText(allFieldLabels);
    await expect(pendingEntry.getByRole("definition").nth(6)).toHaveText(
      "whether a page-clock redesign is worth the rewrite before optimizing",
    );

    const poles = accepted.getByRole("article", {
      name: "agent-launch-poles",
    });
    await expect(poles.getByRole("term")).toHaveText(requiredFieldLabels);
    await expect(poles.getByRole("definition").nth(0)).toContainText(
      "dashboard/tests/agent-launch-second-server.spec.ts",
    );
    await expect(poles.getByRole("definition").nth(4)).toContainText(
      "accepted necessary cost",
    );
    await expect(poles.getByRole("definition").nth(4)).not.toContainText(
      /skipped|excluded as a cost/i,
    );
    await expect(poles.getByRole("definition").nth(5)).toHaveText("2026-10-30");

    await expect(
      record.getByRole("region", { name: "Profile-only exclusions" }),
    ).toContainText("None.");
    await expect(
      record.getByRole("region", { name: "Transferred obligations" }),
    ).toContainText("None.");
    await expect(
      record.getByRole("region", { name: "Latest pass" }),
    ).toHaveCount(0);
  });

  await test.step("Evidence Markdown link opens the pinned snapshot; sha:path stays recorded text", async () => {
    const evidenceLink = record
      .getByRole("article", {
        name: "story-review-completed-journey-landed-runs-tail",
      })
      .getByRole("link", { name: /source comparison and ROI/i });
    await expect(evidenceLink).toHaveAttribute(
      "href",
      `https://github.com/${openDough.repository}/blob/${openDough.revision}/docs/maintainer/dashboard-test-value-review.md`,
    );
    await expect(record).toContainText(
      "40e1d2f9:.planning/slice-plans/432-reduce-dashboard-proof-cost/PLAN.md",
    );
  });

  await test.step("Intent tab brings back the locations with Purpose; the tabs are keyboard-operable", async () => {
    await intentTab.click();
    await expect(intentTab).toHaveAttribute("aria-selected", "true");
    await expect(record).toBeHidden();
    await expandIntentGroup(intent, "dashboard/tests");
    await sourceFile(
      intent,
      "dashboard/tests/intent-gherkin-browse.spec.ts",
    ).click();
    await expect(
      fileSource(intent, "dashboard/tests/intent-gherkin-browse.spec.ts"),
    ).toContainText('test("browses"');

    await intentTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(candidatesTab).toBeFocused();
    await expect(candidatesTab).toHaveAttribute("aria-selected", "true");
    await expect(candidatesRecord(intent)).toContainText(
      "launch-records-poll-waits",
    );
    await expect(locations).toBeHidden();
    await page.keyboard.press("ArrowLeft");
    await expect(intentTab).toBeFocused();
    await expect(intentTab).toHaveAttribute("aria-selected", "true");
    await expect(
      fileSource(intent, "dashboard/tests/intent-gherkin-browse.spec.ts"),
    ).toBeVisible();
  });

  await page.setViewportSize({ width: 420, height: 800 });
  await chooseOptimizationCandidates(intent);
  await expect(candidatesRecord(intent)).toBeVisible();
  await expect(intentTab).toBeVisible();
});

test("Intent reads a four-section record and the note naming its profile-only mechanism without presenting its leading pass summary", async ({
  page,
}) => {
  const mechanism =
    "Existing mechanism: `@skipOptimizationDueToKnownNecessarySlowness` on a\nScenario or Feature; normal verification and CI still run them. See\n[E2E profiling guidance](../.agents/skills/e2e-authoring/SKILL.md#test-optimization-profiling).";
  const passSummaryRecord = makeMe.aTestOptimizationCandidatesRecord
    .pending("e2e-batch-cold-start", `\`${doughnutFeaturePath}\` cold start`, {
      observedCost: "55.0s first run against 41.9s warm",
    })
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
  await publishDoughnutWithCandidates(page, passSummaryRecord);
  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await chooseOptimizationCandidates(intent);

  const record = candidatesRecord(intent);
  await expect(record.getByRole("heading", { level: 3 })).toHaveText([
    "Test Optimization Candidates",
    "Pending candidates",
    "Accepted necessary costs",
    "Profile-only exclusions",
    "Transferred obligations",
  ]);
  await expect(
    record.getByRole("article", { name: "e2e-batch-cold-start" }),
  ).toContainText("55.0s first run against 41.9s warm");
  const profileOnly = record.getByRole("region", {
    name: "Profile-only exclusions",
  });
  const note = profileOnly.locator(".intent-candidate-note");
  await expect(note).toContainText(
    "Existing mechanism: `@skipOptimizationDueToKnownNecessarySlowness` on a Scenario or Feature; normal verification and CI still run them.",
  );
  await expect(
    note.getByRole("link", { name: /E2E profiling guidance/ }),
  ).toHaveAttribute(
    "href",
    `https://github.com/${doughnut.repository}/blob/${doughnut.revision}/.agents/skills/e2e-authoring/SKILL.md#test-optimization-profiling`,
  );
  await expect(
    profileOnly.locator(".intent-candidate-note + article"),
  ).toHaveAttribute("data-slug", "bazaar-subscription-journey");
  await expect(record).not.toContainText("Historical pass measurements.");
});
