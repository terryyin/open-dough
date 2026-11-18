// The Board's own width decides how many Board Columns show, so the side
// panel opening and closing pages them as a window would: beside it a 54rem
// Board shows two columns and a column paging control naming the hidden one,
// a move slides the view, and the chosen position comes back where the width
// allows it; a session started beside the panel leaves the view and the
// Recently done count as they were. How a narrow window pages the columns is
// ./board-paging.spec.ts; that an active story's open session stays out of
// Recently done beside its matching done card is
// ../sessions/recently-done-active-story-sessions.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import {
  takenStoryWorking,
  takenStoryWorkingSession,
} from "../../test-support/support/frontendCardSessions.ts";
import { frontendAttempt } from "../../test-support/support/frontendLaunchAttempts.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { frontendStoryLaunch } from "../../test-support/support/frontendServiceState.ts";
import { untilPageRequestsAnswered } from "../../test-support/pageRequestNotes.ts";
import { readyStory } from "../../test-support/launchJourney.ts";
import { columns, rem } from "../../test-support/boardPage.ts";

// A 108rem window, which the side panel leaves a 54rem Board.
test.use({ viewport: { width: 108 * rem, height: 900 } });

test("beside the side panel a 54rem Board shows two columns and pages between them; a wider Board shows all three and gives the view back", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWorkingSession(page, frontendServices);
  const board = await openFrontendTakenBacklog(page);
  await board.countSlides();

  await test.step("a 108rem Board shows all three and no column paging control", async () => {
    await board.shows(columns, []);
  });

  const terminal =
    await test.step("the side panel opens, leaving 54rem: Backlog and Taken fill the Board, and the right control names Recently done", async () => {
      const terminal = await board.openTakenStoryTerminal();
      expect(await board.width()).toBeCloseTo(54 * rem, 0);
      await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
      await board.keepsStoryCardShare(2);
      return terminal;
    });

  await test.step("the right control shows Taken and Recently done, with a slide, and the left control names Backlog", async () => {
    await board.pageTo("Recently done");
    await board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);
    expect(await board.slides()).toBe(1);
  });

  await test.step("the side panel closes: all three show and both controls go", async () => {
    const closed = await terminal.close({ using: "mouse" });
    await closed.showsNoTerminal();
    await closed.shows(columns, []);
  });

  await test.step("the side panel reopens: Taken and Recently done show again", async () => {
    await board.openTakenStoryTerminal();
    await board.shows(["Taken", "Recently done"], ["Backlog 2 entries"]);
  });
});

test("paged back to Backlog beside the side panel, a session started from the ready Backlog card stays on its card, adds nothing to Recently done, and the view stays", async ({
  page,
  frontendServices,
}) => {
  await takenStoryWorkingSession(page, frontendServices);
  // The start's attempt, whose machine answers keep the Taken story's
  // working session.
  const attempt = frontendAttempt(frontendServices, (answer) =>
    answer.observing(takenStoryWorking()),
  );
  const boundary = await installFrontendLaunchBoundary(page, {
    accept: attempt.accept,
  });
  const board = await openFrontendTakenBacklog(page);
  await board.openTakenStoryTerminal();
  await board.pageTo("Recently done");
  await board.pageTo("Backlog");
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);

  await board.startExecution(readyStory);
  attempt.launch(frontendStoryLaunch("executing", readyStory).please());
  await boundary.tellChanged();
  await untilPageRequestsAnswered(page);

  await board.showsBacklogCardSessions(readyStory, 1);
  await board.shows(["Backlog", "Taken"], ["Recently done 0 entries"]);
});
