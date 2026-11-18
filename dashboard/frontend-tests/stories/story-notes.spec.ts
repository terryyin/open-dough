// Real store persistence/refusals: ../../backend-tests/review/story-notes-*.spec.ts.
// The notes service cases run mounted: ./story-notes-*.mounted.spec.ts.
import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  openFrontendBoardReview,
  storyA,
} from "../../test-support/support/frontendRecentlyDoneBoardReview.ts";
import { storyNotesPage } from "../../test-support/support/storyNotesPage.ts";
import { parts } from "../../test-support/dashboardParts.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendTerminalSubstitute.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import {
  expectTerminalText,
  terminalPanel,
  terminalScreenParts,
} from "../../test-support/terminalScreenPage.ts";

const reviewedStoryCard = (page: Page) =>
  parts(page).recentlyDone.getByRole("article", {
    name: storyA.title,
    exact: true,
  });

test("Story notes leaves an attached terminal mounted and connected", async ({
  page,
  frontendServices,
}) => {
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "Terminal kept during notes" })
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observingOpen(record).please(),
  );
  let attachments = 0;
  let print: (output: string) => void = () => {
    throw new Error("No terminal attachment.");
  };
  await installAttachedTerminalSubstitute(page, {
    application: {
      opening: "Terminal before notes\r\n",
      answer: (input) => input,
      attached: (attachment) => {
        attachments += 1;
        print = (output) => {
          attachment.print(output);
        };
      },
    },
  });
  await openFrontendBoardReview(page, frontendServices);
  const sidebar = sessionsSidebarParts(page);
  await sidebar.button.click();
  await sidebar.entry("Terminal kept during notes").click();
  const panel = terminalPanel(page);
  await expectTerminalText(panel, "Terminal before notes");
  const originalScreen =
    await terminalScreenParts(panel).screen.elementHandle();
  const notes = storyNotesPage(page);
  const card = reviewedStoryCard(page);
  await notes.open(card, "keyboard");
  await notes.expectContext(storyA.title, storyA.identity);
  print("Terminal while notes open\r\n");
  await notes.close();
  await expectTerminalText(panel, "Terminal before notes");
  await expectTerminalText(panel, "Terminal while notes open");
  expect(await originalScreen.evaluate((element) => element.isConnected)).toBe(
    true,
  );
  expect(attachments).toBe(1);
  await expect(
    card.getByRole("button", { name: "Notes", exact: true }),
  ).toBeFocused();
});
