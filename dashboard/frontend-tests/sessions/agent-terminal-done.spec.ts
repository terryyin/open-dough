// Mark as done in the page's one terminal, against a controlled machine read,
// done boundary (../../tests/support/frontendSessionActions.ts) and attached
// terminal: a refused mark keeps the panel open and says so as a problem, as
// an ended terminal does, and a mark answered after another session replaced
// the panel leaves the keyboard in the new terminal. The real mark that
// closes the panel and renames the session is
// ../../../e2e/sessions/agent-terminal-done.spec.ts; pending and failed
// answers are ./agent-terminal-done-pending.spec.ts.

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
import { putFrontendMachine } from "../../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import { directedApplication } from "../../tests/support/terminalSubstituteApplication.ts";
import {
  markAsDone,
  markDoneAnyway,
  sendDoneMarkAnyway,
} from "../../tests/support/markDone.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";
import { colourOf, tokenColour } from "../../tests/pageColours.ts";
import { terminalScreenParts } from "../../tests/terminalScreenPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const working = makeMe.aSessionState.loaded("working").please();

test("a refused mark keeps the panel open and says so as a problem, as an ended terminal does", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(cardSession("Execution", readyStory, working))
      .please(),
  );
  const actions = await installFrontendSessionActions(page, frontendServices);
  const terminal = directedApplication("attached abcdef12\r\nClaude Code\r\n");
  await installAttachedTerminalSubstitute(page, {
    application: terminal.application,
  });
  await openFrontendTakenBacklog(page);
  const panel = await openCardSessionTerminal(page, readyStory, "Execution");
  const status = panel.getByRole("status");
  actions.refuseNext("done", "The project folder could not be found.");

  await markDoneAnyway(panel);

  const refused = status.getByText("The session could not be marked done.");
  await expect(refused).toBeVisible();
  expect(await colourOf(refused)).toBe(await tokenColour(page, "--problem"));
  await expect(panel).toBeVisible();
  await expect(markAsDone(panel)).toBeEnabled();

  // The attached CLI ending on its own still shows as a problem.
  terminal.end();
  const ended = status.getByText("The terminal ended");
  await expect(ended).toBeVisible();
  expect(await colourOf(ended)).toBe(await tokenColour(page, "--problem"));
});

test("a mark answered after another session replaced the panel leaves the keyboard in the new terminal", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        cardSession("Execution", readyStory, working),
        cardSession("Refinement", notRefinedStory, working),
      )
      .please(),
  );
  const actions = await installFrontendSessionActions(page, frontendServices);
  await installAttachedTerminalSubstitute(page);
  await openFrontendTakenBacklog(page);
  const panel = await openCardSessionTerminal(page, readyStory, "Execution");
  const held = actions.holdNext("done");
  await sendDoneMarkAnyway(panel);
  await expect(panel.getByRole("status")).toHaveText("Marking as done…");

  await openCardSessionTerminal(page, notRefinedStory, "Refinement");
  await expect(panel).toContainText("Refinement session");
  const typing = terminalScreenParts(panel).input;
  await expect(typing).toBeFocused();
  held.release();
  await held.delivered;

  await expect(cardSessionEntry(page, readyStory, "Execution")).toHaveCount(0);
  await expect(panel).toContainText("Refinement session");
  await expect(typing).toBeFocused();
});
