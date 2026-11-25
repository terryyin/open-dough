import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { showLatestRevision } from "../../dashboard/test-support/intentReadRecoveryPage.ts";
import {
  expectCiScope,
  expectCiAnswer,
  chooseCiStatus,
  ciPanel,
  expectChecked,
} from "../../dashboard/test-support/intentCiStatusPage.ts";

// Project Intent visits keep the selected story and trunk CI followed
// (../../dashboard/src/IntentPerspective.tsx). Switching scopes reuses each reading;
// an observed hidden trunk or story head refreshes only its own judgment.
// Reading-place restoration: ../../dashboard/frontend-tests/intent/intent-project-visit.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { failing } from "../../dashboard/test-support/intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  failedRun,
  freshCiStatusReadSettled,
  mainRun,
  publishStoryCi,
  repository,
  toggleOnDevelopment,
} from "../../dashboard/test-support/intentCiStoryRecords.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  openProjectIntent,
  returnToStory,
} from "../../dashboard/test-support/intentModePage.ts";
import {
  browserRevision,
  revisionNotice,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { shortRevision } from "../../dashboard/test-support/dashboardParts.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { holdNextRevisionCheckBody } from "../../dashboard/test-support/support/heldRevisionCheckBody.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

test("a Project Intent visit reuses both CI readings, while hidden trunk and story heads each refresh only their own judgment", async ({
  page,
  afterGitHubStops,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await pausePageClockAt(page, new Date());
  const ci = await publishStoryCi(page, afterGitHubStops);
  const { trunkHead: revision, broken, nextTrunk, nextStory } = ci.revisions;
  const calls = ci.published.requests;
  const routedHead = (branch: string) =>
    remoteBranchHead(gitHubRepositoryUrl(repository), `refs/heads/${branch}`, {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  const expectHeads = async (trunk: string, story: string) => {
    expect(await routedHead("main")).toBe(trunk);
    expect(await routedHead(failing.branch)).toBe(story);
  };
  await expectHeads(revision, broken);
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
    ci.runs["main"] = [
      makeMe.aCiRun
        .with({ headSha: nextTrunk, conclusion: "success", url: mainRun })
        .please(),
    ];
    const before = calls.length;
    ci.push("main", "nextTrunk");
    await expectHeads(nextTrunk, broken);
    const trunkJudged = freshCiStatusReadSettled(page);
    await passTimeUntilChecked(page);
    await trunkJudged;
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
      `Passed at ${shortSha(nextTrunk)} (Advance the trunk)`,
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
    ci.runs[failing.branch] = [
      makeMe.aCiRun
        .with({ headSha: nextStory, conclusion: "success", url: failedRun })
        .please(),
    ];
    const before = calls.length;
    ci.push(failing.branch, "nextStory");
    await expectHeads(nextTrunk, nextStory);
    const held = await holdNextRevisionCheckBody(page);
    const storyJudged = freshCiStatusReadSettled(page, failing.branch);
    let checkSettled = false;
    const checked = passTimeUntilChecked(page).then(() => {
      checkSettled = true;
    });
    try {
      await held.headersReceived;
      await untilPageReadsAnswered(page);
      expect(branchJudgmentCalls(calls.slice(before))).toEqual([]);
      expect(checkSettled, "the revision check body is still held").toBe(false);
    } finally {
      held.release();
      try {
        await checked;
      } finally {
        await held.close();
      }
    }
    await storyJudged;
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
      `Passed at ${shortSha(nextStory)} (Fix the story during a visit)`,
    );
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(before))).toHaveLength(4);
  });
  await openProjectIntent(intent);
  await showLatestRevision(revisionNotice(intent)).click();
  await expect(browserRevision(intent)).toContainText(shortSha(nextTrunk));
  await expectCiAnswer(
    ciPanel(intent),
    `Passed at ${shortSha(nextTrunk)} (Advance the trunk)`,
  );
});
