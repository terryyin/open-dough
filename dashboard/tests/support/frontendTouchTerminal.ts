// The one session a frontend-only journey on a touch device observes, and its
// terminal behind the attached-terminal substitute
// (./frontendServiceSubstitutes.ts), with the size that terminal last reported
// and the finger travel that swipes over its rows. The fine-pointer desktop
// those journeys are contrasted with opens the same terminal by mouse.

import type { Locator, Page } from "@playwright/test";
import { expect, openFrontendTakenBacklog } from "./frontendApp.ts";
import {
  putFrontendMachine,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "./frontendServiceSubstitutes.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { box, tapWhereShown } from "../pageLayout.ts";
import { terminalPanel, terminalScreenParts } from "../terminalScreenPage.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

type Substitute = Parameters<typeof installAttachedTerminalSubstitute>[1];

// The machine observes `record`'s session at work, the substitute stands in
// for its attachment, and its Sessions sidebar entry, reached as `press`
// presses a control, opens the Terminal panel. Gives the substitute's record
// of what the page sent, and where the journey finds the terminal: its rows,
// the screen a finger moves on, and the textarea a key is pressed in.
async function openFrontendTerminal(
  page: Page,
  frontendServices: FrontendServiceState,
  record: LaunchRecord,
  substitute: Substitute,
  press: (control: Locator) => Promise<void>,
) {
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(record)
          .withSessionState(makeMe.aSessionState.loaded("working").please())
          .please(),
      )
      .please(),
  );
  const traffic = await installAttachedTerminalSubstitute(page, substitute);
  await openFrontendTakenBacklog(page);
  const sidebar = sessionsSidebarParts(page);
  await press(sidebar.button);
  await expect(sidebar.sidebar).toBeVisible();
  await expect(sidebar.entries).toHaveCount(1);
  await press(sidebar.entry(record.request.title));
  const panel = terminalPanel(page);
  await expect(panel).toBeVisible();
  return {
    ...traffic,
    panel,
    ...terminalScreenParts(panel),
  };
}

// By a tap where each control is shown.
export function openFrontendTerminalByTouch(
  page: Page,
  frontendServices: FrontendServiceState,
  record: LaunchRecord,
  substitute: Substitute = {},
) {
  return openFrontendTerminal(
    page,
    frontendServices,
    record,
    substitute,
    tapWhereShown,
  );
}

// By a mouse click, where the page has no touch.
export function openFrontendTerminalByMouse(
  page: Page,
  frontendServices: FrontendServiceState,
  record: LaunchRecord,
  substitute: Substitute = {},
) {
  return openFrontendTerminal(
    page,
    frontendServices,
    record,
    substitute,
    (control) => control.click(),
  );
}

// The size the page last reported for its terminal, among the `sizes` the
// substitute recorded.
export function reportedSize<Size>(sizes: readonly Size[]): Size {
  const size = sizes.at(-1);
  if (size === undefined) throw new Error("The page reported no size.");
  return size;
}

// How far a finger travels on the terminal's `screen`, which shows
// `shownRows` rows, for a swipe over `rows` whole rows: half a row more, so
// the rows the terminal counts do not turn on where a move ends.
export async function travelOverRows(
  screen: Locator,
  shownRows: number,
  rows: number,
) {
  const rowHeight = (await box(screen)).height / shownRows;
  return Math.round(rowHeight * (rows + 0.5));
}
