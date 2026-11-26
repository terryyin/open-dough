// Intent reads the published Test Optimization Candidates record at the
// shown revision (../../src/IntentCandidatesRecord.tsx) on its own
// Optimization Candidates tab (../../src/intentProjectTabs.ts): entering
// Intent shows CI status with the locations; the record shows labelled
// Pending and Accepted groups with every recorded field across the reading
// without the locations, and returning keeps the file read in Purpose.
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pygardonFeatures } from "../../../Distribution/tests/support/publishedFilesTestData.mjs";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { findingEntryFields } from "../../src/testOptimizationCandidatesRecord.ts";
import { intentBrowser } from "./intent-browser-page.ts";
import {
  intentCandidates,
  intentViews,
  intentViewTab,
  textAsRead,
  textsOf,
} from "./intent-candidates-page.ts";
import { intentFileReading } from "./intent-file-reading-page.ts";
import {
  mountPageIntentReading,
  publishedWithCandidates,
} from "./intent-candidates-publication.ts";

const revision = "97".repeat(20);
const work: PublishedWork = makeMe.aPublishedWork.ofPygardon
  .at(revision)
  .please();
const evidencePath = ".planning/evidence/test-cost-comparison.md";
const pinnedSnapshot = "40e1d2f9:.planning/slice-plans/432-proof/PLAN.md";

const findingRecord = makeMe.aTestOptimizationCandidatesRecord
  .pending("launch-records-poll-waits", "`launch.spec.ts` waits", {
    observedCost: "about 60 summed seconds",
    uniqueProtection: "a delivered report reaches the open page",
    alternativesAttempted: "none",
    dispositionRationale: "pending — a cheaper design is credible",
    date: "2026-11-01",
    humanDecisionNeeded: "whether a page-clock redesign is worth the rewrite",
    evidence: `Results in \`${pinnedSnapshot}\``,
  })
  .pending("moved-test-after-record", "`moved.spec.ts`", {
    observedCost: "was about 12s",
    uniqueProtection: "former path",
    alternativesAttempted: "none",
    dispositionRationale: "pending — path must be rewritten",
    date: "2026-11-01",
    evidence: "recorded before the move",
  })
  .accepted("story-review-landed-runs-tail", "`story-review.spec.ts`", {
    observedCost: "about 10s",
    uniqueProtection: "Landed runs round trip",
    alternativesAttempted: "end journey earlier — no gain",
    dispositionRationale: "accepted necessary cost — retain the path.",
    date: "2026-11-01",
    evidence: `[source comparison and ROI](../${evidencePath})`,
  })
  .accepted("agent-launch-poles", "`dashboard/tests/second-server.spec.ts`", {
    observedCost: "52.5s",
    uniqueProtection: "dual-preview page protection",
    alternativesAttempted: "refusal moved to boundary",
    dispositionRationale:
      "accepted necessary cost — preserve the unique journeys.",
    date: "2026-10-30",
    evidence: "local measurements",
  })
  .accepted("long-integrated-journeys", "`attention.spec.ts`", {
    observedCost: "about 40s",
    uniqueProtection: "attention reporting stays durable",
    alternativesAttempted: "policy consolidation",
    dispositionRationale: "accepted necessary cost — retain protection.",
    date: "2026-10-30",
    evidence: "accepted triage",
  })
  .please();

const intent = page.getByRole("region", { name: "Project Intent" });
const ciTab = intentViewTab("CI status");
const candidatesTab = intentViewTab("Optimization Candidates");
const { record } = intentCandidates();
const purpose = page.getByRole("region", { name: "Purpose", exact: true });
const locationsFolder = page.getByRole("button", {
  name: "Expand e2e_test",
});
const labels = (required: boolean) =>
  findingEntryFields
    .filter((field) => !required || field.required)
    .map((field) => field.label);

test("Intent enters on CI status; Optimization Candidates reads the shown revision's record across the reading, and the keyboard returns to the file kept in Purpose", async () => {
  const { reads, readSource } = publishedWithCandidates(findingRecord);
  await mountPageIntentReading(readSource, work);

  await expect
    .poll(() => textsOf(intentViews.getByRole("tab")))
    .toEqual(["CI status", "Optimization Candidates"]);
  await expect.element(ciTab).toHaveAttribute("aria-selected", "true");
  await expect.element(candidatesTab).toHaveAttribute("aria-selected", "false");
  await expect.element(locationsFolder).toBeVisible();
  await expect.element(purpose).not.toBeInTheDocument();
  await expect.element(record).not.toBeInTheDocument();
  expect(reads, "no record is read before its view is chosen").toEqual([]);

  await (await intentCandidates().choose()).isRecordedAt(revision);
  expect(reads).toEqual([revision]);
  await expect.element(locationsFolder).not.toBeInTheDocument();
  await expect.element(purpose).not.toBeInTheDocument();
  const reading = intent.element().getBoundingClientRect();
  const panel = page
    .getByRole("tabpanel", { name: "Optimization Candidates" })
    .element()
    .getBoundingClientRect();
  expect(panel.x, "the record starts at Intent's left edge").toBe(reading.x);
  expect(panel.width, "the record spans Intent's width").toBe(reading.width);

  const pending = record.getByRole("region", { name: "Pending candidates" });
  const accepted = record.getByRole("region", {
    name: "Accepted necessary costs",
  });
  await expect
    .poll(() => textsOf(pending.getByRole("heading", { level: 4 })))
    .toEqual(["launch-records-poll-waits", "moved-test-after-record"]);
  expect(textsOf(accepted.getByRole("heading", { level: 4 }))).toEqual([
    "story-review-landed-runs-tail",
    "agent-launch-poles",
    "long-integrated-journeys",
  ]);
  const waits = pending.getByRole("article", {
    name: "launch-records-poll-waits",
  });
  expect(textsOf(waits.getByRole("term"))).toEqual(labels(false));
  await expect
    .element(waits.getByRole("definition").nth(6))
    .toHaveTextContent("whether a page-clock redesign is worth the rewrite");
  const poles = accepted.getByRole("article", { name: "agent-launch-poles" });
  expect(textsOf(poles.getByRole("term"))).toEqual(labels(true));
  await expect
    .poll(() => textAsRead(poles.getByRole("definition").nth(0)))
    .toContain("dashboard/tests/second-server.spec.ts");
  await expect
    .poll(() => textAsRead(poles.getByRole("definition").nth(4)))
    .toContain("accepted necessary cost");
  await expect
    .poll(() => textAsRead(poles.getByRole("definition").nth(4)))
    .not.toMatch(/skipped|excluded as a cost/i);
  await expect
    .element(poles.getByRole("definition").nth(5))
    .toHaveTextContent("2026-10-30");
  for (const empty of ["Profile-only exclusions", "Transferred obligations"])
    await expect
      .poll(() => textAsRead(record.getByRole("region", { name: empty })))
      .toContain("None.");
  await expect
    .element(record.getByRole("region", { name: "Latest pass" }))
    .not.toBeInTheDocument();
  await expect
    .element(
      record
        .getByRole("article", { name: "story-review-landed-runs-tail" })
        .getByRole("link", { name: /source comparison and ROI/i }),
    )
    .toHaveAttribute(
      "href",
      `https://github.com/${work.source.repository}/blob/${revision}/${evidencePath}`,
    );
  expect(textAsRead(record)).toContain(pinnedSnapshot);

  await intentCandidates().leaveForCiStatus();
  await expect.element(record).not.toBeInTheDocument();
  await (
    await intentBrowser().open(pygardonFeatures.jobs)
  ).shows("Scenario: List jobs");

  (ciTab.element() as HTMLElement).focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(candidatesTab).toHaveFocus();
  await expect.element(candidatesTab).toHaveAttribute("aria-selected", "true");
  await intentCandidates().shows("launch-records-poll-waits");
  await expect
    .element(page.getByRole("button", { name: pygardonFeatures.jobs }))
    .not.toBeInTheDocument();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(ciTab).toHaveFocus();
  await expect.element(ciTab).toHaveAttribute("aria-selected", "true");
  await (
    await intentFileReading(pygardonFeatures.jobs).isSelected()
  ).shows("Scenario: List jobs");
  expect(reads, "returning reads the record once").toEqual([revision]);

  await page.viewport(420, 800);
  await userEvent.click(candidatesTab);
  await expect.element(record).toBeVisible();
  await expect.element(ciTab).toBeVisible();
});
