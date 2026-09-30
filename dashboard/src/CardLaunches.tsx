// A card's launches: on a Backlog card, one Start action per workflow in the
// order `launchWorkflows` offers them, whatever sessions are listed; on the
// card of a story whose start the server is running, the phase words of that
// start (`startPhaseWords`), whichever page started it; on every
// card, the story's sessions that have not been marked done (`cardSessionsOf`),
// newest first, each shown as Recent sessions shows it without the story the
// card already names, under how many of them need attention, when any do
// (`attentionSummary`). A Taken card whose story this machine started and
// holds the start of, with no session yet, also offers Start execution, which
// opens the session in the kept workspace without a second Take. A launch from
// the card lists its session here and takes the keyboard to it. Sessions are
// local evidence: whatever they show, origin alone places the story.

import { useState } from "react";
import type { LaunchChoices, LaunchWorkflow } from "./agentLaunch.ts";
import type { WorkEntry } from "./publishedWork.ts";
import {
  cardSessionsOf,
  keptStartNote,
  launchWorkflowNames,
  launchWorkflows,
  startPhaseWords,
} from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { StartLaunch } from "./StartLaunch.tsx";
import { SessionEntry } from "./SessionEntry.tsx";
import { attentionSummary } from "./sessionShown.ts";

export function CardLaunches({
  sourceId,
  entry,
  launches,
  offersStart,
}: {
  // The project whose work item the card shows.
  sourceId: string;
  entry: WorkEntry;
  launches: MachineSessions;
  // Backlog cards only: Taken work offers no launch of its own, except the
  // Start of a start this machine kept.
  offersStart: boolean;
}) {
  // The session the developer's own launch from this card just listed.
  const [launchedHere, setLaunchedHere] = useState<string | undefined>();
  const sessions = cardSessionsOf(launches.launched, sourceId, entry.identity);
  const attention = attentionSummary(sessions);
  const keptStart = offersStart
    ? undefined
    : launches.keptStartOf(sourceId, entry.identity);
  const phase = launches.startPhaseOf(sourceId, entry.identity);
  const onStart =
    (workflow: LaunchWorkflow) => async (choices: LaunchChoices) => {
      const record = await launches.start(sourceId, entry, workflow, choices);
      if (record === undefined) return false;
      setLaunchedHere(record.session.sessionId);
      return true;
    };
  return (
    <>
      {keptStart !== undefined && (
        <StartLaunch
          work={entry}
          workflow="execution"
          establishesStart
          resumesIn={keptStart.workspace}
          note={keptStartNote}
          attempt={launches.attemptOf(sourceId, entry.identity, "execution")}
          phase={phase}
          onStart={onStart("execution")}
        />
      )}
      {!offersStart && keptStart === undefined && phase !== undefined && (
        <p className="launch-answer quiet">{startPhaseWords[phase]}</p>
      )}
      {offersStart &&
        launchWorkflowNames.map((workflow) => (
          <StartLaunch
            key={workflow}
            work={entry}
            workflow={workflow}
            establishesStart={launches.establishesStart(sourceId)}
            note={launchWorkflows[workflow].note(entry)}
            attempt={launches.attemptOf(sourceId, entry.identity, workflow)}
            phase={workflow === "execution" ? phase : undefined}
            onStart={onStart(workflow)}
          />
        ))}
      {attention !== undefined && <p className="card-attention">{attention}</p>}
      {sessions.length > 0 && (
        <ol className="card-sessions" aria-label="Sessions">
          {sessions.toReversed().map((record) => (
            <li key={record.session.sessionId}>
              <SessionEntry
                record={record}
                onCard
                takesFocus={launchedHere === record.session.sessionId}
              />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
