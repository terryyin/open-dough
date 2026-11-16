// Mark as done on a session its story's card lists, against a controlled
// machine read and done boundary
// (../../tests/support/frontendSessionActions.ts): a refused mark keeps the
// entry on its card, says so in its status and offers Mark as done again.
// The real mark of a session Claude Code no longer lists is
// ../../../e2e/sessions/agent-launch-story-card-done.spec.ts; why the
// boundary refuses, including a missing project folder, without stopping or
// running `claude`, is
// ../../backend-tests/sessions/agent-launch-done-refusal.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import {
  cardSession,
  cardSessionEntry,
} from "../../tests/support/frontendCardSessions.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import { sessionAction } from "../../tests/support/sessionEntryDisclosure.ts";
import { markDoneAnyway } from "../../tests/support/markDone.ts";
import { parts, sessionEntriesIn } from "../../tests/dashboardPage.ts";
import { readyStory } from "../../tests/launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("a refused mark keeps the session on its card and says so on its entry", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
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
  const actions = await installFrontendSessionActions(page, frontendServices);
  await openFrontendTakenBacklog(page);
  const entry = cardSessionEntry(page, readyStory, "Execution");
  await expect(entry).toHaveCount(1);
  const recent = sessionEntriesIn(parts(page).recentlyDone);
  await expect(recent).toHaveCount(0);
  actions.refuseNext("done", "The project folder could not be found.");

  await markDoneAnyway(entry);

  await expect(entry.getByRole("status")).toHaveText(
    "The session could not be marked done.",
  );
  await expect(entry).toHaveCount(1);
  await expect(recent).toHaveCount(0);
  await expect(await sessionAction(entry, "Mark as done")).toBeEnabled();
  expect(actions.asked("done")).toHaveLength(1);
});
