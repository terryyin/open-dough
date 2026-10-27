// A launch from a Backlog card that did not start, or may not have started, on
// the committed origin of ./agent-launch-story-card.spec.ts: a definitive answer
// stays beside the action that was used, which the card keeps, on a line of its
// own right below that action in its launch group, and it lists no session; an
// uncertain one needs reconciliation under Startup recovery while the card
// stays protected, holding the keyboard it took at handoff. The
// page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import { inspectionGroup, launchGroup } from "./storyCardControls.ts";
import {
  expectOnOneLine,
  expectStackedInOrder,
  tapWhereShown,
} from "./pageLayout.ts";
import { openTakenBacklog } from "./launchStoryCardPage.ts";
import { readyStory } from "./launchJourney.ts";

test.use({ projectFolders: ["open-dough"] });

const folderNotFound =
  "Launch failed: The project folder ~/git/open-dough was not found on this machine. Nothing was launched.";

test.describe("without the project's folder", () => {
  test.use({ projectFolders: [] });

  test("the card explains the folder was not found and keeps Start execution", async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    const { card, start, refine, dialog } = await openTakenBacklog(
      page,
      launchJourney,
    );

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
    expect(dashboard.claudeCalls()).toEqual([]);
  });

  test("the failure shows beside Start refinement, which it describes, and leaves Start execution without an answer", async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    const { card, start, refine, refinementDialog } = await openTakenBacklog(
      page,
      launchJourney,
    );

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
    expect(dashboard.claudeCalls()).toEqual([]);
  });
});

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test.describe("phone touch recovery", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

    test("a constrained-height Start reports uncertainty and only the explicit recovery choice starts its kept instruction again", async ({
      page,
      dashboard,
      launchJourney,
    }) => {
      test.setTimeout(120_000);
      dashboard.claudeScenario("hang");
      const { card, start, dialog } = await openTakenBacklog(
        page,
        launchJourney,
      );
      const launcher = start(readyStory);
      await launcher.scrollIntoViewIfNeeded();
      await tapWhereShown(launcher);
      const draft =
        "Keep this instruction.\n\nExplain an uncertain launch before continuing.";
      const field = dialog.getByRole("textbox", {
        name: "Instruction (optional)",
      });
      await field.fill(draft);
      await page.setViewportSize({ width: 390, height: 300 });
      await expect(field).toHaveValue(draft);
      expect(dashboard.claudeLaunchCalls()).toEqual([]);
      await tapWhereShown(
        dialog.getByRole("button", { name: "Start", exact: true }),
      );
      await expect(dialog).toBeHidden();
      await expect(card(readyStory)).toContainText("Local startup in progress");
      const recovery = page.getByRole("region", { name: "Startup recovery" });
      await expect(recovery).toContainText(
        "Claude Code did not answer in time, so the session may or may not have started.",
      );
      await expect(card(readyStory)).toContainText(
        "Startup needs reconciliation",
      );
      await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
      await expect(launcher).toBeDisabled();
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      await page.setViewportSize({ width: 844, height: 300 });
      expect(dashboard.claudeLaunchCalls()).toHaveLength(1);
      const advice = recovery.getByText(
        "Check claude agents before continuing:",
        { exact: false },
      );
      await advice.scrollIntoViewIfNeeded();
      await expect(advice).toBeInViewport({ ratio: 1 });
      dashboard.claudeScenario("launched");
      const continueStart = recovery.getByRole("button", {
        name: /^Continue execution start/,
      });
      await continueStart.scrollIntoViewIfNeeded();
      await tapWhereShown(continueStart);
      const session = storyCardSessions(card(readyStory));
      await expect(session).toHaveCount(1);
      await expect(session).toContainText("Execution started in Claude Code");
      await expect(card(readyStory)).not.toContainText(
        "Startup needs reconciliation",
      );
      expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
      expect(
        dashboard.claudeLaunchCalls().map((call) => call.argv.at(-1)),
      ).toEqual([
        `/dough-execute-plan SEED-B#b\n\n${draft}`,
        `/dough-execute-plan SEED-B#b\n\n${draft}`,
      ]);
    });
  });

  test("Start is disabled while in flight, and the uncertain answer needs reconciliation under Startup recovery while the card stays protected", async ({
    page,
    dashboard,
    launchJourney,
  }) => {
    dashboard.claudeScenario("hang");
    const { card, start, dialog } = await openTakenBacklog(page, launchJourney);

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
    const recovery = page.getByRole("region", { name: "Startup recovery" });
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
    await expect(card(readyStory)).toContainText(
      "Startup needs reconciliation",
    );
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
    expect(dashboard.claudeCalls()).toHaveLength(1);
  });
});
