// Pending and late Mark as done from the page's terminal
// (./agent-terminal-done.spec.ts): Maximize and Close stay usable while the
// Done answer is held; releasing still closes the panel; a wait-bound or
// failed answer leaves a recoverable unresolved state without refused-intent
// wording or a duplicate native stop. Shared hold helpers live in
// ./support/holdDoneRequest.ts.

import type { Locator } from "@playwright/test";
import { agentDoneEndpoint } from "../src/doneMark.ts";
import { markDoneUnresolved } from "../src/pageSessions.ts";
import { markDoneWaitMs } from "../src/sessionRecordRequests.ts";
import { expect, test } from "./dashboardTest.ts";
import { storyCardSessions } from "./dashboardPage.ts";
import {
  publishStoryColumnsJourney,
  readyStory,
  type StoryColumnsJourney,
} from "./launchJourney.ts";
import { openStoryColumnsJourney } from "./storyColumnsPage.ts";
import {
  holdDoneRequestRoute,
  holdDoneRequests,
} from "./support/holdDoneRequest.ts";
import {
  idleBetweenSteps,
  markAsDone,
  sendDoneMarkAnyway,
} from "./support/markDone.ts";

test.use({ projectFolders: ["open-dough"] });

const headerMarkAsDone = (panel: Locator) =>
  markAsDone(panel.locator("header"));

test.describe("pending Mark as done from the terminal", () => {
  let columnsJourney: StoryColumnsJourney;
  test.beforeAll(async () => {
    test.setTimeout(120_000);
    columnsJourney = await publishStoryColumnsJourney();
  });
  test.afterAll(() =>
    (columnsJourney as StoryColumnsJourney | undefined)?.cleanup(),
  );

  test("Maximize and Close stay usable while Done is held, and releasing still closes the panel", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    const listed = storyCardSessions(card(readyStory));
    await settled();
    await launch(readyStory, "Execution");
    await listed.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    const [session] = dashboard.claudeListing();
    idleBetweenSteps(dashboard, String(session?.["sessionId"]));
    const release = await holdDoneRequests(page);
    await sendDoneMarkAnyway(panel);
    const marking = panel.getByRole("status").getByText("Marking as done…");
    await expect(marking).toBeVisible();
    await expect(headerMarkAsDone(panel)).toBeDisabled();

    await panel.getByRole("button", { name: "Maximize" }).click();
    await expect(panel.getByRole("button", { name: "Restore" })).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Close", exact: true }),
    ).toBeEnabled();
    await expect(marking).toBeVisible();
    await expect(headerMarkAsDone(panel)).toBeDisabled();

    release();
    await expect(panel).toHaveCount(0);
    await expect(listed).toHaveCount(0);
  });

  test("a held Done past the wait bound leaves a recoverable unresolved state without claiming the mark failed", async ({
    page,
    dashboard,
  }) => {
    await page.clock.install();
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    const listed = storyCardSessions(card(readyStory));
    await settled();
    await launch(readyStory, "Execution");
    await listed.getByRole("button", { name: "Open terminal" }).click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    const [session] = dashboard.claudeListing();
    idleBetweenSteps(dashboard, String(session?.["sessionId"]));
    const { release, held } = await holdDoneRequestRoute(page);
    await sendDoneMarkAnyway(panel);
    await expect(panel.getByRole("status")).toHaveText("Marking as done…");
    await held;

    await page.clock.runFor(markDoneWaitMs);

    const unresolved = panel.getByRole("status").getByText(markDoneUnresolved);
    await expect(unresolved).toBeVisible();
    await expect(
      panel
        .getByRole("status")
        .getByText("The session could not be marked done."),
    ).toHaveCount(0);
    await expect(headerMarkAsDone(panel)).toBeEnabled();
    await expect(panel.getByRole("button", { name: "Maximize" })).toBeEnabled();
    await expect(
      panel.getByRole("button", { name: "Close", exact: true }),
    ).toBeEnabled();
    await expect(listed).toHaveCount(1);
    expect(dashboard.claudeStopCalls()).toEqual([]);

    // A late answer after the bound must not look like a refused persisted
    // intent; recovery reuses the settled mark without a second native stop.
    release();
    await expect(unresolved).toBeVisible();
    await expect(
      panel
        .getByRole("status")
        .getByText("The session could not be marked done."),
    ).toHaveCount(0);
    await sendDoneMarkAnyway(panel);
    await expect(panel).toHaveCount(0);
    await expect(listed).toHaveCount(0);
    expect(dashboard.claudeStopCalls()).toHaveLength(1);
  });

  test("a failed Done answer leaves the same recoverable unresolved state without claiming the mark failed", async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { card, settled, launch } = await openStoryColumnsJourney(
      page,
      columnsJourney,
    );
    const panel = page.getByRole("region", { name: "Terminal" });
    await settled();
    await launch(readyStory, "Execution");
    await storyCardSessions(card(readyStory))
      .getByRole("button", { name: "Open terminal" })
      .click();
    await expect(panel.locator(".xterm-rows")).toContainText("attached");
    await page.route(`**${agentDoneEndpoint}`, (route) =>
      route.abort("failed"),
    );
    await sendDoneMarkAnyway(panel);

    const unresolved = panel.getByRole("status").getByText(markDoneUnresolved);
    await expect(unresolved).toBeVisible();
    await expect(
      panel
        .getByRole("status")
        .getByText("The session could not be marked done."),
    ).toHaveCount(0);
    await expect(headerMarkAsDone(panel)).toBeEnabled();
    await expect(panel).toBeVisible();
    expect(dashboard.claudeStopCalls()).toEqual([]);
  });
});
