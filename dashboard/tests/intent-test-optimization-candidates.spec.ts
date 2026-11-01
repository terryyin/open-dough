// Intent reads the published Test Optimization Candidates record at the
// observed revision (../src/IntentCandidatesRecord.tsx): labelled Pending
// and Accepted groups with every recorded field (example 1).

import { candidateEntryFields } from "../src/testOptimizationCandidates.ts";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import {
  candidatesRecord,
  expectCandidatesRevision,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishOpenDoughWithCandidates } from "./intentCandidatesFixtures.ts";
import { openDough } from "./intentCodeBrowseFixtures.ts";

const requiredFieldLabels = candidateEntryFields
  .filter((field) => field.required)
  .map((field) => field.label);
const allFieldLabels = candidateEntryFields.map((field) => field.label);

test("Intent shows Pending and Accepted candidate groups with every recorded field and resolves evidence links at the named revision", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await publishOpenDoughWithCandidates(page);

  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();

  const record = candidatesRecord(intent);
  const candidatesControl = intent.getByRole("button", {
    name: "Test Optimization Candidates",
  });
  await expect(candidatesControl).toHaveAttribute("aria-pressed", "true");
  await expectCandidatesRevision(intent, openDough.revision);

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
    ).toContainText("fixture pass for Intent candidates review");
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

  await test.step("Location tree stays usable beside the record; control is keyboard-operable", async () => {
    await intent
      .getByRole("button", {
        name: "dashboard/tests/intent-gherkin-browse.spec.ts",
        exact: true,
      })
      .click();
    await expect(
      intent.getByLabel("dashboard/tests/intent-gherkin-browse.spec.ts source"),
    ).toContainText('test("browses"');
    await candidatesControl.focus();
    await expect(candidatesControl).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(candidatesRecord(intent)).toContainText(
      "launch-records-poll-waits",
    );
  });

  await page.setViewportSize({ width: 420, height: 800 });
  await expect(candidatesRecord(intent)).toBeVisible();
  await expect(candidatesControl).toBeVisible();
});
