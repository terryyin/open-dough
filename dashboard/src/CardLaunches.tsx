import { dependencyStartProblem } from "./storyDependencies.ts";
import { sessionKey } from "./sessionReference.ts";
// A card's launches: Backlog cards offer Start per workflow, with each note
// and answer; an open session makes every Start unavailable with its reason.
// A story starting on this machine shows StartupStatus wherever it is listed,
// with reconciliation answers left to Startup recovery. Every card shows
// sessions not marked done. A Taken card with a kept start offers execution
// in that workspace without a second Take; an open session gates it too.
// A launch lists its session here and takes the keyboard to it. An answer no
// Start shows, as when origin moved the story to Taken meanwhile, stays on
// the card. Review changes belongs to WorkCard's inspection group.
// Sessions are local evidence: whatever they show, origin places the story.

import { useId, useState } from "react";
import type { LaunchChoices, LaunchWorkflow } from "./agentLaunch.ts";
import type { WorkEntry } from "./publishedWork.ts";
import {
  cardSessionsOf,
  publicationRecordingStopped,
  keptStartNote,
  launchWorkflowNames,
  launchWorkflows,
  openSessionStartReason,
} from "./agentLaunch.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { StartLaunch } from "./StartLaunch.tsx";
import { StartupStatus } from "./StartupStatus.tsx";
import type { StartAnswer } from "./LaunchExistingChanges.tsx";
import { CreationEntry } from "./CreationEntry.tsx";
import { CardSessions } from "./CardSessions.tsx";
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
  // Backlog offers every workflow; Taken offers only a kept execution.
  offersStart: boolean;
  // The id of what says the story's startup, which the card is described by.
  statusId: string;
}) {
  // The session the developer's own launch from this card just listed.
  const [launchedHere, setLaunchedHere] = useState<string | undefined>();
  const sessions = cardSessionsOf(launches.launched, sourceId, entry.identity);
  const hasOpenSession = sessions.length > 0;
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
  // No Start before local evidence is read: an earlier startup may be unresolved.
  const unoffered = unavailable || launches.attemptEvidence !== "read";
  const evidenceId = `${statusId}-evidence`;
  const unread = !unavailable && unoffered ? evidenceId : undefined;
  const sessionOpenId = `${statusId}-session-open`;
  // A startup in need of reconciliation is answered under Startup
  // recovery; a recording stop also keeps its failed answer beside Start.
  const attemptOf = (workflow: LaunchWorkflow) => {
    const attempt = startup?.attempt;
    if (
      publicationRecordingStopped(attempt) &&
      attempt.request.workflow === workflow
    )
      return attempt.outcome;
    return startup?.state === "needs-reconciliation"
      ? undefined
      : launches.attemptOf(sourceId, entry.identity, workflow);
  };
  const dependencyProblem = dependencyStartProblem(entry.dependencies);
  // Dependencies gate a new execution, not continuation of a kept one-shot.
  const dependencyBlocksStart =
    keptOneShot === undefined && dependencyProblem !== undefined;
  const dependencyId = `${statusId}-dependencies`;
  // Open session and unread evidence gate all Starts; dependencies gate only a
  // fresh Backlog execution. Kept execution shares the first two gates.
  const startBlocked = unoffered || hasOpenSession;
  const startBlockedReason = hasOpenSession ? sessionOpenId : unread;
  const startUnavailable = (workflow: LaunchWorkflow) =>
    startBlocked || (workflow === "execution" && dependencyBlocksStart);
  const startUnavailableReason = (workflow: LaunchWorkflow) =>
    hasOpenSession
      ? sessionOpenId
      : workflow === "execution" && dependencyBlocksStart
        ? dependencyId
        : unread;
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
        <p id={unread} className="visually-hidden card-launch-evidence-reason">
          Unavailable until this dashboard reads this machine&apos;s launch
          evidence.
        </p>
      )}
      {hasOpenSession && (
        <p
          id={sessionOpenId}
          className="visually-hidden card-session-open-reason"
        >
          {openSessionStartReason}
        </p>
      )}
      {offersStart && dependencyBlocksStart && (
        <p id={dependencyId} className="dependency-start-reason">
          {dependencyProblem}
        </p>
      )}
      {(keptStart !== undefined || offersStart) && (
        <div
          className="card-action-group card-launch-group"
          role="group"
          aria-label="Launch actions"
        >
          {keptStart !== undefined && (
            <StartLaunch
              sourceId={sourceId}
              work={entry}
              workflow="execution"
              establishesStart
              options={undefined}
              resumes={keptStart}
              note={unavailable ? undefined : keptStartNote}
              attempt={attemptOf("execution")}
              unavailable={startBlocked}
              unavailableReason={startBlockedReason}
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
                options={(host) =>
                  launches.optionsOffer(sourceId, workflow, host)
                }
                sessionPolicy={(host) =>
                  launches.sessionPolicyOffer(sourceId, workflow, host)
                }
                {...resumesOf(workflow)}
                note={
                  "resumes" in resumesOf(workflow) && !unavailable
                    ? keptStartNote
                    : launchWorkflows[workflow].note(entry)
                }
                attempt={attemptOf(workflow)}
                unavailable={startUnavailable(workflow)}
                unavailableReason={startUnavailableReason(workflow)}
                onStart={onStart(workflow)}
              />
            ))}
        </div>
      )}
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
      <CardSessions
        sessions={sessions}
        launchedHere={launchedHere}
        cardAssignments={[
          ...(entry.owner?.status === "recorded"
            ? entry.owner.assignments
            : []),
          ...(entry.preparing?.status === "recorded"
            ? entry.preparing.assignments
            : []),
        ]}
      />
    </>
  );
}
