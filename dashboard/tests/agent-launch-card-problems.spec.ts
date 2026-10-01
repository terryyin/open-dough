// A launch from a Backlog card that did not start, or may not have started, on
// the committed origin of ./agent-launch-card.spec.ts: a definitive answer
// stays beside the action that was used, which the card keeps, and it lists no
// session; an uncertain one needs reconciliation under Startup recovery while
// the card stays protected, holding the keyboard it took at handoff. The
// page's own dashboard server launches the synthetic `claude`
// (./fixtures/fake-claude); the real one is never reached.

import { expect, test } from "./dashboardTest.ts";
import { cardSessions } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
// Publishing runs production backlog commands against a local origin; give
// it its own budget so a busy machine cannot starve it.
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const folderNotFound =
  "Launch failed: The project folder ~/git/open-dough was not found on this machine. Nothing was launched.";

test.describe("without the project's folder", () => {
  test.use({ projectFolders: [] });

  test("the card explains the folder was not found and keeps Start execution", async ({
    page,
    dashboard,
  }) => {
    const { card, start, dialog } = await openTakenBacklog(page, journey);

    await start(readyStory).click();
    await dialog.getByRole("button", { name: "Start" }).click();

    await expect(dialog).toBeHidden();
    await expect(card(readyStory)).toContainText(folderNotFound);
    await expect(start(readyStory)).toBeEnabled();
    await expect(start(readyStory)).toBeFocused();
    await expect(start(readyStory)).toHaveAccessibleDescription(
      /The project folder ~\/git\/open-dough was not found/,
    );
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    expect(dashboard.claudeCalls()).toEqual([]);
  });

  test("the failure shows beside Start refinement, which it describes, and leaves Start execution without an answer", async ({
    page,
    dashboard,
  }) => {
    const { card, start, refine, refinementDialog } = await openTakenBacklog(
      page,
      journey,
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
    expect(dashboard.claudeCalls()).toEqual([]);
  });
});

test.describe("when Claude Code does not answer within the launch wait", () => {
  test.use({ launchTimeoutMs: 3_000 });

  test("Start is disabled while in flight, and the uncertain answer needs reconciliation under Startup recovery while the card stays protected", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("hang");
    const { card, start, dialog } = await openTakenBacklog(page, journey);

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
      "Its last answer: Claude Code did not answer in time, so the session may or may not have started. Check claude agents for it before continuing.",
    );
    await expect(recovery.locator("code").first()).toHaveText("claude agents");
    await expect(
      recovery.getByRole("button", { name: /^Continue execution start/ }),
    ).toBeEnabled();
    await expect(card(readyStory)).toContainText(
      "Startup needs reconciliation",
    );
    await expect(card(readyStory).locator(".launch-problem")).toHaveCount(0);
    await expect(start(readyStory)).toBeDisabled();
    await expect(start(readyStory)).toHaveAccessibleDescription(
      /Startup needs reconciliation/,
    );
    await expect(card(readyStory)).toBeFocused();
    await expect(cardSessions(card(readyStory))).toHaveCount(0);
    expect(dashboard.claudeCalls()).toHaveLength(1);
  });
});
