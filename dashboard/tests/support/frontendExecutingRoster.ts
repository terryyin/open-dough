// Frontend arrangement shared by the journeys that open Open Dough's agent
// roster (../../frontend-tests/navigation/story-url-destination.spec.ts and
// ../../frontend-tests/stories/agent-roster-collection.spec.ts): Open Dough
// alone at its "roster" revision, with the named agent executing its one Taken
// story (../agentRosterRecords.ts) on origin/main through Claude, plus any
// extra published files the journey names.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { backlogApart, describedRevision } from "../describedRevisions.ts";
import { openDoughFacts, takenIdentity } from "../agentRosterRecords.ts";
import {
  putFrontendPublished,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export function publishExecutingRoster(
  services: FrontendServiceState,
  agent: string,
  files?: Record<string, string>,
) {
  putFrontendPublished(
    services,
    backlogApart(
      describedRevision(
        makeMe.aRepository
          .withRevision("roster", {
            backlog: { taken: openDoughFacts.backlog.taken },
            agentProfiles: [
              makeMe.anAgentProfile
                .executing({
                  name: agent,
                  identity: takenIdentity,
                  mode: "trunk",
                  branch: "origin/main",
                  host: "claude",
                })
                .please(),
            ],
            ...(files === undefined ? {} : { files }),
          })
          .please(),
        "b3".repeat(20),
      ),
    ),
  );
}
