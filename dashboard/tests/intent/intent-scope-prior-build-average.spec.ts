// Actual selected artifact collection, raw retained priors and the normal
// authenticated read own the entry → folder → file comparison promise.
import { readFileSync, writeFileSync } from "node:fs";
import type { Locator } from "@playwright/test";
import { expect, test } from "../support/preparationPage.ts";
import { publishSummaryComparisonStory } from "../support/intentSummaryStoryComparisonFixture.ts";
import { scopePriorReferenceHistory } from "../support/scopePriorReferenceHistory.ts";
import {
  keepLandedCiHistory,
  recheckingLandedCi,
  restartAsLandedCiReader,
} from "../support/landedCiHistory.ts";
import {
  historyFile,
  collectedScopeHistory,
} from "../support/collectedScopeHistory.ts";
import {
  recordScopeHistoryLandings,
  retainedProofs,
  serveCollectedScopeFileRuns,
} from "../support/scopeHistoryCollection.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { childName } from "../intentScopeProofPage.ts";
import {
  fileReadingTab,
  proofRegion,
  purposeRegion,
  intentLocationName,
} from "../intentPerspectivePage.ts";
import { intentFile, storyTitle } from "../support/intentStoryPage.ts";
import { expectScopePriorReference } from "../support/scopePriorReferencePage.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";

test.use({ extraEnv: recheckingLandedCi });
const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("each Done scope compares its own collected time through restart, accessible drill and independent history retry", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  await keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, [100, 100, 100, 100, 115, 116]),
  );
  serveCollectedScopeFileRuns(setup, [
    [
      setup.baseline,
      101,
      "2026-11-05T12:00:00Z",
      [["folder/a.spec.ts", 100, 10]],
    ],
    [
      setup.branchSide,
      102,
      "2026-11-06T09:00:00Z",
      [["folder/a.spec.ts", 110, 11]],
    ],
    [
      setup.completion,
      103,
      "2026-11-07T10:00:00Z",
      [
        ["folder/a.spec.ts", 120, 12],
        ["folder/nested/c.spec.ts", 240, 24],
        ["folder/ghost.spec.ts", 360, 36],
        ["root.spec.ts", 720, 72],
      ],
    ],
  ]);
  recordScopeHistoryLandings(dashboard, origin, setup.identity, [
    {
      revision: setup.completion,
      at: "2026-11-07T10:10:00Z",
      workflow: "execution",
      receipt: "10000000-0000-4000-8000-000000000002",
      title: "Story A execution",
    },
  ]);
  await expect
    .poll(() => retainedProofs(dashboard.home)["run/103/1"])
    .toMatchObject({
      kind: "summary",
      summary: {
        entries: [
          {
            evidence: [
              { unit: "case", durationMs: 1440 },
              { unit: "file", durationMs: 144 },
            ],
          },
        ],
      },
    });
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  readers.push(reader);
  const api = await collectedScopeHistory(
    reader.origin,
    "dashboard/tests/folder",
    setup.completion,
    "2026-11-07T10:10:00Z",
  );
  expect(api.status).toBe(200);
  expect(api.body.selectedRevision).toBe(setup.completion);
  expect(
    api.body.references?.find(({ unit }) => unit === "case")?.reference,
  ).toMatchObject({
    endpoint: setup.completion,
    averageMs: 309,
    sampleCount: 5,
    selected: { ms: 720 },
    difference: { changeMs: 411 },
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await openCollectedHistoryStory(page, reader.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const check = (
    scope: Locator,
    average: string,
    selected: string,
    difference: string,
  ) =>
    expectScopePriorReference(
      page,
      scope,
      { average, selected, difference },
      () => {
        expect(ciCalls()).toHaveLength(before);
      },
    );
  await check(summary, "618 ms", "1.4 s", "+822 ms (+133%)");
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
  await check(summary, "309 ms", "720 ms", "+411 ms (+133%)");
  await expect(
    intentFile(intent, "dashboard/tests/folder/ghost.spec.ts"),
  ).toHaveCount(0);
  await childName(summary, "a.spec.ts").first().click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  const file = proofRegion(intent);
  await check(file, "103 ms", "120 ms", "+17 ms (+17%)");
  await expect(
    file.getByRole("region", { name: "Test files", exact: true }),
  ).toContainText("Prior-build average · 10 ms");
  await expect(
    file.getByRole("table", {
      name: "CI proof of dashboard/tests/folder/a.spec.ts",
      exact: true,
    }),
  ).toBeVisible();
  await fileReadingTab(intent, "Purpose").click();
  await expect(purposeRegion(intent)).toBeVisible();
  await fileReadingTab(intent, "Proof").click();
  await check(file, "103 ms", "120 ms", "+17 ms (+17%)");
  await expect(storyTitle(intent)).toHaveText("Story A");
  await expect(
    file.getByRole("table", {
      name: "CI proof of dashboard/tests/folder/a.spec.ts",
      exact: true,
    }),
  ).toContainText("Baseline");

  // Fail only the local history read and preserve the selected story/Proof.
  const filePath = historyFile(dashboard.home);
  const retained = readFileSync(filePath, "utf8");
  try {
    writeFileSync(filePath, "{broken local history");
    await intentLocationName(intent, "dashboard/tests").click();
    const history = summary.getByRole("region", {
      name: "Test execution time history",
      exact: true,
    });
    await expect(history.getByRole("alert")).toContainText(
      "collected CI history could not be read",
    );
    await expect(storyTitle(intent)).toHaveText("Story A");
    await expect(summary.getByRole("table")).toBeVisible();
    writeFileSync(filePath, retained);
    await history.getByRole("button", { name: "Retry history" }).click();
    await expect(history.getByRole("alert")).toHaveCount(0);
    await check(summary, "618 ms", "1.4 s", "+822 ms (+133%)");
  } finally {
    writeFileSync(filePath, retained);
  }
  expect(ciCalls()).toHaveLength(before);
});
