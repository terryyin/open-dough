// A Backlog launch that may not have started, against a controlled launch
// boundary and machine read: while its accepted start runs the keyboard goes
// to the protected card, and once the launch settles uncertain it needs
// reconciliation under Startup recovery, with Claude Code's own check
// advised, while the card stays protected; an acceptance whose answer is lost
// says the launch is uncertain, never accepted, and protects the story once
// its attempt is read. The real uncertain launch and its explicit recovery
// are ../../../e2e/launches/agent-launch-story-card-problems.spec.ts; held
// real starts are ../../../e2e/launches/responsive-session-start.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendLaunchBoundary } from "../../tests/support/frontendLaunchSubstitutes.ts";
import { frontendAttempt } from "../../tests/support/frontendLaunchAttempts.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import { parts, storyCardSessions } from "../../tests/dashboardPage.ts";
import { launchGroup } from "../../tests/storyCardControls.ts";
import { expectStackedInOrder } from "../../tests/pageLayout.ts";
import { expectProtected } from "../../tests/responsiveStart.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";
import { hostDescriptions } from "../../src/hostDescription.ts";

test("Start is disabled while in flight, and the uncertain answer needs reconciliation under Startup recovery while the card stays protected", async ({
  page,
  frontendServices,
}) => {
  const attempt = frontendAttempt(frontendServices);
  const boundary = await installFrontendLaunchBoundary(page, {
    accept: attempt.accept,
  });
  await openFrontendTakenBacklog(page);
  const { card, start, dialog } = backlogLaunchers(page);

  await start(readyStory).click();
  await dialog.getByRole("button", { name: "Start" }).click();

  // Accepted: the dialog closes while the launch is in flight, and the
  // keyboard goes to the card, which says so, not to its unavailable Start.
  await expect(dialog).toBeHidden();
  await expect(card(readyStory)).toBeFocused();
  await expect(card(readyStory)).toContainText(
    "Starting execution in Claude Code…",
  );
  await expect(start(readyStory)).toBeDisabled();

  // Claude Code's launch did not answer within the launch wait.
  attempt.settle({
    kind: "uncertain",
    reason: "timed-out",
    explanation: `Claude Code did not answer in time, so the session may or may not have started. ${hostDescriptions.claude.uncertaintyHint}`,
  });
  await boundary.tellChanged();
  const recovery = parts(page).startupRecovery;
  await expect(recovery).toContainText(
    "Its last answer: Claude Code did not answer in time, so the session may or may not have started. Check claude agents for it.",
  );
  await expect(recovery.locator("code").first()).toHaveText("claude agents");
  await expect(
    recovery.getByRole("button", { name: /^Continue execution start/ }),
  ).toBeEnabled();
  const nativeAdvice =
    "Check claude agents before continuing: continuing starts its session again unless its kept evidence resumes it.";
  await expect(recovery.locator('[id$="-check"]')).toHaveText(nativeAdvice);
  await expect(recovery.locator('[id$="-check"] code')).toHaveText(
    "claude agents",
  );
  await expect(
    recovery.getByRole("button", { name: /^Continue execution start/ }),
  ).toHaveAccessibleDescription(nativeAdvice);
  await expect(
    recovery.getByRole("button", { name: /^Recheck / }),
  ).toBeEnabled();
  await expect(card(readyStory)).toContainText("Startup needs reconciliation");
  // What startup says leads the card's unavailable launch group.
  await expectStackedInOrder([
    card(readyStory).getByText(/^Startup needs reconciliation/),
    launchGroup(card(readyStory)),
  ]);
  await expect(card(readyStory).locator(".launch-problem")).toHaveCount(0);
  await expect(start(readyStory)).toBeDisabled();
  await expect(start(readyStory)).toHaveAccessibleDescription(
    /Startup needs reconciliation/,
  );
  await expect(card(readyStory)).toBeFocused();
  await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
  expect(boundary.acceptances).toHaveLength(1);
});

test("a lost acknowledgment says the launch is uncertain, never accepted, and the story is protected once its attempt is read", async ({
  page,
  frontendServices,
}) => {
  const attempt = frontendAttempt(frontendServices);
  const boundary = await installFrontendLaunchBoundary(page, {
    accept: attempt.accept,
  });
  // The service accepts the launch; its answer never reaches the page.
  boundary.loseNextAcceptance();
  await openFrontendTakenBacklog(page);
  const { card, start } = backlogLaunchers(page);
  const story = card(readyStory);

  await start(readyStory).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(story.locator(".launch-problem")).toContainText(
    "Launch uncertain: The local dashboard server could not be reached, so the launch may or may not have been accepted",
  );
  await expect(story).toContainText("Local startup in progress");
  await expectProtected(story);
  await expect(
    card(notRefinedStory).getByRole("button", { disabled: true }),
  ).toHaveCount(0);
  expect(boundary.acceptances).toHaveLength(1);
});
