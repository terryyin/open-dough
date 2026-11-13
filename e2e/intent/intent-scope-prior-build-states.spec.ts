import {
  scopeHistory,
  scopeHistoryReading,
  scopeHistoryUnit,
} from "../../dashboard/tests/intentScopeHistoryPage.ts";
import { priorBuildReferenceReading } from "../../dashboard/tests/priorBuildReferencePage.ts";
// Normal local readers of canonical raw proof expose the selection signature
// separately from measured completeness; never supply a finished average.
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  expect,
  queuedClaudePreviewTest as test,
} from "../../dashboard/tests/support/preparationPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../../dashboard/tests/support/intentSummaryStoryComparisonFixture.ts";
import { scopePriorReferenceHistory } from "../../dashboard/tests/support/scopePriorReferenceHistory.ts";
import {
  keepLandedCiHistory,
  restartAsLandedCiReader,
} from "../../dashboard/tests/support/landedCiHistory.ts";
import { openCollectedHistoryStory } from "../../dashboard/tests/support/scopeHistoryCollectedPage.ts";
import { openSummaryComparison } from "../../dashboard/tests/support/selectDoneStoryForSummaryComparison.ts";
import {
  intentFile,
  storyTitle,
} from "../../dashboard/tests/support/intentStoryPage.ts";
import {
  intentLocationName,
  fileReadingTab,
  proofRegion,
} from "../../dashboard/tests/intentPerspectivePage.ts";
import type { DashboardServer } from "../../dashboard/tests/support/dashboardServer.ts";
import { childName } from "../../dashboard/tests/intentScopeProofPage.ts";

const readers: DashboardServer[] = [];
test.afterEach(async () => {
  await Promise.all(readers.splice(0).map((reader) => reader.close()));
});

test("zero, partial selected timing and missing terminal identity retain honest scope references and separate historical segments", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  const setup = await publishSummaryComparisonStory(page, origin);
  const proof = (partial: boolean) => {
    const evidence = makeMe.aCiProofEvidence.inUnit("case").brokenDown({
      path: "dashboard/tests/folder/a.spec.ts",
      passed: 1,
      durationMs: 1200,
    });
    if (partial) {
      evidence.missingPart(2);
    }
    return makeMe.aCiProof
      .forRun({ revision: setup.completion, runId: 103 })
      .entries([
        makeMe.aCiProofEntry
          .at("dashboard/tests")
          .holding(evidence.please())
          .please(),
      ])
      .please();
  };
  await keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, [0, 0, 0, 0, 0], {
      selectedProof: proof(false),
    }),
  );
  const reader = await restartAsLandedCiReader(dashboard, origin, "preview");
  readers.push(reader);
  await page.setViewportSize({ width: 390, height: 844 });
  const { intent } = await openCollectedHistoryStory(page, reader.origin);
  const ciCalls = () =>
    github.calls.filter(({ request }) => request.kind.startsWith("actions-"));
  const before = ciCalls().length;
  const summary = await openSummaryComparison(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  const cases = scopeHistoryUnit(history, "Test cases");
  await expect(cases).toContainText("Prior-build average · 0 ms");
  await expect(cases).toContainText(
    "+1.2 s (percentage unavailable: average is zero)",
  );
  await expect(cases).toContainText("5 prior builds used");
  const revisit = async () => {
    await intentFile(intent, summaryComparisonChanges.modified).click();
    await intentLocationName(intent, "dashboard/tests").click();
  };
  await keepLandedCiHistory(
    dashboard.home,
    scopePriorReferenceHistory(origin, setup, [0, 0, 0, 0, 0], {
      selectedProof: proof(true),
    }),
  );
  await revisit();
  await expect(cases).toContainText("Prior-build average · 0 ms");
  await expect(cases).toContainText(
    "Difference unavailable: Partial: part 2 of 2 missing",
  );
  await expect(cases).not.toContainText("+1.2 s");
  await expect(scopeHistoryReading(cases).reference).toHaveCount(1);
  const partial = priorBuildReferenceReading(cases).selected;
  await expect(partial).toContainText("part 2 of 2 missing");
  await expect(partial).not.toContainText("1.2 s");
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
  await revisit();
  await childName(summary, "folder/").first().click();
  await expect(cases).toContainText(
    "Selected scope identity unavailable: no comparable reference can be established",
  );
  await expect(cases).toContainText("0 prior builds used");
  await expect(scopeHistoryReading(history).reference).toHaveCount(0);
  const readings = scopeHistoryReading(history).evidence;
  await expect(readings).toContainText("test cases · entry dashboard/tests");
  await expect(readings).toContainText(
    "test files · entry dashboard/tests/folder",
  );
  await expect(readings).toContainText("Expired CI proof summary");
  await expect(scopeHistoryUnit(history, "Test files")).toContainText(
    "no comparable reference can be established",
  );
  await intentFile(intent, summaryComparisonChanges.modified).click();
  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toContainText(
    "no comparable reference can be established",
  );
  await expect(storyTitle(intent)).toHaveText("Story A");
  expect(ciCalls()).toHaveLength(before);
});
