// Follow up from a Done story's Intent → Changes: old line 85's menu starts a
// blank follow-up whose terminal opens and whose first input names that line;
// the whole comparison and a file's header each send their reviewed target.
// Composer choices: ../../dashboard/frontend-tests/launches/follow-up-session-choices.spec.ts
// and follow-up-note-handoff.spec.ts. First-input framing and refusals:
// ../../dashboard/backend-tests/launches/agent-launch-follow-up-*.spec.ts.
// Review changes journey: ../review/story-review-follow-up.spec.ts.
// Line menu interaction: ../review/story-review-diff-line-follow-up.spec.ts.

import { expandIntentGroup } from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  completedChanges as changed,
  selectCompletedStoryInIntent,
} from "../../dashboard/test-support/support/intentCompletedStory.ts";
import {
  chooseStoryTab,
  intentFile,
  intentDiffReading,
  intentStory,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import {
  followUpComposer,
  startSessionField,
} from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import { followUpFromLine } from "../../dashboard/test-support/support/diffLineFollowUpPage.ts";
import { publishedReviewOf } from "../../dashboard/test-support/support/followUpCompletedFile.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import {
  commitAll,
  git,
  lines,
  writeAt,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { push } from "../../dashboard/test-support/support/storyReviewTrunkCommits.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";
import { sidePanelContents } from "../../dashboard/test-support/support/sidePanelContents.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";

const storyName = `${queuedIdentity} — Story A`;
const landing = "Added dashboard/src/landing.ts";
const assertion = "await intent.expectLatestTests();";
// Old line 85 is the removed assertion; the story drops it and keeps the tails.
const trunkSpec = `${lines("a", 84)}${assertion}\n${lines("tail", 5)}`;
const storySpec = `${lines("a", 84)}${lines("tail", 5)}`;

test("Intent Changes old line 85 Follow up starts blank and opens the terminal with that line in the first input", async ({
  page,
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("launched");
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    beforeStory: (project) => {
      writeAt(project, "dashboard/tests/a.spec.ts", trunkSpec);
      commitAll(project, "assertion at old line 85");
      push(project);
    },
    implementation: {
      message: "remove the assertion at line 85",
      files: {
        "dashboard/tests/a.spec.ts": storySpec,
      },
    },
  });
  await chooseStoryTab(intent, "Changes");
  await expandIntentGroup(intent, "dashboard/tests");
  await intentFile(intent, changed.modified).click();
  const reading = intentDiffReading(intent);
  await expect(reading.name).toHaveText(changed.modified);
  await expect(
    reading.container.getByRole("button", {
      name: "Old line 85",
      exact: true,
    }),
  ).toBeVisible();

  const dialog = await followUpFromLine(
    page,
    reading.container,
    "old",
    85,
    storyName,
    [
      "Path: dashboard/tests/a.spec.ts",
      /Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
      "Line: 85",
      "Side: old",
    ],
  );
  await expect(startSessionField(dialog)).toHaveValue("");
  await followUpComposer(dialog).start();
  await expect(dialog).toBeHidden();
  // The context is not typed text: the terminal opens with the keyboard.
  await expect(terminalScreenParts(terminalPanel(page)).input).toBeFocused({
    timeout: launchWaitMs,
  });
  await expect(sidePanelContents(page)).toHaveAccessibleName("Terminal");
  const [started, ...others] = dashboard.claudeLaunches();
  expect(others).toEqual([]);
  const firstInput = started?.instruction ?? "";
  expect(firstInput).toContain(`<story>\n${storyName}\n`);
  expect(firstInput).toMatch(
    /<\/story>\n\n<follow-up>\n- Path: dashboard\/tests\/a\.spec\.ts\n- Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}\n- Line: 85\n- Side: old\nRequest: No request text was given\.\n<\/follow-up>/,
  );
});

test("Intent Follow up sends the reviewed whole comparison or one file as its required target", async ({
  page,
  dashboard,
  origin,
}) => {
  const { review, completion } =
    await test.step("Given a completed story in Intent", async () => {
      dashboard.claudeScenario("launched");
      const { intent, completion } = await selectCompletedStoryInIntent(
        page,
        origin,
        {
          implementation: {
            message: "add the landing code",
            files: {
              "dashboard/src/landing.ts": "export const landing = 1;\n",
            },
          },
        },
      );
      return { review: intentStory(intent), completion };
    });
  const { baseline, tree } =
    await test.step("Given the published comparison and its Git tree", async () => {
      const { baseline } = await publishedReviewOf(dashboard, completion);
      return {
        baseline,
        tree: git(origin.project, "rev-parse", `${completion}^{tree}`),
      };
    });
  await test.step("When I open Changes", () => review.chooseTab("Changes"));
  await test.step("Then the review shows the published baseline", () =>
    expect(review.header.publishedBaseline).toHaveText(baseline));
  await test.step("When I follow up on the whole comparison", async () => {
    const composer = await review.followUpComparison();
    await composer.start("Review the whole comparison");
  });
  const whole =
    await test.step("Then Claude receives one follow-up", async () => {
      await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(1);
      return dashboard.claudeLaunches()[0]?.instruction ?? "";
    });
  await test.step("And its required request names the exact story and whole pair", () => {
    expect(whole).toContain(`<story>\n${storyName}\n`);
    expect(whole).toContain(`<follow-up>
- Comparison: Published completion ${baseline} → ${tree}
Request:
Review the whole comparison
</follow-up>`);
  });
  await test.step("And it carries no optional attachments", () => {
    expect(whole).not.toContain("<session>");
    expect(whole).not.toContain("<line-notes>");
  });
  await test.step("When I follow up on a file outside every Intent location", async () => {
    await review.outsideDiff(landing);
    const composer = await review.followUpFile(storyName);
    await composer.start("Review the new export");
  });
  await test.step("Then Claude receives a file follow-up naming that path in the same comparison", async () => {
    await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(2);
    expect(dashboard.claudeLaunches()[1]?.instruction).toMatch(
      /<\/story>\n\n<follow-up>\n- Path: dashboard\/src\/landing\.ts\n- Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}\nRequest:\nReview the new export\n<\/follow-up>/,
    );
  });
});
