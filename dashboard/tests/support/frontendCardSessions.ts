// Sessions on the substitute project's story cards for frontend-only
// journeys: the kept launches the machine's read observes
// (./frontendServiceState.ts), each attachable through the attached-terminal
// substitute (./frontendServiceSubstitutes.ts), and the Terminal panel a
// card entry's Open terminal opens.

import type { Page } from "@playwright/test";
import { expect, takenStoryCard } from "./frontendApp.ts";
import {
  frontendStoryLaunch,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "./frontendTerminalSubstitute.ts";
import { takenStory } from "../launchJourney.ts";
import { storyCardSessionOf } from "../dashboardPage.ts";
import { backlogLaunchers } from "../launchStoryCardPage.ts";
import type { Workflow } from "../storyColumnsPage.ts";
import {
  openTerminalControl,
  terminalPanel,
  terminalScreenParts,
} from "../terminalScreenPage.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import type { SessionState } from "../../src/launchRecord.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

// The `workflow` session of the story titled `title`, observed in `state`.
export function cardSession(
  workflow: Workflow,
  title: string,
  state: SessionState,
): LaunchWithState {
  return makeMe.anObservedLaunch
    .of(
      frontendStoryLaunch(
        workflow === "Execution" ? "executing" : "refining",
        title,
      ).please(),
    )
    .withSessionState(state)
    .please();
}

// The Backlog card's `workflow` session entry of the story titled `title`.
export const cardSessionEntry = (
  page: Page,
  title: string,
  workflow: Workflow,
) => storyCardSessionOf(backlogLaunchers(page).card(title), workflow);

// Opens that entry's terminal and waits until it shows its attachment.
export async function openCardSessionTerminal(
  page: Page,
  title: string,
  workflow: Workflow,
) {
  await openTerminalControl(cardSessionEntry(page, title, workflow)).click();
  const panel = terminalPanel(page);
  await expect(terminalScreenParts(panel).rows).toContainText("attached");
  return panel;
}

// The Taken story's working Execution session as the machine's read observes it.
export const takenStoryWorking = () =>
  cardSession(
    "Execution",
    takenStory,
    makeMe.aSessionState.loaded("working").please(),
  );

// That session, attachable through the attached-terminal substitute (its
// `sizes` and `attaches`). `openTerminal` opens it from the Taken card and
// waits until it shows its attachment.
export async function takenStoryWorkingSession(
  page: Page,
  services: FrontendServiceState,
) {
  services.answerMachine(
    makeMe.aMachineAnswer.observing(takenStoryWorking()).please(),
  );
  const terminal = await installAttachedTerminalSubstitute(page);
  const panel = terminalPanel(page);
  const openTerminal = async () => {
    await openTerminalControl(
      storyCardSessionOf(takenStoryCard(page), "Execution"),
    ).click();
    await expect(terminalScreenParts(panel).rows).toContainText("attached");
    return panel;
  };
  return { ...terminal, openTerminal };
}
