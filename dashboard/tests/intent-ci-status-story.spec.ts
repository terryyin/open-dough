// Intent's CI status follows the page's selected story
// (../src/intentCiTarget.ts): a Taken Story Branch Mode story selected on
// Development is judged on its published story branch, named as such, with
// trunk runs of shared commits counting and the run's branch named; another
// selection replaces the judgment, never showing an earlier branch's result
// under the new name, even when that answer arrives late; clearing the
// selection returns to `main` (SEED-219 examples 2, 3, 4, 6, 7). A running
// head shows its nearest completed ancestor with its run, and Check again
// after it finishes shows Passed. A push to the shown story branch, seen by
// the page's revision check, reads its judgment again by itself; time alone,
// and a branch not shown moving, read none. Stories without a branch to
// judge: ./intent-ci-status-story-gaps.spec.ts.

import type { Request } from "@playwright/test";
import { expect, pausePageClockAt, test } from "./dashboardTest.ts";
import { passTimeUntilCheckedAfterSettled } from "./autoRefreshJourney.ts";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus, expectChecked } from "./intentCiStatusPage.ts";
import { failing, planningOnly, running } from "./intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  expectNamed,
  failedRun,
  mainRun,
  publishStoryCi,
  runningRun,
  started,
  toggleOnDevelopment,
} from "./intentCiStoryRecords.ts";
import { openUntilRead, untilPageReadsAnswered } from "./pageRequestNotes.ts";

test.setTimeout(90_000);

test("CI status judges the selected story's branch, counts trunk runs of shared commits, replaces the judgment on a new selection, and returns to main when cleared", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ci = publishStoryCi(page);
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const trunkPanel = await chooseCiStatus(intent);
  await expectNamed(trunkPanel, "main");
  await expect(trunkPanel.locator(".intent-ci-state")).toHaveText(
    "Passed at 4774f60 (Add login)",
  );

  await test.step("a Taken Story Branch Mode story: still CI status, names its branch, Failed with its run while main passes", async () => {
    const before = calls.length;
    const panel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(panel, failing.branch);
    await expect(panel).toContainText(`Story branch of ${failing.title}.`);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at fa11ed0 (Break the login)",
    );
    await expect(panel.getByRole("link", { name: failedRun })).toBeVisible();
    await expect(panel).not.toContainText("run on");
    await expectChecked(panel);
    // History, the branch's runs, the trunk's runs, and the workflow lookup.
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      "actions-runs codex/example-story",
      "actions-runs main",
      "actions-workflow",
      "commit-list codex/example-story",
    ]);
  });

  await test.step("only planning commits over main: the shared ancestor's main run counts, named, and the branch's commits have no result", async () => {
    const panel = await toggleOnDevelopment(page, planningOnly.title);
    await expectNamed(panel, planningOnly.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login), run on main",
    );
    await expect(panel).toContainText(
      "2 later commits have no result of their own.",
    );
    await expect(panel.getByRole("link", { name: mainRun })).toBeVisible();
    await expect(panel).not.toContainText("fa11ed0");
    await expect(panel).not.toContainText(failing.branch);
  });

  await test.step("a selection whose answer arrives after the next selection never shows it", async () => {
    // Back to the failing story, held, then straight on to the running one.
    const late = ci.hold(failing.branch);
    // The page's read of the held judgment ends, answered or given up.
    const lateRead = new Promise<void>((resolve) => {
      const settled = (request: Request) => {
        if (
          new URL(request.url()).searchParams.get("judged") === failing.branch
        )
          resolve();
      };
      page.on("requestfinished", settled);
      page.on("requestfailed", settled);
    });
    let panel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(panel, failing.branch);
    await expect(panel.getByRole("status")).toHaveText(
      `Checking the CI of ${failing.branch}…`,
    );
    // The earlier branch's judgment is not shown under this name meanwhile.
    await expect(panel.locator(".intent-ci-state")).toHaveCount(0);
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

  await test.step("a running head shows its nearest completed ancestor, on main; Check again after it finishes shows Passed", async () => {
    const panel = parts(page).intent.getByRole("tabpanel", {
      name: "CI status",
      exact: true,
    });
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Running at 70a0001 (Start the story)",
    );
    await expect(panel.getByRole("link", { name: runningRun })).toBeVisible();
    await expect(panel).toContainText(
      "Nearest completed ancestor: d4e5f6a (Add signup) — passed. Run on main.",
    );
    // The ancestor's own run link.
    await expect(panel.getByRole("link", { name: mainRun })).toBeVisible();
    ci.runs[running.branch] = [
      { headSha: started, conclusion: "success", url: runningRun },
    ];
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 70a0001 (Start the story)",
    );
    await expect(panel).not.toContainText("Nearest completed ancestor");
  });

  await test.step("clearing the selection shows main again", async () => {
    const panel = await toggleOnDevelopment(page, running.title);
    await expectNamed(panel, "main");
    await expect(panel).not.toContainText("Story branch of");
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
    await expect(panel).toContainText(
      "One later commit has no result of its own.",
    );
  });
});

test("a push to the shown story branch, seen by the revision check, reads its judgment again without Check again; time alone and a branch not shown moving read none", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date());
  const ci = publishStoryCi(page);
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  const panel = await toggleOnDevelopment(page, failing.title);
  await expectNamed(panel, failing.branch);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Failed at fa11ed0 (Break the login)",
  );
  await expectChecked(panel);
  const firstCheck = await panel.locator("time").getAttribute("datetime");

  await test.step("time passing with nothing moved reads no judgment", async () => {
    await untilPageReadsAnswered(page);
    const before = calls.length;
    await passTimeUntilCheckedAfterSettled(page);
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([]);
    await expect(panel.locator("time")).toHaveAttribute(
      "datetime",
      firstCheck ?? "",
    );
  });

  await test.step("a push to the shown branch reads its judgment once more, by itself", async () => {
    const fixed = "c0ffee1".padEnd(40, "0");
    ci.runs[failing.branch] = [
      { headSha: fixed, conclusion: "success", url: failedRun },
    ];
    ci.push(failing.branch, fixed, "Fix the login");
    const before = calls.length;
    await passTimeUntilCheckedAfterSettled(page);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at c0ffee1 (Fix the login)",
    );
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      "actions-runs codex/example-story",
      "actions-runs main",
      "actions-workflow",
      "commit-list codex/example-story",
    ]);
    await expect(panel.locator("time")).not.toHaveAttribute(
      "datetime",
      firstCheck ?? "",
    );
  });

  await test.step("with main shown, the watched story branch moving reads no judgment", async () => {
    const trunkPanel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(trunkPanel, "main");
    await expect(trunkPanel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
    await untilPageReadsAnswered(page);
    const tidied = "c0ffee2".padEnd(40, "0");
    ci.push(failing.branch, tidied, "Tidy the login");
    const before = calls.length;
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    // The moved branch's plan is read again at its new head; no judgment is.
    expect(
      calls
        .slice(before)
        .some(
          ({ request }) =>
            request.kind === "content" && request.revision === tidied,
        ),
    ).toBe(true);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([]);
  });
});
