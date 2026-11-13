// Normal local readers of canonical raw proof expose the selection signature
// separately from measured completeness; never supply a finished average.
// Retained history feeds the real authenticated read of the Done story the
// worker keeps (../support/projectScopeHistoryFixture.ts).
import { shortSha } from "../../src/baseCiWording.ts";
import {
  fileReadingTab,
  intentLocationName,
  proofRegion,
} from "../intentPerspectivePage.ts";
import {
  chooseTimingUnit,
  expectScopeReadout,
  scopeHistory,
  scopeHistoryChart,
} from "../intentScopeHistoryPage.ts";
import { childName } from "../intentScopeProofPage.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { summaryComparisonChanges } from "../support/intentSummaryStoryComparisonFixture.ts";
import { declaredSummaryComparisonEndpointsIn } from "../support/intentSummaryStoryComparisonRepository.ts";
import { serveSummaryComparisonStory } from "../support/intentSummaryStoryComparisonServing.ts";
import { intentFile, storyTitle } from "../support/intentStoryPage.ts";
import { keepLandedCiHistory } from "../support/landedCiHistory.ts";
import { expect } from "../support/preparationPage.ts";
import { test } from "../support/projectScopeHistoryFixture.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import { scopePriorReferenceHistory } from "../support/scopePriorReferenceHistory.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";

test("partial selected timing beside a zero prior average and missing terminal identity retain honest scope references and separate historical segments", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await serveSummaryComparisonStory(
    page,
    origin,
    declaredSummaryComparisonEndpointsIn(origin.project),
  );
  const partial = makeMe.aCiProof
    .forRun({ revision: setup.completion, runId: 103 })
    .entries([
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .holding(
          makeMe.aCiProofEvidence
            .inUnit("case")
            .brokenDown({
              path: "dashboard/tests/folder/a.spec.ts",
              passed: 1,
              durationMs: 1200,
            })
            .missingPart(2)
            .please(),
        )
        .please(),
    ])
    .please();
  await keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, [0, 0, 0, 0, 0], {
      selectedProof: partial,
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await openCollectedHistoryStory(page, dashboard.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  const landing = `Selected landing ${shortSha(setup.completion)}`;
  // A partial selected timing: its status beside the usable average, no change.
  await expectScopeReadout(history, {
    selected: `${landing} · No timing · Partial: part 2 of 2 missing`,
    average: "Prior-build average · 0 ms · 5 prior builds used",
  });
  await expect(scopeHistoryChart(history, "test cases").average).toHaveCount(1);
  // No terminal signature: keep both declared units and a different owner's
  // complete reading, without choosing either as a combined reference.
  await keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, [100, 100, 100, 100, 100, 100], {
      selectedProof: makeMe.aCiProof.unavailableBecause("expired").please(),
      priorIdentities: {
        5: { entry: "dashboard/tests/folder", units: ["file"] },
      },
    }),
  );
  await intentFile(intent, summaryComparisonChanges.modified).click();
  await intentLocationName(intent, "dashboard/tests").click();
  await childName(summary, "folder/").first().click();
  const unidentified =
    "Prior-build average · Scope identity unavailable · 0 prior builds used";
  await expectScopeReadout(history, {
    selected: `${landing} · No timing · Expired CI proof summary`,
    average: unidentified,
  });
  const cases = scopeHistoryChart(history, "test cases");
  await expect(cases.average).toHaveCount(0);
  await expect(cases.readout).toContainText("Expired CI proof summary");
  await chooseTimingUnit(history, "Test files", "pointer");
  await expect(scopeHistoryChart(history, "test files").measured).toHaveCount(
    6,
  );
  await expect(history).toContainText(unidentified);
  await intentFile(intent, summaryComparisonChanges.modified).click();
  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toContainText(unidentified);
  await expect(storyTitle(intent)).toHaveText("Story A");
  expect(ciCalls()).toHaveLength(before);
});
