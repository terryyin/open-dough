// Ad hoc sessions occupy Taken without a story card, against a controlled
// machine read, delete boundary
// (../../tests/support/frontendSessionActions.ts) and attached terminal: a
// blocked one reads Needs input in Taken and the sidebar, which counts it;
// with the listing unreadable its record can be deleted from Taken, leaving
// the sidebar and moving the keyboard to the next entry; and with Open Dough
// already shown its Sessions sidebar Session entry brings its Taken entry into
// view. Opening one from another project, Mark as done and reopening are
// ../../../e2e/sessions/agent-launch-ad-hoc-sessions.spec.ts.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { installFrontendSessionActions } from "../../tests/support/frontendSessionActions.ts";
import { putFrontendMachine } from "../../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../../tests/support/frontendServiceSubstitutes.ts";
import { askToDeleteRecord } from "../../tests/support/sessionEntryDisclosure.ts";
import { takenAdHocSession } from "../../tests/support/startedAdHocSession.ts";
import { parts, sessionStateOf } from "../../tests/dashboardPage.ts";
import { showColumn } from "../../tests/boardPage.ts";
import { takenStory } from "../../tests/launchJourney.ts";
import { expectSessionShown } from "../../tests/sessionStatePace.ts";
import {
  expectSessionsSidebarSessionEntryShown,
  sessionsSidebarParts,
} from "../../tests/sessionsSidebarPage.ts";
import { expectCovering } from "../../tests/sidePanelWidthPage.ts";
import {
  closeTerminal,
  terminalPanel,
  terminalScreenParts,
} from "../../tests/terminalScreenPage.ts";
import type { SessionState } from "../../src/launchRecord.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// The machine observes Open Dough's ad hoc session asking `text`, launched
// at `at`, in `state`.
const adHoc = (text: string, state: SessionState, at?: string) => {
  const record = makeMe.aLaunchRecord.adHoc({ instruction: text, title: text });
  if (at !== undefined) record.launchedAt(at);
  return makeMe.anObservedLaunch
    .of(record.please())
    .withSessionState(state)
    .please();
};

test("a blocked ad hoc session reads Needs input in Taken and the sidebar, and the sidebar counts it", async ({
  page,
  frontendServices,
}) => {
  const text = "what is blocking us?";
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        adHoc(
          text,
          makeMe.aSessionState
            .loaded("waiting")
            .waitingFor("input needed")
            .please(),
        ),
      )
      .please(),
  );
  await openFrontendTakenBacklog(page);
  const { button, entries, badge } = sessionsSidebarParts(page);
  const local = takenAdHocSession(page, text);

  await expectSessionShown(local, "Needs input: input needed", true);
  await expect(badge).toHaveText("1");
  await expect(badge).toHaveAccessibleName("1 session needs attention");
  await button.click();
  await expect(badge).toHaveText("1");
  await expectSessionsSidebarSessionEntryShown(
    entries.first(),
    "Needs input: input needed",
    "needs-input",
  );
});

test("with the listing unreadable, an ad hoc session's record can be deleted from Taken, leaving the sidebar and moving the keyboard to the next entry", async ({
  page,
  frontendServices,
}) => {
  const unknown = makeMe.aSessionState.unknown().please();
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        adHoc("the older question", unknown, "2026-01-01T00:00:00.000Z"),
        adHoc("the newer question", unknown, "2026-01-01T00:05:00.000Z"),
      )
      .please(),
  );
  await installFrontendSessionActions(page, frontendServices);
  await openFrontendTakenBacklog(page);
  const { entries, button } = sessionsSidebarParts(page);
  const older = takenAdHocSession(page, "the older question");
  const newer = takenAdHocSession(page, "the newer question");
  await button.click();
  await expect(entries).toHaveCount(2);

  await expect(sessionStateOf(newer)).toHaveText(
    "State unknown: Claude Code's session list could not be read",
  );
  await showColumn(page, "Taken");
  await (await askToDeleteRecord(newer)).confirm.click();

  await expect(newer).toHaveCount(0);
  await expect(entries).toHaveCount(1);
  await expect(entries.first()).toContainText("the older question");
  await expect(older).toBeFocused();
  await (await askToDeleteRecord(older)).confirm.click();
  await expect(older).toHaveCount(0);
  await expect(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
  ).toBeFocused();
});

test("with Open Dough already shown, its Sessions sidebar Session entry brings its Taken entry into view", async ({
  page,
  frontendServices,
}) => {
  const text = "where is this entry?";
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(adHoc(text, makeMe.aSessionState.loaded("working").please()))
      .please(),
  );
  await installAttachedTerminalSubstitute(page);
  await openFrontendTakenBacklog(page);
  const { button, entry } = sessionsSidebarParts(page);
  const local = takenAdHocSession(page, text);
  await expect(local).toHaveCount(1);
  // Beside the open sidebar, the local Taken entry starts outside this viewport.
  await page.setViewportSize({ width: 700, height: 600 });
  await button.click();
  await expect(local).not.toBeInViewport();
  await entry(text).click();
  const panel = terminalPanel(page);
  await expectCovering(panel);
  await expect(terminalScreenParts(panel).heading).toContainText(text);
  await closeTerminal(panel); // covering hides Board marks; then check reveal
  await expect(local).toBeInViewport();
});
