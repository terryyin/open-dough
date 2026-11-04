// Intent's Proof pane reads committed pytest proof for a file of a Pygardon-
// like `python` location that declares `proof` and `proofGeneration`
// (../src/IntentProof.tsx, ../src/pytestCases.ts, ../src/pytestProof.ts,
// ../server/intentProofRead.ts): rows are the published file's test
// functions and `Test*` class methods in definition order, a parametrized
// function expands to its observed ids only, a function without an
// observation reads No successful proof, a renamed function's stale
// observation and text that only looks like a test are not listed, and the
// count line counts test cases. The generation instruction shows as text.
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
import {
  earlierCommit,
  generationCommand,
  recordedCommit,
  settings,
  snapshotFiles,
} from "./intentPytestProofFixtures.ts";
import { corsPath, sources, testsPath } from "./intentPytestSourceFixtures.ts";

const now = new Date("2026-11-04T12:00:00.000Z");

const recorded = recordedCommit.slice(0, 7);
const passedNow = (duration: string) => [
  "Passed",
  duration,
  "3h ago",
  recorded,
  "This file version",
];

test("a pytest file's Proof lists its test cases in definition order with observed parameter rows", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(now);
  await publishIntentProject(page, pygardon, settings, {
    ...sources,
    ...snapshotFiles,
  });

  await openUntilRead(page, "/?project=pygardon");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  await expandIntentGroup(intent, testsPath);
  await intent.getByRole("button", { name: corsPath, exact: true }).click();
  await expect(intent.getByLabel(`${corsPath} source`)).toContainText(
    "def test_rounding(direction):",
  );

  const proof = await chooseReadingTab(intent, "Proof");
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
    // Only the ids observed passing are rows: `[down]` failed last.
    ["test_rounding Parameters: up", ...passedNow("2.4 s")],
    ["test_rounding Parameters: even", ...passedNow("80 ms")],
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
