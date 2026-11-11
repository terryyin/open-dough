// The one session a frontend-only journey on a touch device observes, and its
// terminal behind the attached-terminal substitute
// (./frontendServiceSubstitutes.ts).

import type { Page } from "@playwright/test";
import { expect, openFrontendTakenBacklog } from "./frontendApp.ts";
import {
  putFrontendMachine,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "./frontendServiceSubstitutes.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { tapWhereShown } from "../pageLayout.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

// The machine observes `record`'s session at work, the substitute stands in
// for its attachment, and a tap on its Sessions sidebar entry opens the
// Terminal panel. Gives the substitute's record of what the page sent, and
// where the journey finds the terminal: its rows, the screen a finger moves
// on, and the textarea a key is pressed in.
export async function openFrontendTerminalByTouch(
  page: Page,
  frontendServices: FrontendServiceState,
  record: LaunchRecord,
  substitute: Parameters<typeof installAttachedTerminalSubstitute>[1] = {},
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
  await tapWhereShown(sidebar.button);
  await expect(sidebar.sidebar).toBeVisible();
  await expect(sidebar.entries).toHaveCount(1);
  await tapWhereShown(sidebar.entry(record.request.title));
  const panel = page.getByRole("region", { name: "Terminal" });
  await expect(panel).toBeVisible();
  return {
    ...traffic,
    panel,
    rows: panel.locator(".xterm-rows"),
    screen: panel.locator(".xterm-screen"),
    input: panel.locator("textarea.xterm-helper-textarea"),
  };
}
