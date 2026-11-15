// Delete record… on a card's session, against a controlled machine read and
// delete boundary (../../tests/support/frontendSessionActions.ts): a State
// unknown or Session unavailable entry asks in place, with the keyboard on
// Keep; Keep and Escape delete nothing; confirming removes the entry from its
// card, Recently done and the Sessions sidebar without a success message and
// moves the keyboard to the card. Working and Needs input offer none. How
// the boundary deletes a record is
// ../../backend-tests/sessions/agent-launch-delete.spec.ts; real deletions from
// a card and Recently done are
// ../../../e2e/sessions/agent-launch-recent-delete*.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { cardSession } from "../../tests/support/frontendCardSessions.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import { putFrontendMachine } from "../../tests/support/frontendServiceState.ts";
import {
  askToDeleteRecord,
  deleteRecordQuestion,
  sessionAction,
} from "../../tests/support/sessionEntryDisclosure.ts";
import {
  expectMembership,
  parts,
  sessionStateOf,
  standaloneSessionName,
  storyCardAttentionOf,
  storyCardSessionOf,
  storyCardSessions,
} from "../../tests/dashboardPage.ts";
import {
  backlogLaunchers,
  takenBacklogStories,
} from "../../tests/launchStoryCardPage.ts";
import { notRefinedStory, readyStory } from "../../tests/launchJourney.ts";
import { sessionsSidebarParts } from "../../tests/sessionsSidebarPage.ts";
import { openTerminalControl } from "../../tests/terminalScreenPage.ts";
import type { SessionState } from "../../src/launchRecord.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const question =
  "Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.";

const readyExecution = (state: SessionState) =>
  cardSession("Execution", readyStory, state);

test("Delete record… on a State unknown entry asks first, Keep and Escape delete nothing, and confirming removes the entry everywhere and moves the keyboard", async ({
  page,
  frontendServices,
}) => {
  const unknown = readyExecution(makeMe.aSessionState.unknown().please());
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer.observing(unknown).please(),
  );
  const actions = await installFrontendSessionActions(page, frontendServices);
  await openFrontendTakenBacklog(page);
  const { card } = backlogLaunchers(page);
  const sidebar = sessionsSidebarParts(page);
  const execution = storyCardSessionOf(card(readyStory), "Execution");
  const inRecent = parts(page).recentlyDone.getByRole("article", {
    name: standaloneSessionName("Execution", readyStory),
  });
  const deleteButton = () => sessionAction(execution, "Delete record…");
  const asked = deleteRecordQuestion(execution);

  await test.step("the entry says State unknown and offers Delete record…", async () => {
    await sidebar.button.click();
    await expect(sidebar.entries).toHaveCount(1);
    await expect(sessionStateOf(execution)).toHaveText(
      "State unknown: Claude Code's session list could not be read",
    );
    await expect(await deleteButton()).toBeVisible();
    await expect(storyCardAttentionOf(card(readyStory))).toHaveCount(0);
  });

  await test.step("pressing it asks in place, keeping the entry's words and Open terminal, with the keyboard on Keep", async () => {
    const cardTop = () =>
      card(readyStory).evaluate((element) => {
        const region = element.closest(".board-scroll");
        return element.getBoundingClientRect().top + (region?.scrollTop ?? 0);
      });
    const before = await cardTop();

    await askToDeleteRecord(execution);

    await expect(asked.question).toHaveAccessibleName(question);
    await expect(asked.confirm).toBeEnabled();
    await expect(asked.keep).toBeFocused();
    await expect(await deleteButton()).toHaveCount(0);
    await expect(sessionStateOf(execution)).toContainText("State unknown");
    await expect(openTerminalControl(execution)).toBeVisible();
    expect(await cardTop()).toBe(before);
  });

  await test.step("Keep restores the button with the keyboard on it and deletes nothing", async () => {
    await asked.keep.click();

    await expect(await deleteButton()).toBeFocused();
    await expect(asked.question).toHaveCount(0);
  });

  await test.step("Escape does the same", async () => {
    await askToDeleteRecord(execution);
    await expect(asked.keep).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(await deleteButton()).toBeFocused();
    await expect(asked.question).toHaveCount(0);
    expect(actions.asked("delete")).toEqual([]);
  });

  await test.step("Delete record removes the entry from the card, Recently done and the sidebar without a success announcement, and moves the keyboard to the card", async () => {
    await (await askToDeleteRecord(execution)).confirm.click();

    await expect(execution).toHaveCount(0);
    await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
    await expect(inRecent).toHaveCount(0);
    await expect(sidebar.entries).toHaveCount(0);
    await expect(card(readyStory)).toBeFocused();
    await expect(
      page.getByText("Session record deleted", { exact: true }),
    ).toHaveCount(0);
    expect(actions.asked("delete")).toEqual([unknown.session.sessionId]);
    await expectMembership(page, takenBacklogStories);
  });
});

test("a Session unavailable entry offers Delete record…, asks, and confirming removes it from its card, Recently done and the sidebar", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(readyExecution(makeMe.aSessionState.unavailable().please()))
      .please(),
  );
  await installFrontendSessionActions(page, frontendServices);
  await openFrontendTakenBacklog(page);
  const { card } = backlogLaunchers(page);
  const sidebar = sessionsSidebarParts(page);
  const unavailable = storyCardSessionOf(card(readyStory), "Execution");
  await sidebar.button.click();
  await expect(sidebar.entries).toHaveCount(1);
  await expect(sessionStateOf(unavailable)).toHaveText("Session unavailable");

  const asked = await askToDeleteRecord(unavailable);

  await expect(asked.question).toHaveAccessibleName(question);
  await expect(asked.keep).toBeFocused();

  await asked.confirm.click();

  await expect(unavailable).toHaveCount(0);
  await expect(
    parts(page).recentlyDone.getByRole("article", {
      name: standaloneSessionName("Execution", readyStory),
    }),
  ).toHaveCount(0);
  await expect(sidebar.entries).toHaveCount(0);
  await expect(
    page.getByText("Session record deleted", { exact: true }),
  ).toHaveCount(0);
  await expect(storyCardSessions(card(readyStory))).toHaveCount(0);
});

test("a Working or Needs input entry offers no Delete record…", async ({
  page,
  frontendServices,
}) => {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        cardSession(
          "Refinement",
          readyStory,
          makeMe.aSessionState.loaded("waiting").please(),
        ),
        cardSession(
          "Execution",
          notRefinedStory,
          makeMe.aSessionState.loaded("working").please(),
        ),
      )
      .please(),
  );
  await openFrontendTakenBacklog(page);
  const { card } = backlogLaunchers(page);
  const blocked = storyCardSessionOf(card(readyStory), "Refinement");
  const working = storyCardSessionOf(card(notRefinedStory), "Execution");

  for (const [entry, words] of [
    [blocked, "Needs input"],
    [working, "Working"],
  ] as const) {
    await expect(sessionStateOf(entry)).toHaveText(words);
    await expect(
      entry.getByRole("button", { name: /^Delete record/ }),
    ).toHaveCount(0);
  }
});
