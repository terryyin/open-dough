import { sessionKey } from "./sessionReference.ts";
// A card's launches: on a Backlog card, one Start action per workflow in the
// order `launchWorkflows` offers them, whatever sessions are listed; on the
// card of a story starting on this machine, whichever page asked for it, what
// its local startup is doing (`StartupStatus`); on every
// card, the story's sessions that have not been marked done (`cardSessionsOf`),
// newest first, each shown as Recent sessions shows it without the story the
// card already names, under how many of them need attention, when any do
// (`attentionSummary`). A Taken card whose story this machine started and
// holds the start of, with no session yet, also offers Start execution, which
// opens the session in the kept workspace without a second Take. A launch from
// the card lists its session here once it settles and takes the keyboard to
// it. A launch this page asked for whose answer no Start on the card shows,
// as when origin moved the story to Taken meanwhile, keeps that answer on the
// card. Sessions are local evidence: whatever they show, origin alone places
// the story.

import { useId, useState } from "react";
import type { LaunchChoices, LaunchWorkflow } from "./agentLaunch.ts";
import type { WorkEntry } from "./publishedWork.ts";
import {
  cardSessionsOf,
  keptStartNote,
  launchWorkflowNames,
  launchWorkflows,
} from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { StartLaunch } from "./StartLaunch.tsx";
import { StartupStatus } from "./StartupStatus.tsx";
import { startupProtects } from "./storyStartup.ts";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import { CreationEntry } from "./CreationEntry.tsx";
import { SessionEntry } from "./SessionEntry.tsx";
import { attentionSummary } from "./sessionShown.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";

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
    : launches.keptStartOf(sourceId, entry.identity, "execution");
  const keptPreparation = offersStart
    ? launches.keptStartOf(sourceId, entry.identity, "refinement")
    : undefined;
  // A one-shot execution publishes no Take, so its kept start stays on the
  // Backlog card.
  const keptOneShot = offersStart
    ? launches.keptStartOf(sourceId, entry.identity, "execution")
    : undefined;
  // The kept start a workflow's Start resumes, if any.
  const resumesOf = (workflow: LaunchWorkflow) => {
    const kept = workflow === "refinement" ? keptPreparation : keptOneShot;
    return kept === undefined ? {} : { resumes: kept };
  };
  const startup = launches.storyStartupOf(sourceId, entry.identity);
  const unavailable = startupProtects(startup);
  const answerId = useId();
  // The answers of this page's launches that no Start on the card shows.
  const unshown = launchWorkflowNames.flatMap((workflow) => {
    if (offersStart || (workflow === "execution" && keptStart !== undefined))
      return [];
    const attempt = launches.attemptOf(sourceId, entry.identity, workflow);
    return attempt === undefined || attempt.kind === "starting"
      ? []
      : [{ workflow, problem: attempt }];
  });
  const onStart =
    (workflow: LaunchWorkflow) =>
    (choices: LaunchChoices): Promise<StartAnswer> =>
      launches.start(sourceId, entry, workflow, choices, (record) => {
        setLaunchedHere(sessionKey(record.session));
      });
  return (
    <>
      {startup !== undefined && (
        <StartupStatus
          startup={startup}
          phase={launches.startPhaseOf(
            sourceId,
            entry.identity,
            startup.workflow,
          )}
          establishesStart={launches.establishesStart(
            sourceId,
            startup.workflow,
            startup.host,
          )}
        />
      )}
      {keptStart !== undefined && (
        <StartLaunch
          work={entry}
          workflow="execution"
          establishesStart
          options={undefined}
          resumes={keptStart}
          note={keptStartNote}
          attempt={launches.attemptOf(sourceId, entry.identity, "execution")}
          unavailable={unavailable}
          onStart={onStart("execution")}
        />
      )}
      {offersStart &&
        launchWorkflowNames.map((workflow) => (
          <StartLaunch
            key={workflow}
            onHostChanged={launches.rereadOffers}
            work={entry}
            workflow={workflow}
            establishesStart={(host) =>
              launches.establishesStart(sourceId, workflow, host)
            }
            options={(host) => launches.optionsOffer(sourceId, workflow, host)}
            sessionPolicy={(host) =>
              launches.sessionPolicyOffer(sourceId, workflow, host)
            }
            {...resumesOf(workflow)}
            note={
              "resumes" in resumesOf(workflow)
                ? keptStartNote
                : launchWorkflows[workflow].note(entry)
            }
            attempt={launches.attemptOf(sourceId, entry.identity, workflow)}
            unavailable={unavailable}
            onStart={onStart(workflow)}
          />
        ))}
      {unshown.map(({ workflow, problem }) => (
        <LaunchProblemAnswer
          key={workflow}
          id={`${answerId}-${workflow}`}
          problem={problem}
        />
      ))}
      {launches.creations
        .filter(
          (record) =>
            record.request.source === sourceId &&
            "identity" in record.request &&
            record.request.identity === entry.identity,
        )
        .map((record) => (
          <CreationEntry key={record.launchedAt} record={record} />
        ))}
      {attention !== undefined && <p className="card-attention">{attention}</p>}
      {sessions.length > 0 && (
        <ol className="card-sessions" aria-label="Sessions">
          {sessions.toReversed().map((record) => (
            <li key={sessionKey(record.session)}>
              <SessionEntry
                record={record}
                onCard
                takesFocus={launchedHere === sessionKey(record.session)}
              />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
