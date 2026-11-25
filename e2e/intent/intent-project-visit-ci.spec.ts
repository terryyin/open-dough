import type { Page } from "@playwright/test";
import { showLatestRevision } from "../../dashboard/test-support/intentReadRecoveryPage.ts";
import {
  expectCiScope,
  expectCiAnswer,
  chooseCiStatus,
  ciPanel,
  expectChecked,
} from "../../dashboard/test-support/intentCiStatusPage.ts";

// Whole project and recent story choices show each scope's own CI judgment.
// An observed head refreshes the indicated branch while the project browser
// stays pinned until the developer reads the latest revision.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

import { pausePageClockAt } from "../../dashboard/test-support/dashboardTest.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { failing } from "../../dashboard/test-support/intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  failedRun,
  freshCiStatusReadSettled,
  mainRun,
  revision,
  publishStoryCi,
  toggleOnDevelopment,
  type StoryCi,
} from "../../dashboard/test-support/intentCiStoryRecords.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  chooseStoryTab,
  expectStoryTab,
} from "../../dashboard/test-support/intentModePage.ts";
import {
  chooseRecentStory,
  chooseWholeProject,
} from "../../dashboard/test-support/recentStoriesPage.ts";
import {
  browserRevision,
  revisionNotice,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import { shortRevision } from "../../dashboard/test-support/dashboardParts.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { holdNextRevisionCheckBody } from "../../dashboard/test-support/support/heldRevisionCheckBody.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";

const recentStory = {
  project: "Open Dough",
  identity: `SEED-219#${failing.anchor}`,
};

async function withHeldRevision(
  page: Page,
  observe: (settled: () => boolean) => Promise<void>,
) {
  const held = await holdNextRevisionCheckBody(page);
  let checkSettled = false;
  const checked = passTimeUntilChecked(page).then(() => {
    checkSettled = true;
  });
  try {
    await held.headersReceived;
    await observe(() => checkSettled);
  } finally {
    held.release();
    try {
      await checked;
    } finally {
      await held.close();
    }
  }
}

function publishPassingHead(
  ci: StoryCi,
  branch: string,
  sha: string,
  url: string,
  message: string,
) {
  const headSha = sha.padEnd(40, "0");
  const { runs } = ci;
  runs[branch] = [
    makeMe.aCiRun.with({ headSha, conclusion: "success", url }).please(),
  ];
  ci.push(branch, headSha, message);
}

test("the bookmark reads trunk and story judgments independently while observations follow their heads", async ({
  page,
}) => {
  const ci =
    await test.step("Given the project publishes tracked trunk and story heads", async () => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await pausePageClockAt(page, new Date());
      return publishStoryCi(page);
    });
  const { intent, calls } =
    await test.step("And I read project CI on the published revision", async () => {
      await openUntilRead(page, "/?project=open-dough&perspective=intent");
      const { intent } = parts(page);
      return { intent, calls: ci.published.requests };
    });
  await test.step("Then the project CI view judges the pinned trunk", async () => {
    const trunk = await chooseCiStatus(intent);
    await expectCiScope(trunk, "main");
    await expectChecked(trunk);
  });
  await test.step("And the file browser names the published revision", () =>
    expect(browserRevision(intent)).toContainText(shortRevision(revision)));
  await test.step("When I select the story in Development and open Intent", async () => {
    const story = await toggleOnDevelopment(page, failing.title);
    await expectCiScope(story, failing.branch);
    await expectChecked(story);
  });
  await test.step("And I read Whole project using the bookmark", async () => {
    await chooseWholeProject(page);
    await expectCiScope(ciPanel(intent), "main");
    await expectChecked(ciPanel(intent));
  });
  const beforeTabs =
    await test.step("And I reselect the recent story", async () => {
      await chooseRecentStory(page, recentStory);
      await untilPageReadsAnswered(page);
      return calls.length;
    });
  await test.step("When I switch story views and return to CI comparison", async () => {
    await chooseStoryTab(intent, "Intent coverage");
    await chooseStoryTab(intent, "CI comparison");
    await untilPageReadsAnswered(page);
  });
  await test.step("Then the story view reuses its branch judgment", async () => {
    await expectCiScope(ciPanel(intent), failing.branch);
    expect(branchJudgmentCalls(calls.slice(beforeTabs))).toEqual([]);
  });

  const beforeTrunk =
    await test.step("When trunk advances while the story is shown", () => {
      const before = calls.length;
      publishPassingHead(ci, "main", "c0ffee3", mainRun, "Advance the trunk");
      return before;
    });
  await test.step("And the dashboard reads the new trunk judgment", async () => {
    const judged = freshCiStatusReadSettled(page);
    await passTimeUntilChecked(page);
    await judged;
  });
  await test.step("Then only trunk's judgment refreshes while the story still shows", async () => {
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(beforeTrunk))).toEqual([
      "actions-runs main",
      "actions-workflow",
      "commit-list main",
    ]);
    await expectCiScope(ciPanel(intent), failing.branch);
  });
  await test.step("When I choose Whole project to read its answer", () =>
    chooseWholeProject(page));
  await test.step("Then the trunk CI judgment advances while its file browser stays pinned", async () => {
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
  });
  await test.step("When I reselect the story from the bookmark", async () => {
    await chooseRecentStory(page, recentStory);
    await expectStoryTab(intent, "CI comparison");
    await untilPageReadsAnswered(page);
  });
  const beforeStory = await test.step("And the story head advances", () => {
    const before = calls.length;
    publishPassingHead(
      ci,
      failing.branch,
      "c0ffee4",
      failedRun,
      "Fix the story while reviewing",
    );
    return before;
  });
  const { judged } =
    await test.step("Then judgment waits for the full story head observation", async () => {
      const judged = freshCiStatusReadSettled(page, failing.branch);
      await withHeldRevision(page, async (settled) => {
        await untilPageReadsAnswered(page);
        expect(branchJudgmentCalls(calls.slice(beforeStory))).toEqual([]);
        expect(settled(), "the revision check body is still held").toBe(false);
      });
      return { judged };
    });
  await test.step("And the full observation yields the story branch judgment", async () => {
    await judged;
    await untilPageReadsAnswered(page);
    expect(branchJudgmentCalls(calls.slice(beforeStory))).toEqual([
      "actions-runs codex/example-story",
      "actions-runs main",
      "actions-workflow",
      "commit-list codex/example-story",
    ]);
  });
  await test.step("And the story CI panel reads the new head", async () => {
    await expectCiScope(ciPanel(intent), failing.branch);
    await expectCiAnswer(
      ciPanel(intent),
      "Passed at c0ffee4 (Fix the story while reviewing)",
    );
  });
  await test.step("When I choose Whole project and show its latest revision", async () => {
    await chooseWholeProject(page);
    await showLatestRevision(revisionNotice(intent)).click();
  });
  await test.step("Then the browser advances to the already judged trunk revision", async () => {
    await expect(browserRevision(intent)).toContainText("c0ffee3");
    await expectCiAnswer(
      ciPanel(intent),
      "Passed at c0ffee3 (Advance the trunk)",
    );
  });
});
