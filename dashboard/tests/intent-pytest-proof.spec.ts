// Intent's Proof pane reads committed pytest proof for a file of a Pygardon-
// like `python` location that declares `proof` and `proofGeneration`
// (../src/IntentProof.tsx, ../src/pytestCases.ts, ../src/pytestProof.ts,
// ../server/intentProofRead.ts): rows are the published file's test
// functions and `Test*` class methods in definition order, a parametrized
// function expands to its observed ids only, a function without an
// observation reads No successful proof, a renamed function's stale
// observation and text that only looks like a test are not listed, and the
// count line counts test cases. The generation instruction shows as text.
// A snapshot of about 2 MB, a whole Pygardon suite's, is read like any other.
// Long test names wrap within their column while headers and observed cells
// keep whole words; on a phone only the table scrolls sideways.
// Summaries: ./intent-pytest-proof-summary.spec.ts. Explanations:
// ./intent-pytest-proof-absent.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  chooseReadingTab,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { publishIntentProject, pygardon } from "./intentCodeBrowseFixtures.ts";
import { gitBlobSha } from "./listingAnswers.ts";
import { expectNoSidewaysScrollAndWholeText } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { wordsBrokenApart } from "./wholeWords.ts";
import {
  earlierCommit,
  generationCommand,
  proofFile,
  largeSnapshotFiles,
  recordedCommit,
  settings,
  snapshotFiles,
  snapshotPath,
} from "./intentPytestProofFixtures.ts";
import {
  corsPath,
  healthPath,
  sources,
  testsPath,
} from "./intentPytestSourceFixtures.ts";

const now = new Date("2026-11-04T12:00:00.000Z");

const recorded = recordedCommit.slice(0, 7);
const passedNow = (duration: string) => [
  "Passed",
  duration,
  "3h ago",
  recorded,
  "This file version",
];

// Publishes Pygardon with `proofFiles` and opens `path`'s Proof once its
// source shows `sourceLine`.
async function openProof(
  page: Parameters<typeof parts>[0],
  proofFiles: Record<string, string>,
  path: string,
  sourceLine: string,
  viewport = { width: 1280, height: 900 },
) {
  await page.setViewportSize(viewport);
  await page.clock.setFixedTime(now);
  await publishIntentProject(page, pygardon, settings, {
    ...sources,
    ...proofFiles,
  });

  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, testsPath);
  await intent.getByRole("button", { name: path, exact: true }).click();
  await expect(intent.getByLabel(`${path} source`)).toContainText(sourceLine);
  return chooseReadingTab(intent, "Proof");
}

test("a pytest file's Proof lists its test cases in definition order with observed parameter rows", async ({
  page,
}) => {
  const proof = await openProof(
    page,
    snapshotFiles,
    corsPath,
    "def test_rounding(direction):",
  );
  const table = proof.getByRole("table", { name: `${corsPath} proof` });
  await expect(table).toBeVisible();
  await expect(proof).toContainText(
    "Last successful proof: 6 test cases: 5 passed, 1 without successful proof",
  );
  const cells = await table
    .getByRole("row")
    .evaluateAll((rows) =>
      rows.map((row) =>
        [...row.querySelectorAll("th, td")].map((cell) =>
          cell.textContent.trim(),
        ),
      ),
    );
  expect(cells).toEqual([
    [
      "Test case",
      "Last successful proof",
      "Duration",
      "Observed",
      "Commit",
      "Observed on",
    ],
    ["test_allows_listed_origin", ...passedNow("120 ms")],
    // Only the ids observed passing are rows, in parameter id order whatever
    // the snapshot's order: `[down]` failed last.
    ["test_rounding Parameters: even", ...passedNow("80 ms")],
    ["test_rounding Parameters: up", ...passedNow("2.4 s")],
    ["test_preflight", ...passedNow("45 ms")],
    ["test_rejects_unknown_origin", "No successful proof", "", "", "", ""],
    [
      "TestCredentials::test_sends_credentials",
      "Passed",
      "300 ms",
      "1d ago",
      earlierCommit.slice(0, 7),
      "Earlier file version",
    ],
  ]);
  await expect(table).not.toContainText(
    /down|test_old_origin_name|test_inside_docstring|test_nested_helper|test_not_collected/,
  );
  await expect(proof).not.toContainText(/scenario|green|all passed|suite/i);

  await test.step("the generation instruction shows as text beside the proof", async () => {
    await expect(proof).toContainText(
      `Generate or refresh proof from the repository root: ${generationCommand}`,
    );
    await expect(proof.getByRole("button", { name: /generate/i })).toHaveCount(
      0,
    );
  });
});

test("a pytest snapshot of about 2 MB is read and its file's Proof shows its rows", async ({
  page,
}) => {
  const proof = await openProof(
    page,
    largeSnapshotFiles,
    healthPath,
    "def test_health(client):",
  );
  const table = proof.getByRole("table", { name: `${healthPath} proof` });
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody tr th")).toHaveText("test_health");
  await expect(table.locator("tbody tr td")).toHaveText(passedNow("30 ms"));
  await expect(proof).toContainText(
    "Last successful proof: 1 test case: 1 passed",
  );
  await expect(proof.getByRole("alert")).toHaveCount(0);
});

// Column headers and observed cells, whose words must read whole.
const headersAndObservedCells = "thead th, tbody td";

// A Pygardon test name with long parameter ids, as its search_run suite has.
const longNameSource = `import pytest


@pytest.mark.parametrize(
    "span",
    ["cell-expected0", "cell,2008-2010-expected1"],
)
def test_search_run_cli_maps_declared_ranking_span(span):
    assert span


def test_search_run_cli_unknown_ranking_span_fails_closed():
    assert True
`;
const longNameFiles = {
  [healthPath]: longNameSource,
  [snapshotPath]: proofFile(
    [
      ["test_search_run_cli_maps_declared_ranking_span", "cell-expected0"],
      [
        "test_search_run_cli_maps_declared_ranking_span",
        "cell,2008-2010-expected1",
      ],
      ["test_search_run_cli_unknown_ranking_span_fails_closed", undefined],
    ].map(([test, parameterId]) => ({
      file: healthPath,
      test,
      ...(parameterId === undefined ? {} : { parameterId }),
      durationMs: 424,
      fileBlob: gitBlobSha(longNameSource),
      outcome: "passed",
      attempts: 1,
      finishedAt: "2026-11-04T09:00:00.000Z",
      commit: recordedCommit,
    })),
  ),
};

test("long test case names wrap in their own column; headers and observed cells keep whole words, and on a phone only the table scrolls sideways", async ({
  page,
}) => {
  const proof = await openProof(
    page,
    longNameFiles,
    healthPath,
    "def test_search_run_cli_maps_declared_ranking_span(span):",
    { width: 1400, height: 900 },
  );
  const table = proof.getByRole("table", { name: `${healthPath} proof` });
  await expect(table.locator("tbody tr")).toHaveCount(3);
  await expect(table.locator("tbody tr td code").first()).toHaveText(recorded);
  expect(await wordsBrokenApart(table, headersAndObservedCells)).toEqual([]);

  await test.step("at a phone width the table scrolls sideways in its own box with words whole; the page and reading pane do not", async () => {
    await page.setViewportSize(phoneLaunchTouchViewport.portrait);
    await expect(table).toBeVisible();
    expect(await wordsBrokenApart(table, headersAndObservedCells)).toEqual([]);
    await expectNoSidewaysScrollAndWholeText(page, [".intent-proof-table"]);
  });
});
