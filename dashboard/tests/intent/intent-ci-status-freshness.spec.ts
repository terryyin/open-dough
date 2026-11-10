// Intent keeps prior CI answers visibly qualified until a fresh answer replaces
// them; an earlier target never answers a later selection.

import { expect, pausePageClockAt, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import {
  chooseCiStatus,
  expectChecked,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { failing, running } from "../intentCiStoryBoard.ts";
import {
  expectNamed,
  expectKeptStoryCi,
  freshCiStatusReadSettled,
  publishStoryCi,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import {
  givePageItsTurns,
  openUntilRead,
  untilPageReadsAnswered,
} from "../pageRequestNotes.ts";
import { httpErrorAnswer } from "../originAnswers.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { CiAnswerer, CiRunAnswer } from "../support/baseCiActions.ts";

test("a warm Intent show returns the kept answer labelled previously retrieved with a spinner until the fresh answer replaces it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date("2026-11-05T12:00:00.000Z"));
  let runs: readonly CiRunAnswer[] = [
    makeMe.aCiRun
      .with({ headSha: judged, conclusion: "success", url: runUrl })
      .please(),
  ];
  let holdFresh: Promise<void> = Promise.resolve();
  let releaseFresh: () => void = () => undefined;
  const published = publishProject(page, openDough);
  const answer: CiAnswerer = async (call) => {
    if (call.request.kind === "commit-list" && call.request.revision === "main")
      await holdFresh;
    return (
      trunkCi(openDough.revision, () => runs)(call) ??
      httpErrorAnswer(500, "unexpected CI call")
    );
  };
  published.serveCi(answer);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent, development, intentChoice } = parts(page);
  let panel = await chooseCiStatus(intent);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Passed at a1b2c3d (Add login)",
  );
  await expectChecked(panel);
  const firstChecked = await panel.locator("time").getAttribute("datetime");
  expect(firstChecked).toMatch(/^\d{4}-\d\d-\d\dT/);

  await test.step("twenty minutes later, reopen Intent: kept answer at once with previously retrieved and spinner, then fresh replaces it", async () => {
    await page.clock.setFixedTime(new Date("2026-11-05T12:20:00.000Z"));
    runs = [
      makeMe.aCiRun
        .with({
          headSha: judged,
          conclusion: "failure",
          url: `${runUrl}-newer`,
        })
        .please(),
    ];
    holdFresh = new Promise<void>((resolve) => {
      releaseFresh = resolve;
    });
    await development.click();
    await intentChoice.click();
    panel = await chooseCiStatus(intent);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expect(panel.getByRole("status")).toContainText(
      "Previously retrieved at",
    );
    await expect(panel.locator("time")).toHaveAttribute(
      "datetime",
      firstChecked ?? "",
    );
    await expect(panel.locator(".intent-ci-checking")).toContainText(
      "Checking the CI of main…",
    );
    releaseFresh();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at a1b2c3d (Add login)",
    );
    await expectChecked(panel);
    await expect(panel.locator(".intent-ci-checking")).toHaveCount(0);
    await expect(panel.getByRole("status")).not.toContainText(
      "Previously retrieved",
    );
  });
});

test("a cold load shows only a spinner until CI answers; a later failed refresh keeps the answer as previously retrieved", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date("2026-11-05T12:00:00.000Z"));
  let failFresh = false;
  let releaseCold: () => void = () => undefined;
  const coldHold = new Promise<void>((resolve) => {
    releaseCold = resolve;
  });
  const published = publishProject(page, openDough);
  published.serveCi(async (call) => {
    if (
      call.request.kind === "commit-list" &&
      call.request.revision === "main"
    ) {
      await coldHold;
      if (failFresh) return httpErrorAnswer(503, "Service Unavailable");
    }
    return (
      trunkCi(openDough.revision, () => [
        makeMe.aCiRun
          .with({ headSha: judged, conclusion: "success", url: runUrl })
          .please(),
      ])(call) ?? httpErrorAnswer(500, "unexpected CI call")
    );
  });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const panel = await chooseCiStatus(intent);

  await test.step("cold: spinner only, no judgment yet", async () => {
    await expect(panel.getByRole("status")).toHaveText(
      "Checking the CI of main…",
    );
    await expect(panel.locator(".intent-ci-checking")).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveCount(0);
    await expect(panel).not.toContainText("Previously retrieved");
    releaseCold();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expectChecked(panel);
  });

  await test.step("Check again fails: kept answer stays previously retrieved with the failure", async () => {
    await page.clock.setFixedTime(new Date("2026-11-05T12:05:00.000Z"));
    failFresh = true;
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expect(panel.getByRole("status")).toContainText(
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
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ci = publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  let panel = await chooseCiStatus(intent);
  await expectNamed(panel, "main");
  // Settle trunk so this process keeps a Passed answer before any story warm.
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Passed at 4774f60 (Add login)",
  );
  await expectChecked(panel);
  // Warm the failing story's kept answer.
  panel = await toggleOnDevelopment(page, failing.title);
  await expectNamed(panel, failing.branch);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Failed at fa11ed0 (Break the login)",
  );
  await expectChecked(panel);

  await test.step("hold trunk refresh, switch to the story: only the story's kept and fresh appear", async () => {
    // Clear selection → main homepage; wait for the remount's fresh keep before
    // holding the next history listing (a hold mid-remount would hang Check again).
    panel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(panel, "main");
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
    await expectChecked(panel);
    const late = ci.hold("main");
    const lateRead = freshCiStatusReadSettled(page);
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(panel.getByRole("status")).toContainText(
      "Previously retrieved",
    );
    await expect(panel.locator(".intent-ci-checking")).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
    // Hold the fresh story read until its kept state has been observed.
    const freshStory = ci.hold(failing.branch);
    panel = await toggleOnDevelopment(page, failing.title);
    await expectKeptStoryCi(
      panel,
      failing.branch,
      "Failed at fa11ed0 (Break the login)",
    );
    late.release();
    await expect.poll(late.served).toBe(true);
    await lateRead;
    await givePageItsTurns(page);
    await expectKeptStoryCi(
      panel,
      failing.branch,
      "Failed at fa11ed0 (Break the login)",
    );
    freshStory.release();
    await expectChecked(panel);
    await untilPageReadsAnswered(page);
    await expectNamed(panel, failing.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at fa11ed0 (Break the login)",
    );
    await expect(panel).not.toContainText("Passed at 4774f60");
  });

  await test.step("a held prior story answer arriving after switching to another story never shows", async () => {
    // Clear failing → main, then re-select failing under a hold, then switch.
    panel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(panel, "main");
    const late = ci.hold(failing.branch);
    const lateRead = freshCiStatusReadSettled(page, failing.branch);
    panel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(panel, failing.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at fa11ed0 (Break the login)",
    );
    await expect(panel.getByRole("status")).toContainText(
      "Previously retrieved",
    );
    panel = await toggleOnDevelopment(page, running.title);
    await expectNamed(panel, running.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Running at 70a0001 (Start the story)",
    );
    late.release();
    await expect.poll(late.served).toBe(true);
    await lateRead;
    await untilPageReadsAnswered(page);
    await expectNamed(panel, running.branch);
    await expect(panel).not.toContainText("Failed");
    await expect(panel).not.toContainText(failing.branch);
  });
});
