// What a Backlog card says beside the Start that was used, against a
// controlled launch boundary and machine read: while its accepted start runs
// the card reads "Preparing execution…" for a project whose installed skill
// establishes a start, and stays in the Backlog, or "Starting <workflow> in
// Claude Code…" otherwise; a launch refused because the project's folder is
// missing stays beside the used Start, which keeps the keyboard and is
// described by it, on its own line below that Start. The real starts and
// launches are ../../backend-tests/launches/agent-launch-start.spec.ts and
// ../../../e2e/launches/agent-launch-story-card.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import { frontendAttempt } from "../../tests/support/frontendLaunchAttempts.ts";
import { openDoughSource } from "../../tests/support/frontendServiceState.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import {
  expectMembership,
  parts,
  storyCardSessions,
} from "../../tests/dashboardPage.ts";
import { inspectionGroup, launchGroup } from "../../tests/storyCardControls.ts";
import {
  expectOnOneLine,
  expectStackedInOrder,
} from "../../tests/pageLayout.ts";
import {
  notRefinedStory,
  readyStory,
  takenStory,
} from "../../tests/launchJourney.ts";

test.describe("while the accepted start runs", () => {
  test("an execution card of a project whose installed skill cannot continue from a start reads Starting execution in Claude Code…", async ({
    page,
    frontendServices,
  }) => {
    const attempt = frontendAttempt(frontendServices);
    await installFrontendLaunchBoundary(page, { accept: attempt.accept });
    await openFrontendTakenBacklog(page);
    const { card, start, dialog } = backlogLaunchers(page);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(card(readyStory).locator(".launch-answer")).toHaveText(
      "Starting execution in Claude Code…",
    );
  });

  test("an execution card of a project that establishes a start reads Preparing execution… and stays in the Backlog, shown neither Taken nor assigned", async ({
    page,
    frontendServices,
  }) => {
    const attempt = frontendAttempt(frontendServices, (answer) =>
      answer.establishing({
        source: openDoughSource.id,
        workflow: "execution",
        host: "claude",
      }),
    );
    const boundary = await installFrontendLaunchBoundary(page, {
      accept: attempt.accept,
    });
    await openFrontendTakenBacklog(page);
    const { card, start, dialog } = backlogLaunchers(page);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    const answer = card(readyStory).locator(".launch-answer");
    await expect(answer).toHaveText("Preparing execution…");
    await expect(start(readyStory)).toBeDisabled();
    await expect(card(readyStory)).not.toContainText("Taken");
    await expectMembership(page, {
      taken: [takenStory],
      backlog: [readyStory, notRefinedStory],
    });
    await expect(parts(page).taken).not.toContainText(readyStory);

    // The start ends without a session.
    attempt.settle({
      kind: "failed",
      reason: "start-refused",
      explanation: "The installed start answered nothing it could use.",
    });
    await boundary.tellChanged();
    await expect(answer).not.toHaveText("Preparing execution…");
  });

  test("a refinement card keeps Starting refinement in Claude Code…", async ({
    page,
    frontendServices,
  }) => {
    const attempt = frontendAttempt(frontendServices);
    await installFrontendLaunchBoundary(page, { accept: attempt.accept });
    await openFrontendTakenBacklog(page);
    const { card, refine, refinementDialog } = backlogLaunchers(page);

    await refine(readyStory).click();
    await refinementDialog.getByRole("button", { name: "Start" }).click();

    await expect(card(readyStory).locator(".launch-answer")).toHaveText(
      "Starting refinement in Claude Code…",
    );
  });
});

test.describe("without the project's folder", () => {
  const folderNotFound =
    "Launch failed: The project folder ~/git/open-dough was not found on this machine. Nothing was launched.";
  test.beforeEach(async ({ page }) => {
    // The boundary's answer when the project's folder is missing.
    await installFrontendLaunchBoundary(page, {
      accept: () => ({
        kind: "failed",
        reason: "folder-not-found",
        explanation:
          "The project folder ~/git/open-dough was not found on this machine. Nothing was launched.",
      }),
    });
    await openFrontendTakenBacklog(page);
  });

  test("the card explains the folder was not found and keeps Start execution", async ({
    page,
  }) => {
    const { card, start, refine, dialog } = backlogLaunchers(page);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(dialog).toBeHidden();
    await expect(card(readyStory)).toContainText(folderNotFound);
    await expect(start(readyStory)).toBeEnabled();
    await expect(start(readyStory)).toBeFocused();
    await expect(start(readyStory)).toHaveAccessibleDescription(
      /The project folder ~\/git\/open-dough was not found/,
    );
    // The answer sits below Start execution, before Start refinement.
    const answer = launchGroup(card(readyStory)).getByText(folderNotFound);
    await expect(answer).toBeVisible();
    await expectStackedInOrder([start(readyStory), answer, refine(readyStory)]);
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
  });

  test("the failure shows beside Start refinement, which it describes, and leaves Start execution without an answer", async ({
    page,
  }) => {
    const { card, start, refine, refinementDialog } = backlogLaunchers(page);

    await refine(readyStory).click();
    await refinementDialog.getByRole("button", { name: "Start" }).click();

    await expect(refinementDialog).toBeHidden();
    await expect(card(readyStory)).toContainText(folderNotFound);
    await expect(refine(readyStory)).toBeFocused();
    await expect(refine(readyStory)).toHaveAccessibleDescription(
      /The project folder ~\/git\/open-dough was not found/,
    );
    await expect(start(readyStory)).toBeEnabled();
    await expect(start(readyStory)).toHaveAccessibleDescription("");
    await expect(card(readyStory).locator(".launch-answer")).toHaveCount(1);
    // Both Starts keep their line; the answer follows the Start it describes,
    // before the inspection group.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expectOnOneLine([start(readyStory), refine(readyStory)]);
    await expectStackedInOrder([
      refine(readyStory),
      launchGroup(card(readyStory)).getByText(folderNotFound),
      inspectionGroup(card(readyStory)).getByRole("button", {
        name: "Inspect story",
      }),
    ]);
  });
});
