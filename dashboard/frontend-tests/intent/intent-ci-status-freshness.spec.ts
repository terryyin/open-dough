// Intent keeps a prior CI answer visibly qualified until a fresh answer
// replaces it (../../src/IntentCiStatus.tsx): a warm show answers at once
// with the kept answer, previously retrieved and checking, and a cold one
// shows only checking; a failed refresh keeps the answer previously
// retrieved beside the failure; an earlier target's late answer never
// answers a later selection. The Backend's keeping and acquisition are
// ../../backend-tests/intent/ and ../../../e2e/intent/intent-ci-status*.spec.ts.

import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import { parts } from "../../tests/dashboardPage.ts";
import { failing, running } from "../../tests/intentCiStoryBoard.ts";
import {
  expectKeptStoryCi,
  toggleOnDevelopment,
} from "../../tests/intentCiStoryRecords.ts";
import {
  chooseCiStatus,
  ciStatusReading,
  expectChecked,
  expectCiAnswer,
  expectCiScope,
  expectKeptCiAnswer,
} from "../../tests/intentCiStatusPage.ts";
import {
  givePageItsTurns,
  openUntilRead,
  untilPageReadsAnswered,
} from "../../tests/pageRequestNotes.ts";
import {
  judgedCiStatus,
  publishCiStoryBoard,
  serveFrontendCiStatus,
  storyBoardCiAnswers,
} from "../../tests/support/frontendCiStatusAnswers.ts";
import { expect, test } from "../../tests/support/frontendApp.ts";

const mainAt = (state: "pass" | "failed") =>
  judgedCiStatus("main", state, "a1b2c3d", "Add login");

test("a warm Intent show returns the kept answer labelled previously retrieved with a spinner until the fresh answer replaces it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date("2026-11-05T12:00:00.000Z"));
  const ci = await serveFrontendCiStatus(page, { main: mainAt("pass") });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent, development, intentChoice } = parts(page);
  let panel = await chooseCiStatus(intent);
  await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
  await expectChecked(panel);
  const firstChecked =
    await ciStatusReading(panel).checkedTime.getAttribute("datetime");
  expect(firstChecked).toMatch(/^\d{4}-\d\d-\d\dT/);

  await test.step("twenty minutes later, reopen Intent: kept answer at once with previously retrieved and spinner, then fresh replaces it", async () => {
    await page.clock.setFixedTime(new Date("2026-11-05T12:20:00.000Z"));
    ci.answer("main", mainAt("failed"));
    const fresh = ci.holdNext("main");
    await development.click();
    await intentChoice.click();
    panel = await chooseCiStatus(intent);
    await expectKeptCiAnswer(panel, {
      state: "Passed at a1b2c3d (Add login)",
      freshness: "Previously retrieved at",
      checkedAt: firstChecked ?? "",
      checking: "Checking the CI of main…",
    });
    fresh.release();
    await expectCiAnswer(panel, "Failed at a1b2c3d (Add login)");
    await expectChecked(panel);
    await expect(ciStatusReading(panel).checking).toHaveCount(0);
    await expect(ciStatusReading(panel).freshness).not.toContainText(
      "Previously retrieved",
    );
  });
});

test("a cold load shows only a spinner until CI answers; a later failed refresh keeps the answer as previously retrieved", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date("2026-11-05T12:00:00.000Z"));
  const ci = await serveFrontendCiStatus(page, { main: mainAt("pass") });
  const cold = ci.holdNext("main");
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const panel = await chooseCiStatus(intent);

  await test.step("cold: spinner only, no judgment yet", async () => {
    await expect(ciStatusReading(panel).freshness).toHaveText(
      "Checking the CI of main…",
    );
    await expect(ciStatusReading(panel).checking).toBeVisible();
    await expect(ciStatusReading(panel).state).toHaveCount(0);
    await expect(panel).not.toContainText("Previously retrieved");
    cold.release();
    await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
    await expectChecked(panel);
  });

  await test.step("Check again fails: kept answer stays previously retrieved with the failure", async () => {
    await page.clock.setFixedTime(new Date("2026-11-05T12:05:00.000Z"));
    ci.failNext("main", 502, "GitHub answered 503 Service Unavailable");
    await panel.getByRole("button", { name: "Check again" }).click();
    await expectCiAnswer(panel, "Passed at a1b2c3d (Add login)");
    await expect(ciStatusReading(panel).freshness).toContainText(
      "Previously retrieved at",
    );
    await expect(panel.getByRole("alert")).toContainText("503");
    await expect(
      panel.getByRole("button", { name: "Check again" }),
    ).toBeEnabled();
  });
});

test("a late trunk answer never appears after switching to a story branch that has a kept answer", async ({
  page,
  frontendServices,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  publishCiStoryBoard(frontendServices);
  const ci = await serveFrontendCiStatus(page, storyBoardCiAnswers());
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  let panel = await chooseCiStatus(intent);
  await expectCiScope(panel, "main");
  // Settle trunk so a Passed answer is kept before any story warms.
  await expectCiAnswer(panel, "Passed at 4774f60 (Add login)");
  await expectChecked(panel);
  // Warm the failing story's kept answer.
  panel = await toggleOnDevelopment(page, failing.title);
  await expectCiScope(panel, failing.branch);
  await expectCiAnswer(panel, "Failed at fa11ed0 (Break the login)");
  await expectChecked(panel);

  await test.step("hold trunk refresh, switch to the story: only the story's kept and fresh appear", async () => {
    panel = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(panel, "main");
    await expectCiAnswer(panel, "Passed at 4774f60 (Add login)");
    await expectChecked(panel);
    const late = ci.holdNext("main");
    await panel.getByRole("button", { name: "Check again" }).click();
    await late.received;
    await expect(ciStatusReading(panel).freshness).toContainText(
      "Previously retrieved",
    );
    await expect(ciStatusReading(panel).checking).toBeVisible();
    await expectCiAnswer(panel, "Passed at 4774f60 (Add login)");
    // Hold the fresh story read until its kept state has been observed.
    const freshStory = ci.holdNext(failing.branch);
    panel = await toggleOnDevelopment(page, failing.title);
    await expectKeptStoryCi(
      panel,
      failing.branch,
      "Failed at fa11ed0 (Break the login)",
    );
    late.release();
    await late.delivered;
    await givePageItsTurns(page);
    await expectKeptStoryCi(
      panel,
      failing.branch,
      "Failed at fa11ed0 (Break the login)",
    );
    freshStory.release();
    await expectChecked(panel);
    await untilPageReadsAnswered(page);
    await expectCiScope(panel, failing.branch);
    await expectCiAnswer(panel, "Failed at fa11ed0 (Break the login)");
    await expect(panel).not.toContainText("Passed at 4774f60");
  });

  await test.step("a held prior story answer arriving after switching to another story never shows", async () => {
    panel = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(panel, "main");
    const late = ci.holdNext(failing.branch);
    panel = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(panel, failing.branch);
    await expectCiAnswer(panel, "Failed at fa11ed0 (Break the login)");
    await expect(ciStatusReading(panel).freshness).toContainText(
      "Previously retrieved",
    );
    await late.received;
    panel = await toggleOnDevelopment(page, running.title);
    await expectCiScope(panel, running.branch);
    await expectCiAnswer(panel, "Running at 70a0001 (Start the story)");
    late.release();
    await late.delivered;
    await untilPageReadsAnswered(page);
    await expectCiScope(panel, running.branch);
    await expect(panel).not.toContainText("Failed");
    await expect(panel).not.toContainText(failing.branch);
  });
});
