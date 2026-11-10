// One comparison language while drilling: each displayed scope scales only
// its own figures and rows, with one live story preference and no CI reread.
import type { Locator } from "@playwright/test";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { fileReadingTab, proofRegion } from "../intentPerspectivePage.ts";
import {
  childName,
  scopeFigures,
  scopeTable,
} from "../intentScopeProofPage.ts";
import { untilPageRequestsAnswered } from "../pageRequestNotes.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { expect, test } from "../support/preparationPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import {
  openSummaryComparison,
  selectDoneStoryForSummaryComparison,
} from "../support/selectDoneStoryForSummaryComparison.ts";
import { chooseStoryTab, intentFile } from "../support/intentStoryPage.ts";
import {
  expectMark,
  markGeometry,
  percentages,
  showPercent,
} from "../support/relativeTimingMarks.ts";
import { rowNames, sortButton } from "../support/expectSortedColumns.ts";

// These journeys change the reading scope, not time. Recurring revision
// checks would otherwise race the final no-reread observation on a busy host.
test.beforeEach(async ({ page }) => {
  await pausePageClockAt(page, new Date());
});

const compared = (region: Locator) =>
  region.locator(".intent-ci-comparison-frame");
const childBranch = (summary: Locator, path: string, name: string) =>
  scopeTable(summary, path)
    .locator("tbody tr")
    .filter({
      has: summary.page().getByRole("rowheader", { name, exact: true }),
    })
    .getByRole("cell")
    .nth(3);
const ownBranch = (summary: Locator, path: string) =>
  scopeFigures(summary, path).getByRole("definition").nth(2);

test("story, location, folder and file share signed words, preference and per-display relative scales without rereading CI", async ({
  page,
  origin,
}) => {
  await publishSummaryComparisonStory(page, origin, "own-conflict-extra");
  const ciReads: string[] = [];
  const textReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const kind = url.searchParams.get("intent");
    if (kind === "ci-comparison" || kind === "ci-proof")
      ciReads.push(`${kind} ${url.search}`);
    if ((url.searchParams.get("path") ?? "").endsWith(".spec.ts"))
      textReads.push(url.search);
  });
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  await chooseStoryTab(intent, "CI comparison");
  const story = intent.getByRole("tabpanel", { name: "CI comparison" });
  await expect(
    compared(story).getByRole("heading", {
      name: "Baseline compared with Landed",
      exact: true,
    }),
  ).toBeVisible();
  await expect(showPercent(story)).not.toBeChecked();
  await expect(percentages(story)).toHaveCount(0);
  await untilPageRequestsAnswered(page);
  const initialReads = [...ciReads];
  expect(
    initialReads.filter((read) => read.startsWith("ci-comparison ")),
  ).toHaveLength(1);
  expect(
    initialReads.filter((read) => read.startsWith("ci-proof ")),
  ).toHaveLength(3);

  await chooseStoryTab(intent, "Changed tests");
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  await expect(
    compared(summary).getByRole("heading", {
      name: "Baseline compared with Landed",
      exact: true,
    }),
  ).toBeVisible();
  await expect(summary.locator(".intent-ci-comparison-framing")).toHaveText(
    "Observed builds; differences are not attributed to the story",
  );
  await expect(showPercent(summary)).not.toBeChecked();
  await expect(ownBranch(summary, "dashboard/tests")).toHaveText("+9.5 s");
  await expectMark(ownBranch(summary, "dashboard/tests"), "slower", 1);
  // Entry scale includes its own +9470/12040 and immediate child +7070/10340.
  await expectMark(
    childBranch(summary, "dashboard/tests", "folder/"),
    "slower",
    7070 / 10340 / (9470 / 12040),
  );
  await showPercent(summary).focus();
  await page.keyboard.press("Space");
  await expect(showPercent(summary)).toBeChecked();
  await expect(ownBranch(summary, "dashboard/tests")).toHaveText("+9.5 s+79%");

  await childName(summary, "folder/").click();
  await expectMark(
    ownBranch(summary, "dashboard/tests/folder"),
    "slower",
    7070 / 10340 / 0.7,
  );
  await expectMark(
    childBranch(summary, "dashboard/tests/folder", "a.spec.ts"),
    "slower",
    1,
  );
  await expect(showPercent(summary)).toBeChecked();
  await childName(summary, "nested/").click();
  await expect(ownBranch(summary, "dashboard/tests/folder/nested")).toHaveText(
    "+70 ms+21%",
  );
  await expectMark(
    ownBranch(summary, "dashboard/tests/folder/nested"),
    "slower",
    70 / 340 / 0.5,
  );
  await expectMark(
    childBranch(summary, "dashboard/tests/folder/nested", "c.spec.ts"),
    "slower",
    70 / 340 / 0.5,
  );
  expect(textReads).toEqual([]); // Summaries do not ask for source text.

  await childName(summary, "c.spec.ts").click();
  await fileReadingTab(intent, "Proof").click();
  const proof = proofRegion(intent);
  const row = proof.getByRole("table").locator("tbody tr");
  const branch = row.getByRole("cell").nth(2);
  await expect(
    compared(proof).getByRole("heading", {
      name: "Baseline compared with Landed",
      exact: true,
    }),
  ).toBeVisible();
  await expect(branch).toHaveText("+70 ms+21%");
  const before = await expectMark(branch, "slower", 70 / 340 / 0.5);
  await showPercent(proof).uncheck();
  await expect(branch).toHaveText("+70 ms");
  expect(await markGeometry(branch)).toEqual(before);
  await proof
    .getByRole("button", { name: "View story CI comparison", exact: true })
    .click();
  await expect(showPercent(story)).not.toBeChecked(); // The hidden home panel was still mounted.
  await showPercent(story).check();
  await chooseStoryTab(intent, "Changed tests");
  await expect(showPercent(proof)).toBeChecked();
  await expect(branch).toHaveText("+70 ms+21%");

  await untilPageRequestsAnswered(page);
  expect(ciReads).toEqual(initialReads);
});

test("added, unchanged and removed historical files keep honest timing marks, and Show % preserves the Summary sort without rereading CI", async ({
  page,
  origin,
}) => {
  await publishSummaryComparisonStory(page, origin, "own-conflict-extra");
  const ciReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const kind = url.searchParams.get("intent");
    if (kind === "ci-comparison" || kind === "ci-proof")
      ciReads.push(`${kind} ${url.search}`);
  });
  const { intent } = await selectDoneStoryForSummaryComparison(page);
  await untilPageRequestsAnswered(page);
  const initialReads = [...ciReads];
  await intentFile(intent, summaryComparisonChanges.added).click();
  await fileReadingTab(intent, "Proof").click();
  const proof = proofRegion(intent);
  await showPercent(proof).check();
  await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
    "800 ms",
  );
  await expect(
    proof.locator(".intent-ci-time-mark, .intent-ci-time-percent"),
  ).toHaveCount(0);
  await intentFile(intent, "dashboard/tests/root.spec.ts").click();
  await expect(proof.getByRole("table").getByRole("cell").nth(2)).toHaveText(
    "0 ms0%",
  );
  await expectMark(
    proof.getByRole("table").getByRole("cell").nth(2),
    "none",
    0,
  );

  const entry = await openSummaryComparison(intent, "dashboard/tests");
  const table = scopeTable(entry, "dashboard/tests");
  await sortButton(table, "Landed").click();
  const order = await rowNames(table).allTextContents();
  await showPercent(entry).uncheck();
  await expect(rowNames(table)).toHaveText(order);
  const gap = table.locator("tbody tr").filter({
    has: page.getByRole("rowheader", { name: "gone.spec.ts", exact: true }),
  });
  await expect(gap).toContainText("removed");
  await expect(
    table.getByRole("rowheader", { name: "later.spec.ts", exact: true }),
  ).toHaveCount(0);
  await expect(
    gap.locator(".intent-ci-time-mark, .intent-ci-time-percent"),
  ).toHaveCount(0);
  await untilPageRequestsAnswered(page);
  expect(ciReads).toEqual(initialReads);
});
