// Pending and failed Mark as done from the page's terminal
// (./agent-terminal-done.spec.ts), against a controlled machine read, done
// boundary (../../tests/support/frontendSessionActions.ts) and attached
// terminal: Maximize and Close stay usable while the Done answer is held, and
// releasing still closes the panel; a failed answer leaves a recoverable
// unresolved state without refused-intent wording. A real answer held past
// the wait bound, whose recovery reuses the settled mark without a second
// native stop, is ../../../e2e/sessions/agent-terminal-done-pending.spec.ts.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import {
  cardSession,
  cardSessionEntry,
  openCardSessionTerminal,
} from "../../tests/support/frontendCardSessions.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import type { FrontendServiceState } from "../../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import {
  headerMarkAsDone,
  sendDoneMarkAnyway,
} from "../../tests/support/markDone.ts";
import { readyStory } from "../../tests/launchJourney.ts";
import { maximizeSidePanel } from "../../tests/sidePanelFrame.ts";
import { markDoneUnresolved } from "../../src/pageSessions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// The Ready story's working execution session, shown in the terminal.
async function openWorkingSession(page: Page, services: FrontendServiceState) {
  services.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        cardSession(
          "Execution",
          readyStory,
          makeMe.aSessionState.loaded("working").please(),
        ),
      )
      .please(),
  );
  const actions = await installFrontendSessionActions(page, services);
  await installAttachedTerminalSubstitute(page);
  await openFrontendTakenBacklog(page);
  const panel = await openCardSessionTerminal(page, readyStory, "Execution");
  return { actions, panel };
}

test.describe("pending Mark as done from the terminal", () => {
  test("Maximize and Close stay usable while Done is held, and releasing still closes the panel", async ({
    page,
    frontendServices,
  }) => {
    const { actions, panel } = await openWorkingSession(page, frontendServices);
    const listed = cardSessionEntry(page, readyStory, "Execution");
    const held = actions.holdNext("done");
    await sendDoneMarkAnyway(panel);
    const marking = panel.getByRole("status").getByText("Marking as done…");
    await expect(marking).toBeVisible();
    await expect(headerMarkAsDone(panel)).toBeDisabled();

    await maximizeSidePanel(panel, "click");
    await expect(panel.getByRole("button", { name: "Restore" })).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Close", exact: true }),
    ).toBeEnabled();
    await expect(marking).toBeVisible();
    await expect(headerMarkAsDone(panel)).toBeDisabled();

    held.release();
    await expect(panel).toHaveCount(0);
    await expect(listed).toHaveCount(0);
  });

  test("a failed Done answer leaves the same recoverable unresolved state without claiming the mark failed", async ({
    page,
    frontendServices,
  }) => {
    const { actions, panel } = await openWorkingSession(page, frontendServices);
    actions.failNext("done");

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
    expect(actions.asked("done")).toHaveLength(1);
  });
});
