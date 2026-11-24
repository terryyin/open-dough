import type { Page } from "@playwright/test";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { trunkAdvancedWith } from "../../dashboard/test-support/originatingMachine.ts";
import { publishedSessionEntry } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import { followUpComposer } from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import { storyNameOf } from "../../dashboard/test-support/support/followUpStories.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/test-support/support/startOrigin.ts";
import { publishStorySession } from "../../dashboard/test-support/support/storySessionPublication.ts";
import { publishDeclaredTrunk } from "../../dashboard/test-support/support/storyCiComparisonBaseline.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { defaultBacklogPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";

const story = { identity: queuedIdentity, title: "Story A" };
const file = "[literal]*.txt";
const changed = `Modified ${file}`;
const oldLine = "Removed by the second range";

async function openSecondPublishedRange(page: Page, origin: StartOrigin) {
  await publishDeclaredTrunk(origin, intentTrunkCompletionOntoTip());
  trunkAdvancedWith(origin, file, `${oldLine}\nkept by both sides\n`);
  const published = publishStorySession(
    origin,
    story.identity,
    "first-range.txt",
    "other-writer.txt",
    file,
    "kept by both sides\n",
  );
  const tip = trunkAdvancedWith(origin, "after-publication.txt");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: tip,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/");
  const review = await openReviewChanges(
    page,
    publishedSessionEntry(parts(page).recentlyDone, published.record.sessionId),
  );
  await review.comparison.choosePublishedRange("Published range 2 of 2");
  await review.files.chooseShown(changed);
  await review.diffs.expectChangedLines(changed, {
    removed: [`-${oldLine}`],
    added: [],
  });
  return { review, ...published };
}

test("a second machine follows up on the exact published file and old line", async ({
  page,
  origin,
  dashboard,
}) => {
  const { review, record, first, second } =
    await test.step("Given the second range of a story session published by another machine", () => {
      dashboard.claudeScenario("launched");
      return openSecondPublishedRange(page, origin);
    });
  const storyName = storyNameOf(story);
  const pair = `${second.base} → ${second.candidate}`;
  const comparison = `Published session ${record.sessionId} ${pair}`;
  const context = [
    `Path: ${file}`,
    `Comparison: ${comparison}`,
    "Line: 1",
    "Side: old",
  ];
  const lineComposer =
    await test.step("When I open Follow up on the removed line", async () => {
      const dialog = await review.followUpFromLine(
        changed,
        "old",
        1,
        storyName,
        context,
      );
      return followUpComposer(dialog);
    });
  await test.step("And I attach its session and start", async () => {
    await lineComposer
      .session(`Published session ${record.sessionId}`)
      .toggleSelectionByKeyboard();
    await lineComposer.start("Review the removed line");
  });
  const attachedInput =
    await test.step("Then Claude receives one line follow-up", async () => {
      await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(1);
      return dashboard.claudeLaunches()[0]?.instruction ?? "";
    });
  await test.step("And its required request names the source session, file and old line", () => {
    expect(attachedInput).toContain(`<story>\n${storyName}\n`);
    expect(attachedInput).toContain(`<follow-up>
- Path: ${file}
- Comparison: ${comparison}
- Line: 1
- Side: old
Request:
Review the removed line
</follow-up>`);
  });
  await test.step("And the separate session attachment shows both pairs", () => {
    expect(attachedInput).toContain(
      `<session>\nPublished session\n- Published session: ${record.sessionId}\n- Workflow: ad-hoc\n- Recorded range 1: ${first.base} → ${first.candidate}\n- Recorded range 2: ${pair}\n</session>`,
    );
  });
});

test("a stale line Follow up explains the unavailable source and returns to the reviewed file", async ({
  page,
  origin,
  dashboard,
}) => {
  const { review, record, second } =
    await test.step("Given a published range showing a removed line", () =>
      openSecondPublishedRange(page, origin));
  const dialog =
    await test.step("When I open Follow up on the removed line", () =>
      review.followUpFromLine(changed, "old", 1, storyNameOf(story), [
        `Comparison: Published session ${record.sessionId} ${second.base} → ${second.candidate}`,
      ]));
  await test.step("And the publication becomes unreadable on the project's Git tip", () => {
    trunkAdvancedWith(
      origin,
      sessionRecordPathBeside(defaultBacklogPath, record.sessionId),
      "unreadable record\n",
    );
    git(origin.project, "fetch", "--quiet", "origin", "main");
  });
  await test.step("When I start the follow-up", () =>
    followUpComposer(dialog).start("Review the old line"));
  await test.step("Then I return to the reviewed file with the refusal reason", async () => {
    await expect(dialog).toBeHidden();
    await review.diffs.expectText("This project published no such session.");
    await review.diffs.expectChangedLines(changed, {
      removed: [`-${oldLine}`],
      added: [],
    });
  });
  await test.step("And Claude did not start", () => {
    expect(dashboard.claudeLaunches()).toEqual([]);
  });
});
