import {
  ciStatusReading,
  expectCiAnswer,
  chooseCiStatus,
  ciPanel,
  expectChecked,
  judged,
  judgmentCalls,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
// Intent's CI homepage shows again after a perspective switch; Optimization
// Candidates stays chosen across Development and back; a project change
// starts again on Intent (SEED-219 examples 2, 10). A new trunk revision
// re-reads the homepage judgment at the new head, while time alone and
// another branch moving read none. Candidates read at a new revision are
// in ./intent-test-optimization-candidates-revision.spec.ts.

import { expect, test } from "../dashboardTest.ts";
import { chooseProject, parts } from "../dashboardPage.ts";
import { doughnut, openDough } from "../intentCodeBrowseFixtures.ts";
import {
  moveOpenDoughTrunk,
  publishMovingOpenDough,
} from "../intentMovingOpenDough.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  expectIntentModeChosen,
  filesColumn,
} from "../intentModePage.ts";
import { openUntilRead, untilPageReadsAnswered } from "../pageRequestNotes.ts";
import {
  pausePageClock,
  passTimeUntilCheckedAfterSettled,
} from "../autoRefreshJourney.ts";

test("CI homepage shows again across Development and back; Optimization Candidates stays chosen; a project change starts again on Intent", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishMovingOpenDough(page).serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
    ]),
  );
  publishProject(page, doughnut);
  await openUntilRead(page, "/?project=open-dough");
  const { intent, intentChoice, development } = parts(page);
  await intentChoice.click();

  await test.step("CI homepage shows again across Development and back", async () => {
    const panel = await chooseCiStatus(intent);
    await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
    await development.click();
    await expect(intent).toHaveCount(0);
    await intentChoice.click();
    await expectIntentModeChosen(intent, "CI status");
    await expectCiAnswer(ciPanel(intent), "Passed at a1b2c3d (Add login)");
    await expect(filesColumn(intent)).toBeVisible();
  });

  await test.step("Optimization Candidates is kept across Development and back", async () => {
    await chooseOptimizationCandidates(intent);
    await development.click();
    await expect(intent).toHaveCount(0);
    await intentChoice.click();
    await expectIntentModeChosen(intent, "Optimization Candidates");
    await expectCandidatesRevision(intent, openDough.revision);
    await expect(filesColumn(intent)).toBeHidden();
  });

  await test.step("a project change starts again on Intent, and so does returning", async () => {
    await chooseProject(page, "Doughnut");
    await expectIntentModeChosen(intent, "CI status");
    await expect(intent).toContainText(
      "No intent locations are configured for Doughnut.",
    );
    await chooseProject(page, "Open Dough");
    await expectIntentModeChosen(intent, "CI status");
    await expect(candidatesRecord(intent)).toBeHidden();
    await expect(filesColumn(intent)).toBeVisible();
    await expect(ciPanel(intent)).toBeVisible();
  });
});

test("a new trunk revision re-reads the homepage judgment at the new head; time alone and another branch moving read none", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClock(page);
  const published = publishMovingOpenDough(page);
  published.serveCi(
    trunkCi(openDough.revision, () => [
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
    ]),
  );
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const panel = await chooseCiStatus(intent);
  await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
  await expectChecked(panel);
  const firstCheck =
    await ciStatusReading(panel).checkedTime.getAttribute("datetime");
  const firstCalls = judgmentCalls(published.requests);
  expect(firstCalls).toEqual([
    "actions-runs",
    "actions-workflow",
    "commit-list main",
  ]);

  await test.step("time alone and another branch moving read no judgment", async () => {
    await untilPageReadsAnswered(page);
    await passTimeUntilCheckedAfterSettled(page);
    published.moveBranch("story/unrelated-work", {
      revision: "f6".repeat(20),
      files: {},
    });
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    expect(judgmentCalls(published.requests)).toEqual(firstCalls);
    await expect(ciStatusReading(panel).checkedTime).toHaveAttribute(
      "datetime",
      firstCheck ?? "",
    );
  });

  // The trunk moves to a head with its own Failed run.
  const head = "e8".repeat(20);
  published.serveCi(
    trunkCi(head, () => [
      makeMe.aCiRun
        .with({ headSha: head, conclusion: "failure", url: runUrl })
        .please(),
      makeMe.aCiRun
        .with({ headSha: judged, conclusion: "success", url: runUrl })
        .please(),
    ]),
  );
  moveOpenDoughTrunk(published, head);
  await passTimeUntilCheckedAfterSettled(page);
  await untilPageReadsAnswered(page);

  await expectIntentModeChosen(intent, "CI status");
  await expectCiAnswer(panel, "Failed at e8e8e8e (Plan the next story)");
  await expect(panel).not.toContainText("later commits");
  await expect
    .poll(() => ciStatusReading(panel).checkedTime.getAttribute("datetime"))
    .not.toBe(firstCheck);
  expect(
    judgmentCalls(published.requests).filter(
      (call) => call === "commit-list main",
    ),
  ).toHaveLength(2);
});
