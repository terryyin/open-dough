import { showLatestRevision } from "../intentReadRecoveryPage.ts";
import {
  expectCiScope,
  expectCiAnswer,
  chooseCiStatus,
  ciPanel,
  expectChecked,
} from "../intentCiStatusPage.ts";

// Project Intent visits keep the selected story and trunk CI followed
// (../../src/IntentPerspective.tsx). Switching scopes reuses each reading;
// an observed hidden trunk or story head refreshes only its own judgment.
// Reading-place restoration: ./intent-project-visit.spec.ts.

import { makeMe } from "../../../tests/support/makeMe.mjs";

import { pausePageClockAt } from "../dashboardTest.ts";
import { passTimeUntilCheckedAfterSettled } from "../autoRefreshJourney.ts";
import { failing } from "../intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  failedRun,
  mainRun,
  revision,
  publishStoryCi,
  toggleOnDevelopment,
} from "../intentCiStoryRecords.ts";
import { openUntilRead, untilPageReadsAnswered } from "../pageRequestNotes.ts";
import { openProjectIntent, returnToStory } from "../intentModePage.ts";
import { browserRevision, revisionNotice } from "../intentPerspectivePage.ts";
import { shortRevision } from "../dashboardParts.ts";
import { parts } from "../dashboardPage.ts";
import { expect, test } from "../support/preparationPage.ts";

test("a Project Intent visit reuses both CI readings, while hidden trunk and story heads each refresh only their own judgment", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date());
  const ci = publishStoryCi(page);
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const trunk = await chooseCiStatus(intent);
  await expectCiScope(trunk, "main");
  await expectChecked(trunk);
  await expect(browserRevision(intent)).toContainText(shortRevision(revision));
  const story = await toggleOnDevelopment(page, failing.title);
  await expectCiScope(story, failing.branch);
  await expectChecked(story);
  await openProjectIntent(intent);
  await expectCiScope(ciPanel(intent), "main");
  await expectChecked(ciPanel(intent));
  await returnToStory(intent);
  await untilPageReadsAnswered(page);

  await test.step("visiting Project Intent and returning asks CI nothing new", async () => {
    const before = calls.length;
    await openProjectIntent(intent);
    await expectCiScope(ciPanel(intent), "main");
    await returnToStory(intent);
    await expectCiScope(ciPanel(intent), failing.branch);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([]);
  });

  await test.step("a trunk advance while the story shows reads exactly the trunk judgment", async () => {
    const nextTrunk = "c0ffee3".padEnd(40, "0");
    ci.runs["main"] = [
      makeMe.aCiRun
        .with({ headSha: nextTrunk, conclusion: "success", url: mainRun })
        .please(),
    ];
    const before = calls.length;
    ci.push("main", nextTrunk, "Advance the trunk");
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      "actions-runs main",
      "actions-workflow",
      "commit-list main",
    ]);
    await expectCiScope(ciPanel(intent), failing.branch);
    await openProjectIntent(intent);
    await expectCiAnswer(
      ciPanel(intent),
      "Passed at c0ffee3 (Advance the trunk)",
    );
    await expect(browserRevision(intent)).toContainText(
      shortRevision(revision),
    );
    await expect(revisionNotice(intent)).toContainText(
      "New revision available",
    );
    await returnToStory(intent);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toHaveLength(3);
  });

  await test.step("a story push during a Project Intent visit reads exactly the story judgment", async () => {
    await openProjectIntent(intent);
    await untilPageReadsAnswered(page);
    const nextStory = "c0ffee4".padEnd(40, "0");
    ci.runs[failing.branch] = [
      makeMe.aCiRun
        .with({ headSha: nextStory, conclusion: "success", url: failedRun })
        .please(),
    ];
    const before = calls.length;
    ci.push(failing.branch, nextStory, "Fix the story during a visit");
    await passTimeUntilCheckedAfterSettled(page);
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      "actions-runs codex/example-story",
      "actions-runs main",
      "actions-workflow",
      "commit-list codex/example-story",
    ]);
    await expectCiScope(ciPanel(intent), "main");
    await returnToStory(intent);
    await expectCiAnswer(
      ciPanel(intent),
      "Passed at c0ffee4 (Fix the story during a visit)",
    );
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toHaveLength(4);
  });
  await openProjectIntent(intent);
  await showLatestRevision(revisionNotice(intent)).click();
  await expect(browserRevision(intent)).toContainText("c0ffee3");
  await expectCiAnswer(
    ciPanel(intent),
    "Passed at c0ffee3 (Advance the trunk)",
  );
});
