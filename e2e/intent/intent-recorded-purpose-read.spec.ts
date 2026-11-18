// Representative acquisition from the real authenticated-read backend through
// FakeGitHub into the browser. Detailed target/grammar/scroll state is Frontend.
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  candidateEntry,
  chooseOptimizationCandidates,
} from "../../dashboard/test-support/intentModePage.ts";
import {
  expectSourceTargetLine,
  fileSource,
  sourceFile,
} from "../../dashboard/test-support/intentCodeBrowsePage.ts";
import { contentReadsOf } from "../../dashboard/test-support/intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenario,
  doughnutUniqueScenarioLine,
  publishDoughnutCasePosition,
} from "../../dashboard/test-support/intentCandidatesCasePositionFixtures.ts";

test("opening a recorded Purpose case acquires its pinned source from GitHub exactly once", async ({
  page,
}) => {
  const upstream = await publishDoughnutCasePosition(page);
  await openUntilRead(page, "/?project=doughnut&perspective=intent");
  const { intent } = parts(page);
  await chooseOptimizationCandidates(intent);
  const entry = candidateEntry(intent, "unique-scenario-once");
  await sourceFile(entry, doughnutCaseFeaturePath).click();
  await expect(fileSource(intent, doughnutCaseFeaturePath)).toContainText(
    `Scenario: ${doughnutUniqueScenario}`,
  );
  await expectSourceTargetLine(
    fileSource(intent, doughnutCaseFeaturePath),
    doughnutUniqueScenarioLine,
  );
  expect(contentReadsOf(upstream, doughnutCaseFeaturePath)).toBe(1);
});
