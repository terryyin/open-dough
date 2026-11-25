import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import {
  expectCiScope,
  ciStatusReading,
  ciPanel,
  expectCiAnswer,
  chooseCiStatus,
  expectChecked,
} from "../../dashboard/test-support/intentCiStatusPage.ts";

import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";

import {
  failing,
  planningOnly,
  running,
} from "../../dashboard/test-support/intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  failedRun,
  freshCiStatusReadSettled,
  mainRun,
  publishStoryCi,
  repository,
  runningRun,
  toggleOnDevelopment,
} from "../../dashboard/test-support/intentCiStoryRecords.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  storyTitle,
  storySummary,
} from "../../dashboard/test-support/support/intentStoryPage.ts";

test("CI status judges the selected story's branch, counts trunk runs of shared commits, replaces the judgment on a new selection, and returns to main when cleared", async ({
  page,
  afterGitHubStops,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const ci = await publishStoryCi(page, afterGitHubStops);
  const { login, signup, broken, started } = ci.revisions;
  const mainPassed = `Passed at ${shortSha(login)} (Add login)`;
  const storyFailed = `Failed at ${shortSha(broken)} (Break the login)`;
  const storyRunning = `Running at ${shortSha(started)} (Start the story)`;
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const trunkPanel = await chooseCiStatus(intent);
  await expectCiScope(trunkPanel, "main");
  await expectCiAnswer(trunkPanel, mainPassed);

  await test.step("a Taken Story Branch Mode story: CI comparison names its branch, Failed with its run while main passes", async () => {
    const before = calls.length;
    const panel = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(panel, failing.branch);
    await expect(panel.locator(".intent-ci-story")).toHaveText("Story branch.");
    await expect(panel).not.toContainText(failing.title);
    await expect(storyTitle(intent)).toHaveText(failing.title);
    await expect(intent.getByText(failing.title, { exact: true })).toHaveCount(
      1,
    );
    await expectCiAnswer(panel, storyFailed);
    // The selected story's persistent header stays above its CI comparison tab.
    await expect(storySummary(intent)).toBeVisible();
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
    await expectCiScope(panel, planningOnly.branch);
    await expectCiAnswer(panel, `${mainPassed}, run on main`);
    await expect(panel).toContainText(
      "2 later commits have no result of their own.",
    );
    await expect(panel.getByRole("link", { name: mainRun })).toBeVisible();
    await expect(panel).not.toContainText(shortSha(broken));
    await expect(panel).not.toContainText(failing.branch);
  });

  await test.step("a selection whose answer arrives after the next selection never shows it", async () => {
    // Back to the failing story (kept answer shows at once), held fresh read,
    // then straight on to the running one; the late failing answer never
    // appears under the running branch.
    const late = ci.hold(failing.branch);
    const lateRead = freshCiStatusReadSettled(page, failing.branch);
    let panel = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(panel, failing.branch);
    await expectCiAnswer(panel, storyFailed);
    await expect(ciStatusReading(panel).freshness).toContainText(
      "Previously retrieved",
    );
    await expect(ciStatusReading(panel).checking).toContainText(
      `Checking the CI of ${failing.branch}…`,
    );
    panel = await toggleOnDevelopment(page, running.title);
    await expectCiScope(panel, running.branch);
    await expectCiAnswer(panel, storyRunning);
    late.release();
    await expect.poll(late.served).toBe(true);
    await lateRead;
    await untilPageReadsAnswered(page);
    await expectCiScope(panel, running.branch);
    await expect(panel).not.toContainText("Failed");
    await expect(panel).not.toContainText(failing.branch);
  });

  await test.step("a running head shows its nearest completed ancestor, on main; Check again after it finishes shows Passed", async () => {
    const panel = ciPanel(intent);
    await expectCiAnswer(panel, storyRunning);
    await expect(panel.getByRole("link", { name: runningRun })).toBeVisible();
    await expect(panel).toContainText(
      `Nearest completed ancestor: ${shortSha(signup)} (Add signup) — passed. Run on main.`,
    );
    // The ancestor's own run link.
    await expect(panel.getByRole("link", { name: mainRun })).toBeVisible();
    ci.runs[running.branch] = [
      makeMe.aCiRun
        .with({ headSha: started, conclusion: "success", url: runningRun })
        .please(),
    ];
    await panel.getByRole("button", { name: "Check again" }).click();
    await expectCiAnswer(
      panel,
      `Passed at ${shortSha(started)} (Start the story)`,
    );
    await expect(panel).not.toContainText("Nearest completed ancestor");
  });

  await test.step("clearing the selection shows main again", async () => {
    const panel = await toggleOnDevelopment(page, running.title);
    await expectCiScope(panel, "main");
    await expect(panel.locator(".intent-ci-story")).toHaveCount(0);
    await expectCiAnswer(panel, mainPassed);
    await expect(panel).toContainText(
      "One later commit has no result of its own.",
    );
    // No story comparison → no count/duration cue attributes.
    await expect(panel.locator("[data-ci-count-cue]")).toHaveCount(0);
    await expect(panel.locator("[data-ci-duration-cue]")).toHaveCount(0);
  });
});

test("a push to the shown story branch, seen by the revision check, reads its judgment again without Check again; time alone and a branch not shown moving read none", async ({
  page,
  afterGitHubStops,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date());
  const ci = await publishStoryCi(page, afterGitHubStops);
  const { login, broken, fixed, tidied } = ci.revisions;
  const expectStoryHead = (head: string) => {
    expectServedHomesReach(githubFor(page), repository, head, failing.branch);
  };
  expectStoryHead(broken);
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  const panel = await toggleOnDevelopment(page, failing.title);
  await expectCiScope(panel, failing.branch);
  await expectCiAnswer(
    panel,
    `Failed at ${shortSha(broken)} (Break the login)`,
  );
  await expectChecked(panel);
  const firstCheck =
    await ciStatusReading(panel).checkedTime.getAttribute("datetime");

  await test.step("time passing with nothing moved reads no judgment", async () => {
    await untilPageReadsAnswered(page);
    const before = calls.length;
    await passTimeUntilChecked(page);
    await passTimeUntilChecked(page);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([]);
    await expect(ciStatusReading(panel).checkedTime).toHaveAttribute(
      "datetime",
      firstCheck ?? "",
    );
  });

  await test.step("a push to the shown branch reads its judgment once more, by itself", async () => {
    ci.runs[failing.branch] = [
      makeMe.aCiRun
        .with({ headSha: fixed, conclusion: "success", url: failedRun })
        .please(),
    ];
    ci.push(failing.branch, "fixed");
    expectStoryHead(fixed);
    const before = calls.length;
    await passTimeUntilChecked(page);
    await expectCiAnswer(panel, `Passed at ${shortSha(fixed)} (Fix the login)`);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      "actions-runs codex/example-story",
      "actions-runs main",
      "actions-workflow",
      "commit-list codex/example-story",
    ]);
    await expect(ciStatusReading(panel).checkedTime).not.toHaveAttribute(
      "datetime",
      firstCheck ?? "",
    );
  });

  await test.step("with main shown, the watched story branch moving reads no judgment", async () => {
    const trunkPanel = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(trunkPanel, "main");
    await expectCiAnswer(
      trunkPanel,
      `Passed at ${shortSha(login)} (Add login)`,
    );
    await untilPageReadsAnswered(page);
    ci.push(failing.branch, "tidied");
    expectStoryHead(tidied);
    const before = calls.length;
    await passTimeUntilChecked(page);
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
