// Review session changes opens Intent while native final reports keep the
// Side panel.
import { expect } from "@playwright/test";
import { keyStep } from "../../dashboard/test-support/sidePanelWidthPage.ts";
import { finalReportParts } from "../../dashboard/test-support/finalReportPages.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
} from "../../dashboard/test-support/support/startOrigin.ts";
import {
  keptSession,
  storyBReport,
} from "../../dashboard/test-support/support/sidePanelContents.ts";
import { test } from "../../dashboard/test-support/support/sidePanelReplacement.ts";

test.use({ preparationHost: "codex" });

test("a session's changes in Intent and a final report in the one side panel", async ({
  dashboard,
  storiesAAndB: { reviewReads, journey, storyBSession, session },
}) => {
  await journey.phase(
    "the session's changes open in Intent",
    ({ board, sidePanel }) => {
      board
        .reviewPublishedSession(session)
        .expectSessionChosen("1 changed file");
      sidePanel.expectItems(0);
    },
  );

  await journey.phase(
    "a final report opens in the Side panel",
    ({ board, perspective }) => {
      perspective.choose("Development");
      board
        .storyCard("Story B")
        .readFinalReport()
        .expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  const width = await journey.shownWidth();
  await journey.phase(
    "the Panel divider resizes the Side panel with the mouse and the keyboard",
    ({ panelDivider, sidePanel }) => {
      panelDivider
        .drag(-100)
        .expectSidePanelWidth(width + 100)
        .press("ArrowRight")
        .expectSidePanelWidth(width + 100 - keyStep);
      sidePanel.finalReport.expectText(storyBReport);
    },
  );
  const readsBeforeReopening = reviewReads.length;
  await journey.phase(
    "a session's changes open in Intent beside the final report",
    ({ board, sidePanel }) => {
      board
        .reviewPublishedSession(session)
        .expectSessionChosen("1 changed file");
      sidePanel.finalReport.expectText(storyBReport).sidePanel.expectItems(1);
    },
  );
  // Reopening reads a fresh snapshot.
  expect(reviewReads.length).toBeGreaterThan(readsBeforeReopening);
  expect((await keptSession(dashboard, storyBSession)).doneAt).toBe(undefined);
});

test("a final report stays shown while the page changes to Intent and back", async ({
  page,
  dashboard,
  storiesAAndB: { journey, storyBSession },
}) => {
  await journey.phase(
    "the final report keeps its session's report on Intent",
    ({ board, perspective, intent }) => {
      board.storyCard("Story B").readFinalReport().expectText(storyBReport);
      perspective.choose("Intent");
      intent
        .expectSelectedStory(otherQueuedIdentity)
        .expectText("No Intent locations are configured for Open Dough.")
        .sidePanel.finalReport.expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  await page.goBack();
  await journey.phase(
    "browser Back keeps the same final report on the Board",
    ({ board, perspective }) => {
      perspective.expectChosen("Development");
      board
        .storyCard("Story B")
        .expectShown()
        .expectSelected()
        .sidePanel.finalReport.expectText(storyBReport)
        .sidePanel.expectItems(1);
    },
  );
  // Reading the report left its session not done.
  expect((await keptSession(dashboard, storyBSession)).doneAt).toBe(undefined);
});

test("a Story card opens Intent beside another story's final report", async ({
  page,
  storiesAAndB: { journey },
}) => {
  const report =
    await test.step("Given Story B's final report is open", async () => {
      await journey.phase("Read Story B's report", ({ board }) =>
        board.storyCard("Story B").readFinalReport().expectText(storyBReport),
      );
      return finalReportParts(page).reportBody.elementHandle();
    });
  await test.step("When I review changes on Story A's card by keyboard", () =>
    journey.phase("Open Story A's Changes", ({ board }) =>
      board.storyCard("Story A").openChanges("keyboard"),
    ));
  await test.step("Then the path reading has focus beside the same report", () =>
    journey.phase("Story A is selected in Intent", ({ intent, sidePanel }) => {
      intent.expectSelectedStory(queuedIdentity).expectFocusedPathReading();
      sidePanel.finalReport.expectText(storyBReport).sidePanel.expectItems(1);
    }));
  await test.step("When I return to Development", () =>
    journey.phase("Choose Development", ({ perspective }) =>
      perspective.choose("Development"),
    ));
  await test.step("Then Story A remains selected and the original report stays mounted", async () => {
    await journey.phase(
      "Development shows both stories' content",
      ({ board, sidePanel }) => {
        board.storyCard("Story A").expectSelected();
        sidePanel.finalReport.expectText(storyBReport).sidePanel.expectItems(1);
      },
    );
    expect(await report.evaluate((body) => body.isConnected)).toBe(true);
  });
});
