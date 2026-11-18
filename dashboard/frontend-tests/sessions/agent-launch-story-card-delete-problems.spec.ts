// A card's Delete record… that is overtaken, refused, or fails says so and
// never brings a deleted entry back (the delete itself is
// ./agent-launch-story-card-delete.spec.ts), against a controlled machine read
// and delete boundary (../../test-support/support/frontendSessionActions.ts). Once the
// read lists the session as known the question and the button go and the
// entry shows its state; a delete the boundary answers as known keeps the
// record and says "This session's state is now known"; a refused delete says
// "The session record could not be deleted." with the boundary's reason, in
// the same exposed status that was empty before, leaving the buttons and the
// keyboard where they were, and a retry deletes without success speech; a
// read answered after the deletion does not list the session again. What the
// boundary answers for a known state or an unwritable record file is
// ../../backend-tests/sessions/agent-launch-delete.spec.ts. The page clock
// stands still unless the journey lets it pass.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { pausePageClockAt } from "../../test-support/dashboardTest.ts";
import { installFrontendSessionActions } from "../../test-support/support/frontendSessionActions.ts";
import {
  frontendStoryLaunch,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import {
  answerHeld,
  fulfillJson,
  holdAnswer,
} from "../../test-support/support/frontendSubstituteAnswers.ts";
import {
  deleteRecordQuestion,
  sessionAction,
} from "../../test-support/support/sessionEntryDisclosure.ts";
import {
  parts,
  sessionStateOf,
  standaloneSessionName,
  storyCardSessionOf,
  storyCardSessions,
} from "../../test-support/dashboardPage.ts";
import { backlogLaunchers } from "../../test-support/launchStoryCardPage.ts";
import { readyStory } from "../../test-support/launchJourney.ts";
import { givePageItsTurns } from "../../test-support/pageRequestNotes.ts";
import { watchRecordReads } from "../../test-support/sessionStatePace.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import type { SessionState } from "../../src/launchRecord.ts";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const unknownWords =
  "State unknown: Claude Code's session list could not be read";
const question =
  "Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.";

const execution = frontendStoryLaunch("executing", readyStory).please();

// The machine's read observes the card's execution session in `state`.
function observeExecution(services: FrontendServiceState, state: SessionState) {
  services.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch.of(execution).withSessionState(state).please(),
      )
      .please(),
  );
}

async function unknownSession(page: Page, services: FrontendServiceState) {
  await pausePageClockAt(page, new Date());
  const pace = await watchRecordReads(page);
  observeExecution(services, makeMe.aSessionState.unknown().please());
  const actions = await installFrontendSessionActions(page, services);
  await openFrontendTakenBacklog(page);
  const { card } = backlogLaunchers(page);
  const entry = storyCardSessionOf(card(readyStory), "Execution");
  await expect(sessionStateOf(entry)).toHaveText(unknownWords);
  return {
    card,
    entry,
    actions,
    pace,
    inRecent: parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Execution", readyStory),
    }),
    deleteButton: await sessionAction(entry, "Delete record…"),
    ...deleteRecordQuestion(entry),
    status: entry.getByRole("status"),
  };
}

test("the question and Delete record… go when a later read lists the session as known, deleting nothing", async ({
  page,
  frontendServices,
}) => {
  const s = await unknownSession(page, frontendServices);
  await s.deleteButton.click();
  await expect(s.question).toHaveAccessibleName(question);

  observeExecution(
    frontendServices,
    makeMe.aSessionState.loaded("working").please(),
  );
  await s.pace.passOnePace();

  await expect(sessionStateOf(s.entry)).toHaveText("Working");
  await expect(s.question).toHaveCount(0);
  await expect(s.deleteButton).toHaveCount(0);
  await expect(s.confirm).toHaveCount(0);
  expect(s.actions.asked("delete")).toEqual([]);
});

test("a click that finds the state known keeps the record and says so beside the state", async ({
  page,
  frontendServices,
}) => {
  const s = await unknownSession(page, frontendServices);
  // The boundary's own reading finds it working before the page reads again.
  observeExecution(
    frontendServices,
    makeMe.aSessionState.loaded("working").please(),
  );
  await s.deleteButton.click();
  await expect(s.question).toHaveAccessibleName(question);

  await s.confirm.click();

  await expect(s.status).toContainText("This session's state is now known");
  await expect(sessionStateOf(s.entry)).toHaveText("Working");
  await expect(s.question).toHaveCount(0);
  await expect(s.deleteButton).toHaveCount(0);
  await expect(s.inRecent).toHaveCount(0);
});

test("a refused delete reports its first failure in the persistent card entry status, retains buttons and focus, and retries without success speech", async ({
  page,
  frontendServices,
}) => {
  const s = await unknownSession(page, frontendServices);
  const { status, confirm, keep } = s;
  await expect(status).toHaveCount(1);
  await expect(status).toBeEmpty();
  expect(
    await status.evaluate((region) => {
      region.setAttribute("data-known", "empty-entry-status");
      for (let at: Element | null = region; at; at = at.parentElement) {
        const style = getComputedStyle(at);
        if (
          style.display === "none" ||
          style.visibility !== "visible" ||
          at.hasAttribute("hidden") ||
          at.getAttribute("aria-hidden") === "true"
        )
          return false;
      }
      return true;
    }),
  ).toBe(true);
  await s.deleteButton.click();
  const reason = "EACCES: permission denied, unlink 'launches.json'";
  s.actions.refuseNext(
    "delete",
    `The session record could not be deleted: ${reason}`,
    500,
  );

  await confirm.click();

  await expect(status).toHaveText(
    `The session record could not be deleted. ${reason}`,
  );
  await expect(status).toHaveAttribute("data-known", "empty-entry-status");
  await expect(status).toBeVisible();
  await expect(s.question).toHaveAccessibleName(question);
  await expect(confirm).toBeEnabled();
  await expect(keep).toBeEnabled();
  await expect(confirm).toBeFocused();
  await expect(s.entry).toBeVisible();
  await expect(s.inRecent).toHaveCount(0);

  await confirm.click();

  await expect(s.entry).toHaveCount(0);
  await expect(s.inRecent).toHaveCount(0);
  await expect(s.card(readyStory)).toBeFocused();
  await expect(
    page.getByText("Session record deleted", { exact: true }),
  ).toHaveCount(0);
  expect(s.actions.asked("delete")).toHaveLength(2);
});

test("a read asked before the deletion and answered after it does not bring the entry back", async ({
  page,
  frontendServices,
}) => {
  const s = await unknownSession(page, frontendServices);
  // The next read is answered as the machine was when it was asked, and
  // that answer reaches the page only once released.
  const { held, hold } = holdAnswer(page);
  let holding = true;
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
      if (route.request().method() !== "GET" || !holding)
        return route.fallback();
      holding = false;
      const answered = structuredClone(frontendServices.machine);
      return answerHeld(hold, () => fulfillJson(route, answered));
    },
  );
  await page.clock.runFor(checkIntervalMs);
  await held.received;
  await s.deleteButton.click();
  await s.confirm.click();
  await expect(s.entry).toHaveCount(0);

  held.release();
  await held.delivered;
  await givePageItsTurns(page);
  await givePageItsTurns(page);

  await expect(s.entry).toHaveCount(0);
  await expect(s.inRecent).toHaveCount(0);
  await expect(storyCardSessions(s.card(readyStory))).toHaveCount(0);
});
