// A pytest location or folder summary gives the Gherkin summary's figures
// in pytest words (../src/IntentProofSummary.tsx, ../src/proofKinds.ts): an
// inventory of test functions from the read files, the proof count line and
// summed duration over test cases with the separate-observations note,
// slowest test cases, and each child's figures; Partial while a file is
// unread, with a retry that rereads it; a child name opens that file's
// Purpose and Proof, and a slowest row opens Purpose on its definition line.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { authenticatedReadRoute } from "./holdAuthenticatedReads.ts";
import { intentLocationName } from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { publishIntentProject, pygardon } from "./intentCodeBrowseFixtures.ts";
import {
  childName,
  expectChildren,
  sumLine,
} from "./intentSummaryProofCostPage.ts";
import {
  generationCommand,
  settings,
  snapshotFiles,
} from "./intentPytestProofFixtures.ts";
import {
  corsPath,
  healthPath,
  roundingLine,
  searchRunFilePath,
  searchRunPath,
  sources,
  testsPath,
} from "./intentPytestSourceFixtures.ts";

const costNote =
  "A sum of separate test case observations, retries included, not a run's elapsed time.";

async function openTests(page: Parameters<typeof parts>[0]) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClockAt(page, new Date("2026-11-04T12:00:00.000Z"));
  await publishIntentProject(page, pygardon, settings, {
    ...sources,
    ...snapshotFiles,
  });
  await openUntilRead(page, "/?project=pygardon&perspective=intent");
  const { intent } = parts(page);
  await intentLocationName(intent, testsPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary.locator(".intent-summary-path")).toHaveText(testsPath);
  return { intent, summary };
}

test("a pytest location summary counts test functions and test cases, sums proof, and lists its slowest test cases and children", async ({
  page,
}) => {
  const { summary } = await openTests(page);
  await expect(
    summary.getByText("11 test functions", { exact: true }),
  ).toBeVisible();
  await expect(summary).toContainText(
    "Last successful proof: 13 test cases: 10 passed, 3 without successful proof",
  );
  await expect(
    summary.getByText(`${sumLine}: 5.1 s over 10 of 13 test cases`, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(summary).toContainText(costNote);
  await expect(summary).toContainText(
    `Generate or refresh proof from the repository root: ${generationCommand}`,
  );
  await expect(summary).not.toContainText(/scenario/i);

  const slowestTestCases = summary.getByRole("table", {
    name: "Slowest test cases",
  });
  await expect(slowestTestCases.locator("thead th")).toHaveText([
    "Test case",
    "File",
    "Last successful proof",
    "Duration",
    "Observed",
    "Commit",
    "Observed on",
  ]);
  const rows = slowestTestCases.locator("tbody tr");
  await expect(rows).toHaveCount(10);
  await expect(rows.nth(0).locator("th")).toHaveText(
    "test_rounding Parameters: up",
  );
  await expect(rows.nth(0).locator("td").first()).toHaveText("test_cors.py");
  await expect(rows.nth(1).locator("th")).toHaveText("test_runs_search");
  await expect(rows.nth(2).locator("th")).toHaveText(
    "test_runs_twice Parameters: b",
  );
  await expect(slowestTestCases).not.toContainText("test_old_origin_name");

  await expectChildren(summary, [
    ["search_run", "6 test cases: 4 passed, 2 without successful proof"],
    ["test_cors.py", "6 test cases: 5 passed, 1 without successful proof"],
    ["test_health.py", "1 test case: 1 passed"],
  ]);
});

test("a pytest folder summary gives its own figures, and its child names and slowest rows drill down", async ({
  page,
}) => {
  const { intent, summary } = await openTests(page);

  await test.step("the search_run folder's figures and children", async () => {
    await childName(summary, "search_run").click();
    await expect(summary.locator(".intent-summary-path")).toHaveText(
      searchRunPath,
    );
    await expect(
      summary.getByText("5 test functions", { exact: true }),
    ).toBeVisible();
    await expect(summary).toContainText(
      "Last successful proof: 6 test cases: 4 passed, 2 without successful proof",
    );
    await expect(
      summary.getByText(`${sumLine}: 2.1 s over 4 of 6 test cases`, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(summary).toContainText(costNote);
    await expectChildren(summary, [
      ["test_search_filters.py", "2 test functions"],
      ["test_search_run.py", "3 test functions"],
    ]);
    await expectChildren(summary, [
      ["test_search_filters.py", `${sumLine}: 100 ms over 1 of 2 test cases`],
      ["test_search_run.py", `${sumLine}: 2.0 s over 3 of 4 test cases`],
    ]);
  });

  await test.step("a child name opens that file's Purpose and Proof", async () => {
    await childName(summary, "test_search_run.py").click();
    await expect(summary).toHaveCount(0);
    await expect(
      intent.getByLabel(`${searchRunFilePath} source`),
    ).toContainText("def test_runs_twice(index, query):");
    await chooseReadingTab(intent, "Proof");
    const proof = intent.getByRole("table", {
      name: `${searchRunFilePath} proof`,
    });
    await expect(proof.locator("tbody th")).toHaveText([
      "test_runs_search",
      "test_runs_twice Parameters: a",
      "test_runs_twice Parameters: b",
      "test_cancels",
    ]);
    await chooseReadingTab(intent, "Purpose");
  });

  await test.step("a slowest row opens its file with Purpose on its definition line", async () => {
    await intentLocationName(intent, testsPath).click();
    await summary
      .getByRole("table", { name: "Slowest test cases" })
      .getByRole("button", { name: "test_rounding Parameters: up" })
      .click();
    const target = intent
      .getByLabel(`${corsPath} source`)
      .locator(".source-line.is-target");
    await expect(target).toHaveAttribute("data-line", String(roundingLine));
    await expect(target).toContainText("def test_rounding(direction):");
    await expect(target).toBeInViewport();
  });
});

test("a pytest summary is Partial while a file is unread, and Retry rereads only it", async ({
  page,
}) => {
  const reads: string[] = [];
  let failHealth = true;
  await page.route(authenticatedReadRoute, async (route) => {
    const path = new URL(route.request().url()).searchParams.get("path");
    if (path !== null && path.endsWith(".py")) reads.push(path);
    if (path === healthPath && failHealth) {
      failHealth = false;
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "health unavailable" }),
      });
      return;
    }
    await route.continue();
  });
  const { summary } = await openTests(page);
  await expect(summary).toContainText(
    "Partial: 10 test functions across 3 of 4 files; 1 file unread",
  );
  await expect(summary).toContainText(
    "Partial: Last successful proof: 12 test cases: 9 passed, 3 without successful proof across 3 of 4 files; 1 file unread",
  );
  const alert = summary.getByRole("alert");
  await expect(alert).toContainText(`${healthPath} could not be read.`);
  const before = reads.length;
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect(
    summary.getByText("11 test functions", { exact: true }),
  ).toBeVisible();
  await expect(summary).not.toContainText("Partial:");
  expect(reads.slice(before)).toEqual([healthPath]);
  await page.unroute(authenticatedReadRoute);
});
