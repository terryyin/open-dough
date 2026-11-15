// Representative acquisition from the real authenticated-read backend through
// FakeGitHub into the browser. Detailed target/grammar/scroll state is Frontend.
import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  candidateEntry,
  chooseOptimizationCandidates,
} from "../../dashboard/tests/intentModePage.ts";
import {
  expectSourceTargetLine,
  fileSource,
  sourceFile,
} from "../../dashboard/tests/intentCodeBrowsePage.ts";
import { contentReadsOf } from "../../dashboard/tests/intentCodeBrowseFixtures.ts";
import {
  doughnutCaseFeaturePath,
  doughnutUniqueScenario,
  doughnutUniqueScenarioLine,
  publishDoughnutCasePosition,
} from "../../dashboard/tests/intentCandidatesCasePositionFixtures.ts";

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
