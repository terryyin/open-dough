// Intent reads the published Test Optimization Candidates record at the
// observed revision (../src/IntentCandidatesRecord.tsx) on its own
// Optimization Candidates tab (../src/IntentModeTabs.tsx): entering Intent
// shows the Intent tab with locations, Purpose and Proof; the record shows
// labelled Pending and Accepted groups with every recorded field (example 1)
// across the content area without the locations.

import { candidateEntryFields } from "../src/testOptimizationCandidates.ts";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  chooseReadingTab,
  expandIntentGroup,
  expectCandidatesRevision,
  intentGroupToggle,
  intentModeTab,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  openDoughCandidatesRecord,
  publishOpenDoughWithCandidates,
} from "./intentCandidatesFixtures.ts";
import { openDough } from "./intentCodeBrowseFixtures.ts";

const requiredFieldLabels = candidateEntryFields
  .filter((field) => field.required)
  .map((field) => field.label);
const allFieldLabels = candidateEntryFields.map((field) => field.label);

test("Intent opens on its Intent tab; Optimization Candidates shows Pending and Accepted groups with every recorded field without the locations and resolves evidence links at the named revision", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishOpenDoughWithCandidates(page);

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  const record = candidatesRecord(intent);
  const intentTab = intentModeTab(intent, "Intent");
  const candidatesTab = intentModeTab(intent, "Optimization Candidates");
  const locations = intent.locator(".intent-locations");

  await test.step("entering Intent selects the Intent tab: locations, Purpose and Proof, no locations-column candidates control", async () => {
    await expect(
      intent.getByRole("tablist", { name: "Intent reading" }).getByRole("tab"),
    ).toHaveText(["Intent", "Optimization Candidates", "CI status"]);
    await expect(intentTab).toHaveAttribute("aria-selected", "true");
    await expect(candidatesTab).toHaveAttribute("aria-selected", "false");
    await expect(intentGroupToggle(intent, "dashboard/tests")).toBeVisible();
    await expect(intent.getByRole("region", { name: "Purpose" })).toContainText(
      "Select a feature file to read its Purpose.",
    );
    await expect(await chooseReadingTab(intent, "Proof")).toContainText(
      "Select a feature file to see its Proof.",
    );
    await expect(
      intent.getByRole("button", { name: "Test Optimization Candidates" }),
    ).toHaveCount(0);
    await expect(record).toHaveCount(0);
  });

  await chooseOptimizationCandidates(intent);
  await expect(intentTab).toHaveAttribute("aria-selected", "false");
  await expect(intent.getByRole("region", { name: "Proof" })).toHaveCount(0);
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

  await test.step("Intent tab brings back the locations with Purpose and Proof; the tabs are keyboard-operable", async () => {
    await intentTab.click();
    await expect(intentTab).toHaveAttribute("aria-selected", "true");
    await expect(record).toBeHidden();
    await expandIntentGroup(intent, "dashboard/tests");
    await intent
      .getByRole("button", {
        name: "dashboard/tests/intent-gherkin-browse.spec.ts",
        exact: true,
      })
      .click();
    await expect(
      intent.getByLabel("dashboard/tests/intent-gherkin-browse.spec.ts source"),
    ).toContainText('test("browses"');
    await chooseReadingTab(intent, "Proof");

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
    await expect(intent.getByRole("region", { name: "Proof" })).toBeVisible();
    await chooseReadingTab(intent, "Purpose");
    await expect(
      intent.getByLabel("dashboard/tests/intent-gherkin-browse.spec.ts source"),
    ).toBeVisible();
  });

  await page.setViewportSize({ width: 420, height: 800 });
  await chooseOptimizationCandidates(intent);
  await expect(candidatesRecord(intent)).toBeVisible();
  await expect(intentTab).toBeVisible();
});

test("Intent reads findings from an older record without presenting its pass summary", async ({
  page,
}) => {
  const historicalRecord = openDoughCandidatesRecord.replace(
    "# Test Optimization Candidates\n",
    "# Test Optimization Candidates\n\n## Latest pass\n\nHistorical pass measurements.\n",
  );
  await publishOpenDoughWithCandidates(page, historicalRecord);
  await openUntilRead(page, "/?project=open-dough");
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
    record.getByRole("article", { name: "launch-records-poll-waits" }),
  ).toContainText("about 60 summed seconds");
  await expect(record).not.toContainText("Historical pass measurements.");
});
