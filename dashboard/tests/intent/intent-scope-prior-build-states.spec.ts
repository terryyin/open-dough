import { priorBuildReferenceReading } from "../priorBuildReferencePage.ts";
// Normal local readers of canonical raw proof expose the selection signature
// separately from measured completeness; never supply a finished average.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../support/preparationPage.ts";
import {
  publishSummaryComparisonStory,
  summaryComparisonChanges,
} from "../support/intentSummaryStoryComparisonFixture.ts";
import { scopePriorReferenceHistory } from "../support/scopePriorReferenceHistory.ts";
import {
  keepLandedCiHistory,
  restartAsLandedCiReader,
} from "../support/landedCiHistory.ts";
import { openCollectedHistoryStory } from "../support/scopeHistoryCollectedPage.ts";
import { openSummaryComparison } from "../support/selectDoneStoryForSummaryComparison.ts";
import { intentFile, storyTitle } from "../support/intentStoryPage.ts";
import {
  intentLocationName,
  fileReadingTab,
  proofRegion,
} from "../intentPerspectivePage.ts";
import type { DashboardServer } from "../support/dashboardServer.ts";
import { childName } from "../intentScopeProofPage.ts";

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
  keepLandedCiHistory(
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
  const history = summary.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  const cases = history.getByRole("region", {
    name: "Test cases",
    exact: true,
  });
  await expect(cases).toContainText("Prior-build average · 0 ms");
  await expect(cases).toContainText(
    "+1.2 s (percentage unavailable: average is zero)",
  );
  await expect(cases).toContainText("5 prior builds used");
  const revisit = async () => {
    await intentFile(intent, summaryComparisonChanges.modified).click();
    await intentLocationName(intent, "dashboard/tests").click();
  };
  keepLandedCiHistory(
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
  await expect(cases.locator(".intent-ci-history-reference")).toHaveCount(1);
  const partial = priorBuildReferenceReading(cases).selected;
  await expect(partial).toContainText("part 2 of 2 missing");
  await expect(partial).not.toContainText("1.2 s");
  // No terminal signature: keep both declared units and a different owner's
  // complete reading, without choosing either as a combined reference.
  keepLandedCiHistory(
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
  await expect(history.locator(".intent-ci-history-reference")).toHaveCount(0);
  const readings = history.getByRole("list", {
    name: "Test execution history evidence",
  });
  await expect(readings).toContainText("test cases · entry dashboard/tests");
  await expect(readings).toContainText(
    "test files · entry dashboard/tests/folder",
  );
  await expect(readings).toContainText("Expired CI proof summary");
  await expect(
    history.getByRole("region", { name: "Test files", exact: true }),
  ).toContainText("no comparable reference can be established");
  await intentFile(intent, summaryComparisonChanges.modified).click();
  await fileReadingTab(intent, "Proof").click();
  await expect(proofRegion(intent)).toContainText(
    "no comparable reference can be established",
  );
  await expect(storyTitle(intent)).toHaveText("Story A");
  expect(ciCalls()).toHaveLength(before);
});
