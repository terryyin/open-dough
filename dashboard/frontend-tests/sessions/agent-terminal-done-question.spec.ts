// Mark as done in the page's one terminal (./agent-terminal-done.spec.ts)
// decides whether to ask first by the session as the page reads it now, not
// as the panel was opened with it: while another project is shown, where the
// session has no entry, it still asks about the session's reading, and marking
// closes the panel; a session opened while Ready for review that then reads
// Working is asked about as working. Against a controlled machine read, done
// boundary (../../tests/support/frontendSessionActions.ts) and attached
// terminal. The question following a real session's reading is
// ../../../e2e/sessions/agent-launch-done-question-follows.spec.ts.

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
import {
  doughnutSource,
  putFrontendMachine,
} from "../../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import {
  expectAsked,
  markDone,
  stillWorking,
} from "../../tests/support/markDone.ts";
import { setPageVisibility } from "../../tests/autoRefreshJourney.ts";
import {
  chooseProject,
  expectProjectChoice,
  sessionStateOf,
} from "../../tests/dashboardPage.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test.describe("Mark as done in the terminal asks by the session's current reading", () => {
  test("Mark as done from the panel while another project is shown, where the session has no entry, closes the panel", async ({
    page,
    frontendServices,
  }) => {
    Object.assign(frontendServices, {
      projects: [...frontendServices.projects, doughnutSource],
    });
    putFrontendMachine(
      frontendServices,
      makeMe.aMachineAnswer
        .observing(
          cardSession(
            "Execution",
            notRefinedStory,
            makeMe.aSessionState.loaded("working").please(),
          ),
        )
        .please(),
    );
    const actions = await installFrontendSessionActions(page, frontendServices);
    await installAttachedTerminalSubstitute(page);
    await openFrontendTakenBacklog(page);
    const panel = await openCardSessionTerminal(
      page,
      notRefinedStory,
      "Execution",
    );
    await chooseProject(page, "Doughnut");
    await expectProjectChoice(page, "Doughnut");
    await expect(
      cardSessionEntry(page, notRefinedStory, "Execution"),
    ).toHaveCount(0);

    const question = await expectAsked(panel, stillWorking);
    await markDone(question);

    await expect(panel).toHaveCount(0);
    expect(actions.asked("done")).toHaveLength(1);
  });

  test("a session opened while Ready for review that then reads Working is asked about as working", async ({
    page,
    frontendServices,
  }) => {
    const observe = (activity: "review" | "working") => {
      putFrontendMachine(
        frontendServices,
        makeMe.aMachineAnswer
          .observing(
            cardSession(
              "Execution",
              readyStory,
              makeMe.aSessionState.loaded(activity).please(),
            ),
          )
          .please(),
      );
    };
    observe("review");
    await installFrontendSessionActions(page, frontendServices);
    await installAttachedTerminalSubstitute(page);
    await openFrontendTakenBacklog(page);
    const listed = cardSessionEntry(page, readyStory, "Execution");
    await expect(sessionStateOf(listed)).toHaveText("Ready for review");
    const panel = await openCardSessionTerminal(page, readyStory, "Execution");

    observe("working");
    await setPageVisibility(page, "hidden");
    await setPageVisibility(page, "visible");
    await expect(sessionStateOf(listed)).toHaveText("Working");

    const question = await expectAsked(panel, stillWorking);
    await markDone(question);
    await expect(panel).toHaveCount(0);
    await expect(listed).toHaveCount(0);
  });
});
