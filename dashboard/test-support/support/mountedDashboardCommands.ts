import type { BrowserCommandContext } from "vitest/node";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { renderSlicePlan } from "../../../Distribution/tests/support/published-plan.mjs";
import { renderStorySection } from "../../../Distribution/tests/support/published-seed.mjs";
import { sessionKey } from "../../src/sessionReference.ts";
import { largeBacklog, queuedTitles } from "../accessibleBoard.ts";
import { boardPositionKey } from "../boardColumnNavigation.ts";
import { backlogApart, describedRevisions } from "../describedRevisions.ts";
import { takenBacklogStories } from "../launchStoryCardPage.ts";
import { readyStory } from "../launchJourney.ts";
import {
  defaultFrontendServiceState,
  putFrontendPublished,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export const mountedDashboardCommands = {
  dashboardServiceAnswers,
  phoneBoardPublication,
  scanEmphasisBoard,
};

function serviceAnswers(state: FrontendServiceState) {
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
  } = state;
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
  return {
    answers: serviceAnswers(defaultFrontendServiceState()),
    boardPositionKey,
  };
}

function phoneBoardPublication(...[, long]: [BrowserCommandContext, boolean]) {
  return {
    answers: serviceAnswers(
      defaultFrontendServiceState(long ? { backlog: largeBacklog } : {}),
    ),
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

// A Taken story with one of three slices done, an open execution session and
// a Done refinement session.
function scanEmphasisBoard() {
  const title = "Scan emphasis story";
  const identity = "SEED-414#scan-emphasis";
  const story = makeMe.aBacklogEntry
    .with({ title, identity, href: "seeds/SEED-414-scan.md#scan-emphasis" })
    .please();
  const { A } = describedRevisions(
    makeMe.aRepository
      .withRevision("A", {
        backlog: { taken: [story], queued: [] },
        files: {
          ".planning/seeds/SEED-414-scan.md": `---
id: SEED-414
---

# Scan emphasis

${renderStorySection(story)}`,
          ".planning/slice-plans/414-scan/PLAN.md": renderSlicePlan(
            makeMe.aSlicePlan
              .withStatuses(["done", "planned", "planned"])
              .please(),
          ),
        },
        storyStates: [
          {
            identity,
            href: story.href,
            ...makeMe.aStoryPreparation
              .plannedIn("../slice-plans/414-scan/PLAN.md")
              .please(),
          },
        ],
      })
      .please(),
    { A: "a1".repeat(20) },
  );
  const open = makeMe.aLaunchRecord
    .executing({ identity, title })
    .inClaudeSession({ sessionId: "scan-open-execution" })
    .please();
  const done = makeMe.aLaunchRecord
    .refining({ identity, title })
    .inClaudeSession({ sessionId: "scan-done-refinement" })
    .launchedAt(new Date(Date.now() - 120_000).toISOString())
    .markedDoneAt(new Date(Date.now() - 60_000).toISOString())
    .please();
  const state = defaultFrontendServiceState();
  putFrontendPublished(state, backlogApart(A));
  state.answerMachine(
    makeMe.aMachineAnswer.observingOpen(open).observingDone(done).please(),
  );
  return {
    answers: serviceAnswers(state),
    boardPositionKey,
    title,
    openSession: sessionKey(open.session),
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
    scanEmphasisBoard(): Promise<ReturnType<typeof scanEmphasisBoard>>;
  }
}
