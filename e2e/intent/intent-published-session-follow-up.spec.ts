import type { Page } from "@playwright/test";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import { selectCompletedStoryInIntent } from "../../dashboard/test-support/support/intentCompletedStory.ts";
import { intentStory } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { openFileFollowUp } from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import { storyNameOf } from "../../dashboard/test-support/support/followUpStories.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/test-support/support/startOrigin.ts";
import {
  publishStorySession,
  retainedStorySession,
} from "../../dashboard/test-support/support/storySessionPublication.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";

const story = { identity: queuedIdentity, title: "Story A" };
const comparisonPath = "dashboard/src/landing.ts";
const instruction = "Check the other machine's changes";

async function publishedStoryWithSessionChoices(
  page: Page,
  origin: StartOrigin,
  dashboard: DashboardServer,
) {
  const otherMachine = publishStorySession(
    origin,
    story.identity,
    "first.txt",
    "intervening.txt",
    "second.txt",
  );
  const foreign = publishStorySession(
    origin,
    "SEED-880#other-story",
    "foreign-one.txt",
    "foreign-between.txt",
    "foreign-two.txt",
  );
  const matched = publishStorySession(
    origin,
    story.identity,
    "matched-one.txt",
    "matched-between.txt",
    "matched-two.txt",
  );
  const retained = {
    sessionId: "retained-published",
    reference: matched.record.sessionId,
    instruction: "Implementation request kept here",
    report: "Implementation report kept here",
  };
  keepLaunchRecords(dashboard, [retainedStorySession(story, retained)]);
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  dashboard.claudeScenario("launched");
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    implementation: {
      message: "add the landing code",
      files: { [comparisonPath]: "export const landing = 1;\n" },
    },
  });
  return { intent, otherMachine, foreign, matched, retained };
}

test("Intent can attach both published ranges of a story session from another machine", async ({
  page,
  origin,
  dashboard,
}) => {
  const { intent, otherMachine, foreign, matched, retained } =
    await test.step("Given a published story with separate-machine, matched, and foreign sessions", () =>
      publishedStoryWithSessionChoices(page, origin, dashboard));
  await test.step("When I open the story's changed file", async () => {
    const review = intentStory(intent);
    await review.chooseTab("Changes");
    await review.outsideFile(`Added ${comparisonPath}`).click();
  });
  const composer = await test.step("And I follow up from that file", () =>
    openFileFollowUp(page, intent, storyNameOf(story)));
  await test.step("Then there is one attachment choice per story session", () =>
    composer.expectSessionChoices(2));
  const { merged, session } =
    await test.step("And both choices start unchecked and collapsed", async () => {
      const choices = {
        merged: composer.session(
          `${story.title} · Claude Code · ${retained.sessionId}`,
        ),
        session: composer.session(
          `Published session ${otherMachine.record.sessionId}`,
        ),
      };
      for (const choice of Object.values(choices))
        await choice.expectChoiceState({ checked: false, detailsOpen: false });
      return choices;
    });
  await test.step("When I open the matching session's details by keyboard", () =>
    merged.toggleDetailsByKeyboard());
  await test.step("Then I can read its UUID and retained request and report", () =>
    merged.expectDetails(
      matched.record.sessionId,
      retained.instruction,
      retained.report,
    ));
  await test.step("When I close the matching session's details", () =>
    merged.toggleDetailsByKeyboard());
  await test.step("And I open the other machine's session details", () =>
    session.toggleDetailsByKeyboard());
  const pairs =
    await test.step("Then I can read its UUID and both published ranges", async () => {
      const pairs = [
        `${otherMachine.first.base} → ${otherMachine.first.candidate}`,
        `${otherMachine.second.base} → ${otherMachine.second.candidate}`,
      ] as const;
      await session.expectDetails(otherMachine.record.sessionId, ...pairs);
      return pairs;
    });
  await test.step("When I attach the other machine's session", () =>
    session.toggleSelectionByKeyboard());
  await test.step("And I start with the session attached", () =>
    composer.start(instruction));

  const received =
    await test.step("Then Claude receives new first input", async () => {
      await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(1);
      return dashboard.claudeLaunches()[0]?.instruction ?? "";
    });
  await test.step("And the first input carries the story and file request", () => {
    expect(received).toContain(`<story>\n${storyNameOf(story)}\n`);
    expect(received).toContain(`- Path: ${comparisonPath}`);
    expect(received).toContain(`Request:\n${instruction}\n</follow-up>`);
  });
  await test.step("And one session section carries both exact selected ranges", () => {
    expect(received.match(/^<session>$/gm)).toEqual(["<session>"]);
    expect(received).toContain(
      `- Published session: ${otherMachine.record.sessionId}\n- Workflow: ad-hoc\n- Recorded range 1: ${pairs[0]}\n- Recorded range 2: ${pairs[1]}\n</session>`,
    );
  });
  await test.step("And other sessions contribute no context", () => {
    expect(received).not.toContain(foreign.record.sessionId);
    expect(received).not.toContain(matched.record.sessionId);
    expect(received).not.toContain(retained.instruction);
  });
});
