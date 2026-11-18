import type { BrowserCommandContext } from "vitest/node";
import { largeBacklog, queuedTitles } from "../accessibleBoard.ts";
import { boardPositionKey } from "../boardColumnNavigation.ts";
import { readyStory } from "../launchJourney.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";
import { defaultFrontendServiceState } from "./frontendServiceState.ts";

export const phoneBoardCommands = { phoneBoardPublication };

function phoneBoardPublication(...[, long]: [BrowserCommandContext, boolean]) {
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
    answers: {
      projects,
      revision,
      backlog,
      files,
      locations,
      candidates,
      machine,
      hostStatus,
      doneBySource,
    },
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
    phoneBoardPublication(
      long: boolean,
    ): Promise<ReturnType<typeof phoneBoardPublication>>;
  }
}
