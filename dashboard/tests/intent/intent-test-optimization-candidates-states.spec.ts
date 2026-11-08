// Intent explains absent, unreadable, mismatched, and empty Test
// Optimization Candidates records on its Optimization Candidates tab while
// location browsing stays usable on the Intent tab (example 7;
// ../../src/IntentCandidatesRecord.tsx).

import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import { chooseProject, parts } from "../dashboardPage.ts";
import { expandIntentGroup } from "../intentPerspectivePage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  intentModeTab,
} from "../intentModePage.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "../pageRequestNotes.ts";
import { publishFiles } from "../publishedOrigin.ts";
import {
  emptyCandidatesRecord,
  mismatchedCandidatesRecord,
  publishOpenDoughWithCandidates,
  testOptimizationCandidatesPath,
} from "../intentCandidatesFixtures.ts";
import {
  browseSpec,
  doughnut,
  doughnutSettings,
  nodeTest,
  openDough,
  openDoughSettings,
  publishIntentProject,
  pygardon,
  pygardonSettings,
  pythonTest,
  shellCheck,
} from "../intentCodeBrowseFixtures.ts";

test("Intent explains absent, unreadable, mismatched, and empty candidate records without disturbing location browsing", async ({
  page,
}) => {
  await pausePageClockAt(page, new Date("2026-11-05T08:00:00.000Z"));
  await page.setViewportSize({ width: 1100, height: 800 });

  await publishIntentProject(page, doughnut, doughnutSettings, {
    "scripts/backend-test-worktree-admission.test.mjs": nodeTest,
  });
  await publishOpenDoughWithCandidates(page, emptyCandidatesRecord);
  await publishIntentProject(page, pygardon, pygardonSettings, {
    [testOptimizationCandidatesPath]: mismatchedCandidatesRecord,
    "tests/test_example.py": pythonTest,
  });

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
    await intent
      .getByRole("button", {
        name: "scripts/backend-test-worktree-admission.test.mjs",
        exact: true,
      })
      .click();
    await expect(
      intent.getByLabel(
        "scripts/backend-test-worktree-admission.test.mjs source",
      ),
    ).toContainText("assert.equal(1, 1)");
  });

  await test.step("Ex 7 empty: both pending and accepted are None.", async () => {
    await chooseProject(page, "Open Dough");
    await chooseOptimizationCandidates(intent);
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
      intent.getByRole("button", {
        name: "dashboard/tests/intent-gherkin-browse.spec.ts",
        exact: true,
      }),
    ).toBeVisible();
  });

  await test.step("Ex 7 mismatched: no partial guess; locations still browse", async () => {
    await chooseProject(page, "Pygardon");
    await chooseOptimizationCandidates(intent);
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
    await intent
      .getByRole("button", {
        name: "tests/test_example.py",
        exact: true,
      })
      .click();
    await expect(
      intent.getByLabel("tests/test_example.py source"),
    ).toContainText("def test_example");
  });

  await test.step("Ex 7 unreadable: own explanation with retry; locations still browse", async () => {
    const revision = "e5".repeat(20);
    await publishFiles(page, {
      repository: openDough.repository,
      ref: openDough.ref,
      revision,
      files: {
        ...openDough.files,
        ".planning/open-dough.json": `${openDoughSettings}\n`,
        "dashboard/tests/intent-gherkin-browse.spec.ts": browseSpec,
        "tests/compare-versions.sh": shellCheck,
      },
      unanswered: [testOptimizationCandidatesPath],
    });
    await openUntilRead(page, "/?project=open-dough&perspective=intent");
    await chooseOptimizationCandidates(intent);
    await expectCandidatesRevision(intent, revision);
    await expect(candidatesRecord(intent)).toContainText(
      `${testOptimizationCandidatesPath} could not be read at this revision`,
    );
    await expect(
      candidatesRecord(intent).getByRole("button", { name: "Retry" }),
    ).toBeVisible();
    await intentTab.click();
    await expandIntentGroup(intent, "dashboard/tests");
    await expect(
      intent.getByRole("button", {
        name: "dashboard/tests/intent-gherkin-browse.spec.ts",
        exact: true,
      }),
    ).toBeVisible();
  });
});
