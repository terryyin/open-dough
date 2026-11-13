// Project Intent reads test execution time as a Done story does
// (../tests/intent/intent-scope-glance.spec.ts): the entry and folder
// Summaries read history before the child table, and file Proof's Test cases /
// Test file choice changes the observed trunk endpoint's value, average and
// chart scale together, in light and dark appearance. Real collection is
// ../tests/intent/intent-scope-collected-file-timing-history.spec.ts's; these
// routes answer each scope's local history read.
import { shortSha } from "../src/baseCiWording.ts";
import { parts } from "../tests/dashboardPage.ts";
import { fileReadingTab, proofRegion } from "../tests/intentPerspectivePage.ts";
import {
  chooseTimingUnit,
  expectScopeReadout,
  scopeHistory,
  scopeHistoryChart,
  scopeHistoryReading,
} from "../tests/intentScopeHistoryPage.ts";
import { childName, scopeTable } from "../tests/intentScopeProofPage.ts";
import { openSummary } from "../tests/intentSummaryCiProofFixtures.ts";
import { openUntilRead } from "../tests/pageRequestNotes.ts";
import { expectStackedInOrder } from "../tests/partArrangement.ts";
import { expectChangeCue } from "../tests/priorBuildReferencePage.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import { expect, test } from "../tests/support/frontendApp.ts";
import {
  scopeUnitsHistory,
  serveUnreadProjectCi,
} from "../tests/support/projectScopeHistoryFacts.ts";

test("Project Intent reads each scope's test execution time history before its table and switches a file's timing unit", async ({
  page,
  frontendServices,
}) => {
  const revision = frontendServices.revision;
  Object.assign(frontendServices, {
    locations: {
      ...frontendServices.locations,
      locations: [
        makeMe.anIntentLocation
          .at("dashboard/tests")
          .ofKind("typescript", ["**/*.spec.ts"])
          .selecting(
            "dashboard/tests/folder/a.spec.ts",
            "dashboard/tests/root.spec.ts",
          )
          .please(),
      ],
    },
  });
  await serveUnreadProjectCi(page, "a".repeat(40));
  const scopes: string[] = [];
  await page.route(/intent=ci-history.*scope=/, async (route) => {
    const path = new URL(route.request().url()).searchParams.get("scope") ?? "";
    scopes.push(path);
    await route.fulfill({ json: scopeUnitsHistory(revision, path) });
  });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const endpoint = `Observed trunk endpoint ${shortSha(revision)}`;
  const average = "Prior-build average · 103 ms · 5 prior builds used";
  const cases = {
    selected: `${endpoint} · 120 ms`,
    average,
    change: "vs. prior average · +17 ms (+17%)",
  };

  const summary = await openSummary(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  await expectScopeReadout(history, cases);
  await expect(scopeHistoryReading(history).unit("Test files")).toBeVisible();
  await expectStackedInOrder([history, scopeTable(summary, "dashboard/tests")]);
  await childName(summary, "folder/").first().click();
  await expect(summary.locator(".intent-summary-path")).toHaveText(
    "dashboard/tests/folder",
  );
  await expectScopeReadout(history, cases);
  await expectStackedInOrder([
    history,
    scopeTable(summary, "dashboard/tests/folder"),
  ]);

  await childName(summary, "a.spec.ts").first().click();
  await fileReadingTab(intent, "Proof").click();
  const file = proofRegion(intent);
  const fileHistory = scopeHistory(file);
  await expectScopeReadout(fileHistory, cases);
  await expectStackedInOrder([
    fileHistory,
    file.getByText("Live proof unavailable"),
  ]);
  const caseChart = scopeHistoryChart(
    fileHistory,
    "test cases",
    "observed trunk endpoint",
  );
  await expect(caseChart.readout).toHaveText("Nov 6 · Endpoint · 120 ms");
  // Each unit's own scale around its own timings.
  await expect(caseChart.axisLabels).toHaveText([
    "90 ms",
    "100 ms",
    "110 ms",
    "120 ms",
    "130 ms",
  ]);
  await chooseTimingUnit(fileHistory, "Test file", "keyboard");
  await expectScopeReadout(fileHistory, {
    selected: `${endpoint} · 12 ms`,
    average: "Prior-build average · 10 ms · 5 prior builds used",
    change: "vs. prior average · +2 ms (+17%)",
  });
  const fileChart = scopeHistoryChart(
    fileHistory,
    "test files",
    "observed trunk endpoint",
  );
  await expect(fileChart.readout).toHaveText("Nov 6 · Endpoint · 12 ms");
  await expect(caseChart.drawing).toHaveCount(0);
  await expect(fileChart.axisLabels).toHaveText([
    "5 ms",
    "10 ms",
    "15 ms",
    "20 ms",
  ]);

  await page.emulateMedia({ colorScheme: "dark" });
  await expectChangeCue(page, fileHistory, "slower");
  expect(scopes).toEqual([
    "dashboard/tests",
    "dashboard/tests/folder",
    "dashboard/tests/folder/a.spec.ts",
  ]);
});
