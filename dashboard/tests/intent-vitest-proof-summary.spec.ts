// A Vitest location or folder summary gives the Gherkin summary's figures in
// Vitest words (../src/IntentProofSummary.tsx, ../src/proofKinds.ts): an
// inventory of tests from the read files, the proof count line and summed
// duration over test cases with the separate-observations note, slowest test
// cases named with their project, and each child's figures; Partial while a
// file is unread, with a retry that rereads it; a child name opens that
// file's Purpose and Proof, and a slowest row opens Purpose on its `it` line.

import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { authenticatedReadRoute } from "./holdAuthenticatedReads.ts";
import {
  chooseReadingTab,
  intentLocationName,
} from "./intentPerspectivePage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { doughnut, publishIntentProject } from "./intentCodeBrowseFixtures.ts";
import {
  childName,
  expectChildren,
  sumLine,
} from "./intentSummaryProofCostPage.ts";
import {
  generationCommand,
  settings,
  snapshotFiles,
} from "./intentVitestProofFixtures.ts";
import {
  datesPath,
  locationPath,
  sources,
  templateLine,
  titlePatternPath,
  utilsPath,
} from "./intentVitestSourceFixtures.ts";

const costNote =
  "A sum of separate test case observations, retries included, not a run's elapsed time.";

async function openLocation(page: Parameters<typeof parts>[0]) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await pausePageClockAt(page, new Date("2026-11-04T12:00:00.000Z"));
  await publishIntentProject(page, doughnut, settings, {
    ...sources,
    ...snapshotFiles,
  });
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await intentLocationName(intent, locationPath).click();
  const summary = intent.getByRole("region", { name: "Summary" });
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    locationPath,
  );
  return { intent, summary };
}

test("a Vitest location summary counts tests and test cases, sums proof, and lists its slowest test cases and children", async ({
  page,
}) => {
  const { summary } = await openLocation(page);
  await expect(summary.getByText("11 tests", { exact: true })).toBeVisible();
  await expect(summary).toContainText(
    "Last successful proof: 16 test cases: 14 passed, 1 passed after retry, 1 without successful proof",
  );
  await expect(
    summary.getByText(`${sumLine}: 3.7 s over 15 of 16 test cases`, {
      exact: true,
    }),
  ).toBeVisible();
  await expect(summary).toContainText(costNote);
  await expect(summary).toContainText(
    `Generate or refresh proof from the repository root: ${generationCommand}`,
  );
  await expect(summary).not.toContainText(/scenario|ISO dates/i);

  const slowest = summary.getByRole("table", { name: "Slowest test cases" });
  await expect(slowest.locator("thead th")).toHaveText([
    "Test case",
    "File",
    "Last successful proof",
    "Duration",
    "Observed",
    "Commit",
    "Observed on",
  ]);
  const rows = slowest.locator("tbody tr");
  await expect(rows.nth(0).locator("th")).toHaveText(
    "renderTitleFromPattern > renders émile titles Project: chromium",
  );
  await expect(rows.nth(0).locator("td").first()).toHaveText(
    "utils/titlePatternRender.spec.ts",
  );
  await expect(rows.nth(1).locator("th")).toHaveText(
    "renderTitleFromPattern > renders equivalent escapes Project: chromium",
  );
  await expect(rows.nth(2).locator("th")).toHaveText(
    "Toolbar > opens the menu Project: chromium-touch",
  );

  await expectChildren(summary, [
    ["toolbars", "6 test cases: 6 passed"],
    [
      "utils",
      "10 test cases: 8 passed, 1 passed after retry, 1 without successful proof",
    ],
  ]);
  await expectChildren(summary, [
    ["toolbars", `${sumLine}: 645 ms over 6 of 6 test cases`],
    ["utils", `${sumLine}: 3.0 s over 9 of 10 test cases`],
  ]);
});

test("a Vitest folder summary gives its own figures, and its child names and slowest rows drill down", async ({
  page,
}) => {
  const { intent, summary } = await openLocation(page);

  await test.step("the utils folder's figures and children", async () => {
    await childName(summary, "utils").click();
    await expect(summary.locator(".intent-summary-path")).toHaveText(utilsPath);
    await expect(summary.getByText("8 tests", { exact: true })).toBeVisible();
    await expect(summary).toContainText(
      "Last successful proof: 10 test cases: 8 passed, 1 passed after retry, 1 without successful proof",
    );
    await expect(
      summary.getByText(`${sumLine}: 3.0 s over 9 of 10 test cases`, {
        exact: true,
      }),
    ).toBeVisible();
    await expect(summary).toContainText(costNote);
    await expectChildren(summary, [
      ["dates.spec.ts", "3 tests"],
      ["titlePatternRender.spec.ts", "5 tests"],
    ]);
    await expectChildren(summary, [
      ["dates.spec.ts", `${sumLine}: 60 ms over 3 of 3 test cases`],
      [
        "titlePatternRender.spec.ts",
        `${sumLine}: 3.0 s over 6 of 7 test cases`,
      ],
    ]);
  });

  await test.step("a child name opens that file's Purpose and Proof", async () => {
    await childName(summary, "dates.spec.ts").click();
    await expect(summary).toHaveCount(0);
    await expect(intent.getByLabel(`${datesPath} source`)).toContainText(
      'it("pads years"',
    );
    await chooseReadingTab(intent, "Proof");
    const proof = intent.getByRole("table", { name: `${datesPath} proof` });
    await expect(proof.locator("tbody th")).toHaveText([
      "formatDate > pads months Project: chromium",
      "formatDate > pads days Project: chromium",
      "formatDate > pads years Project: chromium",
    ]);
    await chooseReadingTab(intent, "Purpose");
  });

  await test.step("a slowest row opens its file with Purpose on its it line", async () => {
    await intentLocationName(intent, locationPath).click();
    await summary
      .getByRole("table", { name: "Slowest test cases" })
      .getByRole("button", {
        name: "renderTitleFromPattern > renders émile titles Project: chromium",
      })
      .click();
    const target = intent
      .getByLabel(`${titlePatternPath} source`)
      .locator(".source-line.is-target");
    await expect(target).toHaveAttribute("data-line", String(templateLine));
    await expect(target).toContainText('("renders %s titles"');
    await expect(target).toBeInViewport();
  });
});

test("a Vitest summary is Partial while a file is unread, and Retry rereads only it", async ({
  page,
}) => {
  const reads: string[] = [];
  let failDates = true;
  await page.route(authenticatedReadRoute, async (route) => {
    const path = new URL(route.request().url()).searchParams.get("path");
    if (path !== null && path.endsWith(".spec.ts")) reads.push(path);
    if (path === datesPath && failDates) {
      failDates = false;
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "dates unavailable" }),
      });
      return;
    }
    await route.continue();
  });
  const { summary } = await openLocation(page);
  await expect(summary).toContainText(
    "Partial: 8 tests across 3 of 4 files; 1 file unread",
  );
  await expect(summary).toContainText(
    "Partial: Last successful proof: 13 test cases: 11 passed, 1 passed after retry, 1 without successful proof across 3 of 4 files; 1 file unread",
  );
  const alert = summary.getByRole("alert");
  await expect(alert).toContainText(`${datesPath} could not be read.`);
  const before = reads.length;
  await alert.getByRole("button", { name: "Retry" }).click();
  await expect(summary.getByText("11 tests", { exact: true })).toBeVisible();
  await expect(summary).not.toContainText("Partial:");
  expect(reads.slice(before)).toEqual([datesPath]);
  await page.unroute(authenticatedReadRoute);
});
