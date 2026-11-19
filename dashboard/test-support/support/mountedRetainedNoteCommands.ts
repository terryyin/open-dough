// The boards a Taken note is kept across, built in Node: the Taken story's
// kept story-branch launch with its review and `story.txt` diff, the same story
// after a new launch, then the story Done with no workspace or launch records.
// Notes cross mounts on the mounted notes rule, so these boards arrange none.
import { boardPositionKey } from "../boardColumnNavigation.ts";
import { describedBacklog } from "../describedRevisions.ts";
import { takenIdentity, takenStory } from "../launchJourney.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  defaultFrontendServiceState,
  frontendStoryLaunch,
  putFrontendDoneRecords,
} from "./frontendServiceState.ts";
import { keepTakenReviewLaunch } from "./frontendStoryReviewOpen.ts";
import {
  frontendFileDiff,
  frontendReviewSnapshot,
} from "./frontendStoryReviewFixtures.ts";
import { openDoughSource } from "./frontendPublishedFixtures.ts";
import { serviceAnswers } from "./mountedDashboardCommands.ts";

export function retainedNoteBoards() {
  const project = openDoughSource.id;
  const reviewed = defaultFrontendServiceState();
  keepTakenReviewLaunch(reviewed);
  const relaunched = defaultFrontendServiceState({
    machine: makeMe.aMachineAnswer
      .observingOpen(
        frontendStoryLaunch("executing", takenStory)
          .inClaudeSession({
            sessionId: "second-story-launch",
            shortId: "second",
          })
          .please(),
      )
      .please(),
  });
  const done = defaultFrontendServiceState({
    backlog: describedBacklog(
      makeMe.aRepository
        .withRevision("story-completed", { backlog: { queued: [] } })
        .please(),
    ),
  });
  putFrontendDoneRecords(done, project, [
    makeMe.aDoneRecord
      .with({
        identity: takenIdentity,
        title: takenStory,
        completedAt: new Date().toISOString(),
      })
      .please(),
  ]);
  return {
    boardPositionKey,
    story: { title: takenStory, identity: takenIdentity },
    reviewed: {
      ...serviceAnswers(reviewed),
      review: {
        snapshot: frontendReviewSnapshot(),
        files: { "story.txt": frontendFileDiff("story.txt", ["+Kept line"]) },
      },
    },
    relaunched: serviceAnswers(relaunched),
    done: serviceAnswers(done),
  };
}

declare module "vitest/browser" {
  interface BrowserCommands {
    retainedNoteBoards(): Promise<ReturnType<typeof retainedNoteBoards>>;
  }
}
