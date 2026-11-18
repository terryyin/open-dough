// An unattached session's keyboard start under reduced motion against a
// controlled launch boundary and machine read (../../src/StartSession.tsx,
// ../../src/launchStarts.ts): focus moves to Start session's progress, which
// describes the unavailable Start session. One started with nothing typed
// opens in the terminal; one started with typed text presents nothing.
// Neither moves the keyboard from a task begun during the startup. A story's
// keyboard start is ./responsive-session-access.spec.ts; the real held start
// is ../../../e2e/launches/responsive-session-start.spec.ts.

import { parts, sessionEntriesIn } from "../../test-support/dashboardPage.ts";
import { tabTo } from "../../test-support/accessibleReading.ts";
import {
  backlogLaunchers,
  startSession,
} from "../../test-support/launchStoryCardPage.ts";
import { notRefinedStory } from "../../test-support/launchJourney.ts";
import { untilPageRequestsAnswered } from "../../test-support/pageRequestNotes.ts";
import { inspectByKeyboard } from "../../test-support/responsiveAccess.ts";
import { terminalPanel } from "../../test-support/terminalScreenPage.ts";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { frontendAttempt } from "../../test-support/support/frontendLaunchAttempts.ts";
import { installFrontendLaunchBoundary } from "../../test-support/support/frontendLaunchSubstitutes.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendServiceSubstitutes.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

for (const typed of ["", "why is CI slow?"]) {
  const presented =
    typed === ""
      ? "its session later opens in the terminal without taking"
      : "its instructed session later starts with no terminal and without taking";
  test(`a keyboard Start session hands the keyboard to its progress, and ${presented} the keyboard from a task begun meanwhile`, async ({
    page,
    frontendServices,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const attempt = frontendAttempt(frontendServices);
    const boundary = await installFrontendLaunchBoundary(page, {
      accept: attempt.accept,
    });
    await installAttachedTerminalSubstitute(page);
    await openFrontendTakenBacklog(page);
    const other = backlogLaunchers(page).card(notRefinedStory);
    const button = startSession(page, "Open Dough");
    const progressWords =
      "Starting a session in Open Dough… Local startup in progress.";

    await button.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "Start a session in Open Dough in Claude Code",
    });
    await page.keyboard.type(typed);
    await tabTo(
      page,
      dialog.getByRole("button", { name: "Start", exact: true }),
    );
    await page.keyboard.press("Enter");

    await expect(dialog).toBeHidden();
    const progress = page.locator(".start-session-answer");
    await expect(progress).toHaveText(progressWords);
    await expect(progress).toBeFocused();
    await expect(button).toBeDisabled();
    await expect(button).toHaveAccessibleDescription(progressWords);
    expect(boundary.acceptances).toEqual([
      expect.objectContaining({ workflow: "ad-hoc" }),
    ]);

    const otherHide = await inspectByKeyboard(page, other);

    attempt.launch(
      makeMe.aLaunchRecord
        .adHoc({
          title: "Open Dough · Ad hoc",
          ...(typed === "" ? {} : { instruction: typed }),
        })
        .please(),
    );
    await boundary.tellChanged();
    // The startup has ended once Start session is offered again.
    await expect(button).toBeEnabled();
    await untilPageRequestsAnswered(page);
    const panel = terminalPanel(page);
    await expect(panel).toHaveCount(typed === "" ? 1 : 0);
    const entry = sessionEntriesIn(parts(page).taken).first();
    if (typed === "") await expect(entry).toContainText("Shown in terminal");
    else await expect(entry).not.toContainText("Shown in terminal");
    await expect(parts(page).adHocStarted).toHaveCount(0);
    await expect(otherHide).toBeFocused();
  });
}
