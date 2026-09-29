// A card's launches: on a Backlog card, one Start action per workflow in the
// order `launchWorkflows` offers them, whatever sessions are listed; on every
// card, the story's sessions that have not been marked done (`cardSessionsOf`),
// newest first, each shown as Recent sessions shows it without the story the
// card already names. A launch from the card lists its session here and takes
// the keyboard to it. Sessions are local evidence: whatever they show, origin
// alone places the story.

import { useState } from "react";
import type { WorkEntry } from "./publishedWork.ts";
import {
  cardSessionsOf,
  launchWorkflowNames,
  launchWorkflows,
} from "./agentLaunch.ts";
import type { ProjectLaunches } from "./agentLaunches.ts";
import { StartLaunch } from "./StartLaunch.tsx";
import { SessionEntry } from "./SessionEntry.tsx";

export function CardLaunches({
  entry,
  launches,
  offersStart,
}: {
  entry: WorkEntry;
  launches: ProjectLaunches;
  // Backlog cards only: Taken work offers no launch.
  offersStart: boolean;
}) {
  // The session the developer's own launch from this card just listed.
  const [launchedHere, setLaunchedHere] = useState<string | undefined>();
  const sessions = cardSessionsOf(launches.records, entry.identity);
  return (
    <>
      {offersStart &&
        launchWorkflowNames.map((workflow) => (
          <StartLaunch
            key={workflow}
            work={entry}
            workflow={workflow}
            note={launchWorkflows[workflow].note(entry)}
            attempt={launches.attemptOf(entry.identity, workflow)}
            onStart={async (instruction) => {
              const record = await launches.start(entry, workflow, instruction);
              if (record === undefined) return false;
              setLaunchedHere(record.session.sessionId);
              return true;
            }}
          />
        ))}
      {sessions.length > 0 && (
        <ol className="card-sessions" aria-label="Sessions">
          {sessions.toReversed().map((record) => (
            <li key={record.session.sessionId}>
              <SessionEntry
                record={record}
                namesStory={false}
                takesFocus={launchedHere === record.session.sessionId}
              />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
