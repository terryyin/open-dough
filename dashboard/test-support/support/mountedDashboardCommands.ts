import type { BrowserCommandContext } from "vitest/node";
import { largeBacklog, queuedTitles } from "../accessibleBoard.ts";
import { boardPositionKey } from "../boardColumnNavigation.ts";
import { readyStory } from "../launchJourney.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";
import { defaultFrontendServiceState } from "./frontendServiceState.ts";

export const mountedDashboardCommands = {
  dashboardServiceAnswers,
  phoneBoardPublication,
};

function serviceAnswers(long: boolean) {
  const {
    projects,
    revision,
    backlog,
    files,
    locations,
    candidates,
    machine,
    hostStatus,
    doneBySource,
  } = defaultFrontendServiceState(long ? { backlog: largeBacklog } : {});
  return {
    projects,
    revision,
    backlog,
    files,
    locations,
    candidates,
    machine,
    hostStatus,
    doneBySource,
  };
}

export type MountedServiceAnswers = ReturnType<typeof serviceAnswers>;

function dashboardServiceAnswers() {
  return { answers: serviceAnswers(false), boardPositionKey };
}

function phoneBoardPublication(...[, long]: [BrowserCommandContext, boolean]) {
  return {
    answers: serviceAnswers(long),
    boardPositionKey,
    readyStory,
    titles: long
      ? {
          backlog: queuedTitles,
          taken: ["Repair the installer's update report"],
        }
      : takenBacklogStories,
  };
}

declare module "vitest/browser" {
  interface BrowserCommands {
    dashboardServiceAnswers(): Promise<
      ReturnType<typeof dashboardServiceAnswers>
    >;
    phoneBoardPublication(
      long: boolean,
    ): Promise<ReturnType<typeof phoneBoardPublication>>;
  }
}
