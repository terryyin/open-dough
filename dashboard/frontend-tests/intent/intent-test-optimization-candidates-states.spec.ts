import { readRetry } from "../../tests/intentReadRecoveryPage.ts";
import { fileSource, sourceFile } from "../../tests/intentCodeBrowsePage.ts";
// Intent explains absent, unreadable, mismatched, and empty Test
// Optimization Candidates records on its Optimization Candidates tab while
// location browsing stays usable on the Intent tab (example 7;
// ../../src/IntentCandidatesRecord.tsx).

import { expect, test } from "../../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { chooseProject, parts } from "../../tests/dashboardPage.ts";
import { expandIntentGroup } from "../../tests/intentPerspectivePage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  intentModeTab,
} from "../../tests/intentModePage.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "../../tests/pageRequestNotes.ts";
import {
  emptyCandidatesRecord,
  mismatchedCandidatesRecord,
  openDoughSources,
  testOptimizationCandidatesPath,
} from "../../tests/intentCandidatesFixtures.ts";
import {
  doughnut,
  doughnutSettings,
  nodeTest,
  openDough,
  openDoughSettings,
  pygardon,
  pygardonSettings,
  pythonTest,
} from "../../tests/intentCodeBrowseFixtures.ts";
import { prepareCandidateProjects } from "../../tests/support/frontendIntentCandidates.ts";

test("Intent explains absent, unreadable, mismatched, and empty candidate records without disturbing location browsing", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date("2026-11-05T08:00:00.000Z"));
  await page.setViewportSize({ width: 1100, height: 800 });

  const openDoughEmpty = {
    project: openDough,
    settings: openDoughSettings,
    files: {
      ...openDoughSources,
      [testOptimizationCandidatesPath]: emptyCandidatesRecord,
    },
  };
  const { publish } = await prepareCandidateProjects(page, frontendServices, [
    {
      project: doughnut,
      settings: doughnutSettings,
      files: { "scripts/backend-test-worktree-admission.test.mjs": nodeTest },
    },
    openDoughEmpty,
    {
      project: pygardon,
      settings: pygardonSettings,
      files: {
        [testOptimizationCandidatesPath]: mismatchedCandidatesRecord,
        "tests/test_example.py": pythonTest,
      },
    },
  ]);

  await openUntilRead(page, "/?project=doughnut");
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const intentTab = intentModeTab(intent, "CI status");

  await test.step("Ex 7 absent: no published record; locations still browse", async () => {
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, doughnut.revision);
    await expect(candidatesRecord(intent)).toContainText(
      "No Test Optimization Candidates record has been published for Doughnut",
    );
    await page.clock.runFor(70_000);
    await untilPageRequestsAnswered(page);
    await expect(candidatesRecord(intent)).toHaveAttribute(
      "data-candidates-reads",
      "1",
    );
    await intentTab.click();
    await expandIntentGroup(intent, "scripts");
    await sourceFile(
      intent,
      "scripts/backend-test-worktree-admission.test.mjs",
    ).click();
    await expect(
      fileSource(intent, "scripts/backend-test-worktree-admission.test.mjs"),
    ).toContainText("assert.equal(1, 1)");
  });

  await test.step("Ex 7 empty: both pending and accepted are None.", async () => {
    await chooseProject(page, "Open Dough");
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, openDough.revision);
    await expect(candidatesRecord(intent)).toContainText(
      "This record has no pending candidates or accepted necessary costs.",
    );
    await expect(
      candidatesRecord(intent).getByRole("region", {
        name: "Pending candidates",
      }),
    ).toContainText("None.");
    await expect(
      candidatesRecord(intent).getByRole("region", {
        name: "Accepted necessary costs",
      }),
    ).toContainText("None.");
    await intentTab.click();
    await expandIntentGroup(intent, "dashboard/tests");
    await expect(
      sourceFile(intent, "dashboard/tests/intent-gherkin-browse.spec.ts"),
    ).toBeVisible();
  });

  await test.step("Ex 7 mismatched: no partial guess; locations still browse", async () => {
    await chooseProject(page, "Pygardon");
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, pygardon.revision);
    await expect(candidatesRecord(intent)).toContainText(
      `${testOptimizationCandidatesPath} is not a Test Optimization Candidates record`,
    );
    await expect(candidatesRecord(intent)).not.toContainText(
      "Body that Intent must not partially show",
    );
    await page.clock.runFor(70_000);
    await untilPageRequestsAnswered(page);
    await expect(candidatesRecord(intent)).toHaveAttribute(
      "data-candidates-reads",
      "1",
    );
    await intentTab.click();
    await expandIntentGroup(intent, "tests");
    await sourceFile(intent, "tests/test_example.py").click();
    await expect(fileSource(intent, "tests/test_example.py")).toContainText(
      "def test_example",
    );
  });

  await test.step("Ex 7 unreadable: own explanation with retry; locations still browse", async () => {
    const revision = "e5".repeat(20);
    publish({
      ...openDoughEmpty,
      project: { ...openDough, revision },
      candidatesProblem: "unreadable",
    });
    await openUntilRead(page, "/?project=open-dough&perspective=intent");
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, revision);
    await expect(candidatesRecord(intent)).toContainText(
      `${testOptimizationCandidatesPath} could not be read at this revision`,
    );
    await expect(readRetry(candidatesRecord(intent))).toBeVisible();
    await intentTab.click();
    await expandIntentGroup(intent, "dashboard/tests");
    await expect(
      sourceFile(intent, "dashboard/tests/intent-gherkin-browse.spec.ts"),
    ).toBeVisible();
  });
});
