import type { Page } from "@playwright/test";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { attachStoryNotes } from "../../dashboard/test-support/support/attachStoryNotesPage.ts";
import type { DashboardServer } from "../../dashboard/test-support/support/dashboardServer.ts";
import { followUpFromLine } from "../../dashboard/test-support/support/diffLineFollowUpPage.ts";
import { followUpComposer } from "../../dashboard/test-support/support/fileFollowUpPage.ts";
import {
  quietStorySessions,
  storyNameOf,
} from "../../dashboard/test-support/support/followUpStories.ts";
import { selectCompletedStoryInIntent } from "../../dashboard/test-support/support/intentCompletedStory.ts";
import { intentStory } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/test-support/support/startOrigin.ts";
import { seedStoryNotes } from "../../dashboard/test-support/support/storyNotesStore.ts";

const story = { identity: queuedIdentity, title: "Story A" };
const requestPath = "dashboard/src/landing.ts";
const oldComparison = {
  name: "Published completion",
  baseline: "a".repeat(40),
  tree: "b".repeat(40),
};
const otherComparison = {
  name: "Landed run",
  baseline: "c".repeat(40),
  tree: "d".repeat(40),
};
const oldLine = makeMe.aStoryNote
  .identifiedAs("34810000-0000-4000-8000-000000000301")
  .withText("Keep the earlier clipboard guard.")
  .withContext({
    view: "Intent → Changes",
    path: requestPath,
    comparison: oldComparison,
    line: { number: 8, side: "old", text: "oldClipboardGuard();" },
  })
  .please();
const otherFile = makeMe.aStoryNote
  .identifiedAs("34810000-0000-4000-8000-000000000302")
  .withText("Also check the branch handoff.")
  .withContext({
    view: "Review changes",
    path: "dashboard/src/branch.ts",
    comparison: otherComparison,
    line: { number: 12, side: "new", text: "handoff();" },
  })
  .please();
const refinement = {
  instruction: "Trace the note anchors",
  report: "Checked the old view",
};
const execution = {
  instruction: "Try a different change",
  report: "Checked the new view",
};
const unselectedSessionText = [execution.instruction, execution.report];
const instruction = "Review this new line";

async function publishedStoryWithWaitingNotes(
  page: Page,
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  keepLaunchRecords(
    dashboard,
    quietStorySessions(dashboard.home, story, new Date(), {
      refinement,
      execution,
    }),
  );
  seedStoryNotes(dashboard.home, { [story.identity]: [oldLine, otherFile] });
  dashboard.claudeScenario("launched");
  const { intent } = await selectCompletedStoryInIntent(page, origin, {
    implementation: {
      message: "add the landing code",
      files: { [requestPath]: "export const landing = 1;\n" },
    },
  });
  return intentStory(intent);
}

async function openNewLineFollowUp(
  page: Page,
  review: ReturnType<typeof intentStory>,
) {
  await review.chooseTab("Changes");
  await review.outsideFile(`Added ${requestPath}`).click();
  const dialog = await followUpFromLine(
    page,
    review.diffReading.container,
    "new",
    1,
    storyNameOf(story),
    [
      `Path: ${requestPath}`,
      /Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}/,
      "Line: 1",
      "Side: new",
    ],
  );
  const composer = followUpComposer(dialog);
  return {
    composer,
    notes: attachStoryNotes(dialog),
    refined: composer.session(/-refined$/),
    executed: composer.session(/-executed$/),
  };
}

async function expectSessionChoicesClear({
  composer,
  refined,
  executed,
}: Awaited<ReturnType<typeof openNewLineFollowUp>>) {
  await composer.expectSessionChoices(2);
  await refined.expectSelection(false);
  await executed.expectSelection(false);
}

async function receivedInput(dashboard: DashboardServer) {
  await expect.poll(() => dashboard.claudeLaunches()).toHaveLength(1);
  return dashboard.claudeLaunches()[0]?.instruction ?? "";
}

function expectStoryAndNewLineRequest(input: string) {
  expect(input).toContain(`<story>\n${storyNameOf(story)}\n`);
  expect(input).toMatch(
    /<follow-up>\n- Path: dashboard\/src\/landing\.ts\n- Comparison: Published completion [a-f0-9]{40} → [a-f0-9]{40}\n- Line: 1\n- Side: new\nRequest:\nReview this new line\n<\/follow-up>/,
  );
}

const notesSection = [
  "<line-notes>",
  "Developer's story notes",
  `- Note: ${oldLine.text}`,
  "- Context:",
  "what the dashboard showed when the note was taken",
  "Intent → Changes",
  requestPath,
  `Published completion ${oldComparison.baseline} → ${oldComparison.tree}`,
  "Line 8 · old",
  "oldClipboardGuard();",
  `- Note: ${otherFile.text}`,
  "- Context:",
  "what the dashboard showed when the note was taken",
  "Review changes",
  "dashboard/src/branch.ts",
  `Landed run ${otherComparison.baseline} → ${otherComparison.tree}`,
  "Line 12 · new",
  "handoff();",
  "</line-notes>",
].join("\n");

test("Intent new-line Follow up sends only the required context with every choice clear", async ({
  page,
  dashboard,
  origin,
}) => {
  const review =
    await test.step("Given a published story with waiting notes", () =>
      publishedStoryWithWaitingNotes(page, dashboard, origin));
  const choice = await test.step("When I follow up from the new line", () =>
    openNewLineFollowUp(page, review));
  await test.step("Then the session choices start clear", () =>
    expectSessionChoicesClear(choice));
  await test.step("And the waiting notes start clear and collapsed", async () => {
    await choice.notes.expectChoice(false, 2, 2);
    await choice.notes.expectDetails(oldLine.text, false);
  });
  await test.step("When I start with every choice clear", () =>
    choice.composer.start(instruction));
  const input =
    await test.step("Then first input carries the story and request", async () => {
      const input = await receivedInput(dashboard);
      expectStoryAndNewLineRequest(input);
      return input;
    });
  await test.step("And the clear session choices contribute no context", () => {
    expect(input).not.toContain("<session>");
    expect(input).not.toContain(refinement.instruction);
    for (const text of unselectedSessionText) expect(input).not.toContain(text);
  });
  await test.step("And the clear notes choice contributes no context", () => {
    expect(input).not.toContain("<line-notes>");
    expect(input).not.toContain(oldLine.text);
    expect(input).not.toContain(otherFile.text);
  });
});

test("Intent new-line Follow up sends the selected session and notes with their own targets", async ({
  page,
  dashboard,
  origin,
}) => {
  const review =
    await test.step("Given a published story with waiting notes", () =>
      publishedStoryWithWaitingNotes(page, dashboard, origin));
  const choice = await test.step("When I follow up from the new line", () =>
    openNewLineFollowUp(page, review));
  await test.step("Then both session choices start clear", () =>
    expectSessionChoicesClear(choice));
  await test.step("And the note details start collapsed", () =>
    choice.notes.expectDetails(oldLine.text, false));
  await test.step("When I open the note details by keyboard", () =>
    choice.notes.toggleDetailsByKeyboard());
  await test.step("Then both notes appear and their choice stays clear", async () => {
    await choice.notes.expectDetails(oldLine.text, true);
    await choice.notes.expectDetails(otherFile.text, true);
    await choice.notes.expectChoice(false, 2, 2);
  });
  await test.step("When I attach the refinement, attach notes, and close details", async () => {
    await choice.refined.toggleSelectionByKeyboard();
    await choice.notes.select();
    await choice.notes.toggleDetailsByKeyboard();
  });
  await test.step("Then the note details collapse and both choices stay checked", async () => {
    await choice.notes.expectDetails(oldLine.text, false);
    await choice.notes.expectChoice(true, 2, 2);
    await choice.refined.expectSelection(true);
  });
  await test.step("When I start with the session and notes attached", () =>
    choice.composer.start(instruction));
  const input =
    await test.step("Then first input carries the story and request", async () => {
      const input = await receivedInput(dashboard);
      expectStoryAndNewLineRequest(input);
      return input;
    });
  await test.step("And the session section carries only the selected session's facts", () => {
    expect(input.match(/^<session>$/gm)).toEqual(["<session>"]);
    expect(input).toContain(refinement.instruction);
    expect(input).toContain(refinement.report);
  });
  await test.step("And the unselected session contributes no text", () => {
    for (const text of unselectedSessionText) expect(input).not.toContain(text);
  });
  await test.step("And both notes carry their own path, comparison, and line", () => {
    expect(input).toContain(notesSection);
  });
});
