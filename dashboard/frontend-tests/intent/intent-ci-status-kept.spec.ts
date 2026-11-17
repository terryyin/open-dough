// Intent's CI homepage shows again after a perspective switch; Optimization
// Candidates stays chosen across Development and back; a project change
// starts again on Intent (SEED-219 examples 2, 10). A new trunk revision
// asks for the homepage judgment again, while time alone and another branch
// moving ask for none. The
// GitHub reads behind each judgment are ../../../e2e/intent/intent-ci-status.spec.ts
// and ../../../e2e/intent/intent-ci-status-story.spec.ts.

import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { chooseProject, parts } from "../../tests/dashboardPage.ts";
import { failing } from "../../tests/intentCiStoryBoard.ts";
import {
  chooseCiStatus,
  ciPanel,
  ciStatusReading,
  expectChecked,
  expectCiAnswer,
} from "../../tests/intentCiStatusPage.ts";
import {
  candidatesRecord,
  chooseOptimizationCandidates,
  expectCandidatesRevision,
  expectIntentModeChosen,
  filesColumn,
} from "../../tests/intentModePage.ts";
import {
  openUntilRead,
  passCheckPace,
  untilPageReadsAnswered,
} from "../../tests/pageRequestNotes.ts";
import {
  judgedCiStatus,
  serveFrontendCiStatus,
} from "../../tests/support/frontendCiStatusAnswers.ts";
import {
  publishCiStoryBoard,
  publishUnconfiguredDoughnut,
} from "../../tests/support/frontendServiceState.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";

const login = judgedCiStatus("main", "pass", "a1b2c3d", "Add login");

test("CI homepage shows again across Development and back; Optimization Candidates stays chosen; a project change starts again on Intent", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await publishUnconfiguredDoughnut(page, frontendServices);
  await serveFrontendCiStatus(page, { main: login });
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
    await expectCandidatesRevision(intent, frontendServices.revision);
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

test("a new trunk revision asks for the homepage judgment again at the new head; time alone and another branch moving ask for none", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date("2026-11-05T12:00:00.000Z"));
  // The board's failing story has a counted plan, so the page watches its
  // branch, which is not the judged one.
  publishCiStoryBoard(frontendServices);
  Object.assign(frontendServices, {
    branchHeads: { [failing.branch]: "f1".repeat(20) },
  });
  const moved = "f6".repeat(20);
  let branchReads = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).searchParams.get("branch") === failing.branch)
      branchReads += 1;
  });
  const ci = await serveFrontendCiStatus(page, { main: login });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const panel = await chooseCiStatus(intent);
  await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
  await expectChecked(panel);
  const firstCheck =
    await ciStatusReading(panel).checkedTime.getAttribute("datetime");
  const firstReads = ci.reads();

  await test.step("time alone and another branch moving ask for no judgment", async () => {
    await untilPageReadsAnswered(page);
    await passCheckPace(page);
    await passCheckPace(page);
    const branchReadsBefore = branchReads;
    Object.assign(frontendServices, {
      branchHeads: { [failing.branch]: moved },
    });
    await passCheckPace(page);
    await untilPageReadsAnswered(page);
    // The page saw that branch move: it read the story's progress there.
    expect(branchReads).toBeGreaterThan(branchReadsBefore);
    expect(ci.reads()).toEqual(firstReads);
    await expect(ciStatusReading(panel).checkedTime).toHaveAttribute(
      "datetime",
      firstCheck ?? "",
    );
  });

  // The trunk moves to a head with its own Failed run.
  const head = "e8".repeat(20);
  ci.answer(
    "main",
    judgedCiStatus("main", "failed", head, "Plan the next story"),
  );
  Object.assign(frontendServices, { revision: head });
  await passCheckPace(page);
  await untilPageReadsAnswered(page);

  await expectIntentModeChosen(intent, "CI status");
  await expectCiAnswer(panel, "Failed at e8e8e8e (Plan the next story)");
  await expect(panel).not.toContainText("later commits");
  await expect
    .poll(() => ciStatusReading(panel).checkedTime.getAttribute("datetime"))
    .not.toBe(firstCheck);
  expect(ci.reads().fresh).toBe(firstReads.fresh + 1);
});
