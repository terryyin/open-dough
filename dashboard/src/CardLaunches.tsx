import { dependencyStartProblem } from "./storyDependencies.ts";
import { sessionKey } from "./sessionReference.ts";
// A card's launches: on a Backlog card, one Start action per workflow in the
// order `launchWorkflows` offers them; a second start of a story that already
// has an open session is refused at the launch boundary; on the
// card of a story starting on this machine, whichever page asked for it, what
// its local startup is doing (`StartupStatus`), with the answer of one in
// need of reconciliation left to Startup recovery; on every
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
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import { CreationEntry } from "./CreationEntry.tsx";
import { SessionEntry } from "./SessionEntry.tsx";
import { attentionSummary } from "./sessionShown.ts";
import { LaunchProblemAnswer } from "./LaunchProblemAnswer.tsx";
import { keyboardRestsOn } from "./launchHandoff.ts";
import { workCard } from "./workFocus.ts";

export function CardLaunches({
  sourceId,
  entry,
  launches,
  offersStart,
  statusId,
}: {
  // The project whose work item the card shows.
  sourceId: string;
  entry: WorkEntry;
  launches: MachineSessions;
  // Backlog cards only: Taken work offers no launch of its own, except the
  // Start of a start this machine kept.
  offersStart: boolean;
  // The id of what says the story's startup, which the card is described by.
  statusId: string;
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
  const unavailable = startup !== undefined;
  // No Start is offered before this machine's launch evidence was read: an
  // earlier startup of the story may be unresolved.
  const unoffered = unavailable || launches.attemptEvidence !== "read";
  const evidenceId = `${statusId}-evidence`;
  const unread = !unavailable && unoffered ? evidenceId : undefined;
  // A startup in need of reconciliation is answered under Startup
  // recovery, not beside the card's unavailable actions.
  const attemptOf = (workflow: LaunchWorkflow) =>
    startup?.state === "needs-reconciliation"
      ? undefined
      : launches.attemptOf(sourceId, entry.identity, workflow);
  const dependencyProblem = dependencyStartProblem(entry.dependencies);
  // Dependencies gate a new execution, not continuation of a kept one-shot.
  const dependencyBlocksStart =
    keptOneShot === undefined && dependencyProblem !== undefined;
  const dependencyId = `${statusId}-dependencies`;
  const answerId = useId();
  // The answers of this page's launches that no Start on the card shows.
  const unshown = launchWorkflowNames.flatMap((workflow) => {
    if (offersStart || (workflow === "execution" && keptStart !== undefined))
      return [];
    const attempt = attemptOf(workflow);
    return attempt === undefined || attempt.kind === "starting"
      ? []
      : [{ workflow, problem: attempt }];
  });
  const onStart =
    (workflow: LaunchWorkflow) =>
    (choices: LaunchChoices): Promise<StartAnswer> =>
      launches.start(sourceId, entry, workflow, choices, (record) => {
        if (keyboardRestsOn(workCard(entry.identity)))
          setLaunchedHere(sessionKey(record.session));
      });
  return (
    <>
      {startup !== undefined && (
        <div id={statusId} className="card-startup-status">
          <StartupStatus
            startup={startup}
            running={launches.runningStartOf(
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
        </div>
      )}
      {unread !== undefined && (
        <p id={unread} className="visually-hidden">
          Unavailable until this dashboard reads this machine&apos;s launch
          evidence.
        </p>
      )}
      {offersStart && dependencyBlocksStart && (
        <p id={dependencyId} className="dependency-start-reason">
          {dependencyProblem}
        </p>
      )}
      {keptStart !== undefined && (
        <StartLaunch
          sourceId={sourceId}
          work={entry}
          workflow="execution"
          establishesStart
          options={undefined}
          resumes={keptStart}
          note={keptStartNote}
          attempt={attemptOf("execution")}
          unavailable={unoffered}
          unavailableReason={unread}
          onStart={onStart("execution")}
        />
      )}
      {offersStart &&
        launchWorkflowNames.map((workflow) => (
          <StartLaunch
            sourceId={sourceId}
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
            attempt={attemptOf(workflow)}
            unavailable={
              unoffered || (workflow === "execution" && dependencyBlocksStart)
            }
            unavailableReason={
              workflow === "execution" && dependencyBlocksStart
                ? dependencyId
                : unread
            }
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
