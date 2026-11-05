// Intent's Proof pane reads committed Vitest proof for a file of a Doughnut-
// like `typescript` location that declares `runner: "vitest"`, `proof` and
// `proofGeneration` (../src/IntentProof.tsx, ../src/vitestCases.ts,
// ../src/vitestProof.ts, ../server/intentProofRead.ts): rows are the
// published file's tests in definition order named by their `describe`
// path, a `%s` template expands to its observed names in code-point order
// whatever the snapshot's order, a placeholder-less table is one case, a
// test observed under two projects shows one row per project with
// `chromium` first, a test without an observation reads No successful
// proof, and a renamed test's stale observation is not listed. The count
// line counts test cases. Summaries: ./intent-vitest-proof-summary.spec.ts.
// Explanations: ./intent-vitest-proof-absent.spec.ts.

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import {
  expandIntentFolders,
  expandIntentGroup,
} from "./intentPerspectivePage.ts";
import { chooseReadingTab } from "./intentFileReadingPage.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import {
  earlierCommit,
  generationCommand,
  recordedCommit,
  settings,
  snapshotFiles,
} from "./intentVitestProofFixtures.ts";
import {
  locationPath,
  sources,
  titlePatternPath,
  toolbarPath,
  touchPath,
} from "./intentVitestSourceFixtures.ts";

const now = new Date("2026-11-04T12:00:00.000Z");

const recorded = recordedCommit.slice(0, 7);
const passedNow = (duration: string) => [
  "Passed",
  duration,
  "3h ago",
  recorded,
  "This file version",
];
const noProof = ["No successful proof", "", "", "", ""];

// Publishes Doughnut with `proofFiles` and opens `path`'s Proof once its
// source shows `sourceLine`.
async function openProof(
  page: Parameters<typeof parts>[0],
  proofFiles: Record<string, string>,
  path: string,
  sourceLine: string,
) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.clock.setFixedTime(now);
  await publishIntentProject(page, doughnut, settings, {
    ...sources,
    ...proofFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await expandIntentGroup(intent, locationPath);
  await expandIntentFolders(intent, locationPath);
  await intent.getByRole("button", { name: path, exact: true }).click();
  await expect(intent.getByLabel(`${path} source`)).toContainText(sourceLine);
  return { intent, proof: await chooseReadingTab(intent, "Proof") };
}

async function cellsOf(proof: Locator, path: string) {
  const table = proof.getByRole("table", { name: `${path} proof` });
  await expect(table).toBeVisible();
  return table
    .getByRole("row")
    .evaluateAll((rows) =>
      rows.map((row) =>
        [...row.querySelectorAll("th, td")].map((cell) =>
          cell.textContent.trim(),
        ),
      ),
    );
}

const headers = [
  "Test case",
  "Last successful proof",
  "Duration",
  "Observed",
  "Commit",
  "Observed on",
];

test("a Vitest file's Proof lists its tests by describe path in definition order, with template rows in code-point order", async ({
  page,
}) => {
  const { proof } = await openProof(
    page,
    snapshotFiles,
    titlePatternPath,
    'it.each(["alpha", "Beta", "émile"])("renders %s titles"',
  );
  await expect(proof).toContainText(
    "Last successful proof: 7 test cases: 5 passed, 1 passed after retry, 1 without successful proof",
  );
  expect(await cellsOf(proof, titlePatternPath)).toEqual([
    headers,
    [
      "renderTitleFromPattern > replaces {{date}} with yyyy-MM-dd Project: chromium",
      ...passedNow("120 ms"),
    ],
    [
      "renderTitleFromPattern > unknown placeholders > leaves them unchanged Project: chromium",
      ...passedNow("30 ms"),
    ],
    // Code-point order of the observed names, whatever the snapshot's
    // order (it holds émile, alpha, Beta).
    [
      "renderTitleFromPattern > renders Beta titles Project: chromium",
      ...passedNow("45 ms"),
    ],
    [
      "renderTitleFromPattern > renders alpha titles Project: chromium",
      ...passedNow("80 ms"),
    ],
    [
      "renderTitleFromPattern > renders émile titles Project: chromium",
      ...passedNow("2.4 s"),
    ],
    // A table without placeholders is one case.
    [
      "renderTitleFromPattern > renders equivalent escapes Project: chromium",
      "Passed after retry (2 attempts)",
      "300 ms",
      "3h ago",
      recorded,
      "This file version",
    ],
    ["renderTitleFromPattern > formats an empty pattern", ...noProof],
  ]);
  await expect(proof).not.toContainText(
    /ISO dates|inside a comment|scenario|green|all passed|suite/i,
  );

  await test.step("the generation instruction shows as text beside the proof", async () => {
    await expect(proof).toContainText(
      `Generate or refresh proof from the repository root: ${generationCommand}`,
    );
  });
});

test("project rows: a touch spec names chromium-touch, and a test observed under both projects shows chromium first, each with its own proof", async ({
  page,
}) => {
  const { intent, proof } = await openProof(
    page,
    snapshotFiles,
    touchPath,
    '"prepares input synchronously from %s"',
  );
  expect(await cellsOf(proof, touchPath)).toEqual([
    headers,
    [
      "Donut menu touch search > prepares input synchronously from Open search Project: chromium-touch",
      ...passedNow("50 ms"),
    ],
    [
      "Donut menu touch search > prepares input synchronously from Search Project: chromium-touch",
      ...passedNow("15 ms"),
    ],
  ]);
  await expect(proof).toContainText(
    "Last successful proof: 2 test cases: 2 passed",
  );

  await test.step("both projects, chromium-touch first in the snapshot", async () => {
    await chooseReadingTab(intent, "Purpose");
    await intent
      .getByRole("button", { name: toolbarPath, exact: true })
      .click();
    await expect(intent.getByLabel(`${toolbarPath} source`)).toContainText(
      'it("opens the menu"',
    );
    const toolbarProof = await chooseReadingTab(intent, "Proof");
    expect(await cellsOf(toolbarProof, toolbarPath)).toEqual([
      headers,
      ["Toolbar > opens the menu Project: chromium", ...passedNow("200 ms")],
      [
        "Toolbar > opens the menu Project: chromium-touch",
        "Passed",
        "250 ms",
        "1d ago",
        earlierCommit.slice(0, 7),
        "This file version",
      ],
      ["Toolbar > closes on escape Project: chromium", ...passedNow("60 ms")],
      [
        "Toolbar > closes on escape Project: chromium-touch",
        ...passedNow("70 ms"),
      ],
    ]);
    await expect(toolbarProof).toContainText(
      "Last successful proof: 4 test cases: 4 passed",
    );
  });
});
