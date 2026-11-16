// The accepted Compact card hierarchy, against a controlled machine read,
// done boundary (../../tests/support/frontendSessionActions.ts) and attached
// terminal: status and main access stay visible, routine facts and lifecycle
// controls disclose independently, keyboard and narrow reading keep both
// reachable. A Cursor entry's resume command is
// ./compact-session-entry-cursor.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import {
  frontendStoryLaunch,
  type FrontendServiceState,
} from "../../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import {
  doneQuestion,
  keepOpen,
  markAsDone,
  markDoneAnyway,
} from "../../tests/support/markDone.ts";
import {
  sessionActionsControl,
  sessionDetailsControl,
} from "../../tests/support/sessionEntryDisclosure.ts";
import { setPageVisibility } from "../../tests/autoRefreshJourney.ts";
import {
  parts,
  sessionEntriesIn,
  sessionIdLineOf,
  sessionStateOf,
  storyCardSessions,
} from "../../tests/dashboardPage.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import { readyStory } from "../../tests/launchJourney.ts";
import { reloadUntilRead } from "../../tests/pageRequestNotes.ts";
import { closeSidePanel } from "../../tests/sidePanelFrame.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../../tests/terminalScreenPage.ts";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// The machine observes `record`'s session in `state`.
function observe(
  services: FrontendServiceState,
  record: LaunchRecord,
  state: SessionState,
) {
  services.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch.of(record).withSessionState(state).please(),
      )
      .please(),
  );
}

test("a compact session discloses technical details and secondary actions without hiding attention or terminal access", async ({
  page,
  frontendServices,
}) => {
  const record = frontendStoryLaunch("executing", readyStory)
    .requestingModel("sonnet")
    .requestingEffort("medium")
    .please();
  const id = record.session.sessionId;
  frontendServices.answerMachine(makeMe.aMachineAnswer.please());
  await installFrontendSessionActions(page, frontendServices);
  await installAttachedTerminalSubstitute(page);
  await openFrontendTakenBacklog(page);
  const { card } = backlogLaunchers(page);
  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  // The story's execution session starts, and the page reads it again.
  observe(
    frontendServices,
    record,
    makeMe.aSessionState.loaded("working").please(),
  );
  await setPageVisibility(page, "hidden");
  await setPageVisibility(page, "visible");
  const entry = storyCardSessions(card(readyStory));
  await expect(sessionStateOf(entry)).toHaveText("Working");
  const details = sessionDetailsControl(entry);
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(sessionIdLineOf(entry, id)).toBeHidden();
  const effort = entry.getByText("Effort: medium (requested)", { exact: true });
  await expect(effort).toBeHidden();
  await expect(
    entry.getByText("Model: Sonnet (requested)", { exact: true }),
  ).toBeVisible();
  await expect(entry.getByText("Claude Code", { exact: true })).toBeVisible();
  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeHidden();
  await card(readyStory)
    .getByRole("button", { name: "Inspect story", exact: true })
    .click();
  await expect(card(readyStory).getByText(/^Assessment: Ready/)).toBeVisible();
  await card(readyStory)
    .getByRole("button", { name: "Hide detail", exact: true })
    .click();
  const open = openTerminalControl(entry);
  await expect(open).toBeVisible();
  await expect(markAsDone(entry)).toBeHidden();

  await details.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("aria-expanded", "true");
  await expect(sessionIdLineOf(entry, id)).toBeVisible();
  await expect(effort).toBeVisible();
  await page.keyboard.press("Space");
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(details).toBeFocused();

  await open.click();
  const terminal = terminalPanel(page);
  await expect(terminalScreenParts(terminal).rows).toContainText("attached");
  await closeSidePanel(terminal);
  await expect(open).toBeFocused();

  const actions = sessionActionsControl(entry);
  await actions.focus();
  await page.keyboard.press("Enter");
  await expect(actions).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(actions).toHaveAttribute("aria-expanded", "false");
  await expect(actions).toBeFocused();
  await page.keyboard.press("Space");
  await markAsDone(entry).click();
  await expect(keepOpen(doneQuestion(entry))).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(markAsDone(entry)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(actions).toHaveAttribute("aria-expanded", "false");
  await expect(actions).toBeFocused();

  observe(
    frontendServices,
    record,
    makeMe.aSessionState
      .loaded("waiting")
      .waitingFor("Review the migration before continuing.")
      .please(),
  );
  await reloadUntilRead(page);
  await expect(sessionStateOf(entry)).toHaveText(
    "Needs input: Review the migration before continuing.",
  );
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(open).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  await details.click();
  await expect(sessionIdLineOf(entry, id)).toBeVisible();
  const bounds = await entry.boundingBox();
  if (bounds === null) throw new Error("The session entry is not laid out.");
  expect(bounds.width).toBeLessThanOrEqual(360);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(360);
  await expect(sessionEntriesIn(parts(page).recentlyDone)).toHaveCount(0);
  await markDoneAnyway(entry);
  await expect(entry).toHaveCount(0);
  await expect(
    card(readyStory).getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  const inspect = card(readyStory).getByRole("button", {
    name: "Inspect story",
    exact: true,
  });
  await inspect.focus();
  await inspect.click();
  await expect(card(readyStory).getByText(/^Assessment: Ready/)).toBeVisible();
});
