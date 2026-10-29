// Startup recovery outside the story frame (`./startupRecoveries.ts`): known
// facts, Recheck, Continue, and Update worktree and retry for incomplete
// install. Unaccepted answers keep the attempt; unread attempts may still
// leave an earlier startup unresolved.

import { useId } from "react";
import {
  startName,
  publicationRecordingStopped,
  sessionStartRetained,
  type AgentLaunchRequest,
  type AttemptObservation,
} from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
import { hostDescription } from "./hostDescription.ts";
import { shortRevision } from "./publishedWork.ts";
import { hostName } from "./sessionCapabilities.ts";
import {
  LaunchExplanation,
  LaunchProblemAnswer,
} from "./LaunchProblemAnswer.tsx";
import { reconciliationCause } from "./StartupStatus.tsx";
import type {
  StartupRecoveries,
  StartupRecoveryItem,
} from "./startupRecoveries.ts";
import "./agent-launch.css";
import "./startup-recovery.css";

// What the startup is of: its story, or the project's ad hoc session.
function subjectOf(request: AgentLaunchRequest): string {
  return request.workflow === "ad-hoc"
    ? "Ad hoc session"
    : `${request.title} (${request.identity})`;
}

function publicationWords({ publication }: AttemptObservation): string {
  switch (publication.kind) {
    case "none":
      return "It publishes no assignment.";
    case "unknown":
      return "Whether it published its assignment is not known.";
    case "published":
      return publication.revision === undefined
        ? "Its assignment was published."
        : `Its assignment was published at revision ${shortRevision(publication.revision)}.`;
  }
}

// What this machine keeps of the accepted attempt.
function KnownFacts({ attempt }: { readonly attempt: AttemptObservation }) {
  const { outcome } = attempt;
  return (
    <p className="quiet">
      Accepted on this machine <Moment at={new Date(attempt.acceptedAt)} />.{" "}
      {publicationWords(attempt)}{" "}
      {outcome === undefined ? (
        "It never settled."
      ) : outcome.kind === "launched" ? (
        "Its session started."
      ) : outcome.kind === "existing-changes" ? (
        "It stopped at the default checkout's unconfirmed changes."
      ) : (
        <>
          Its last answer: <LaunchExplanation text={outcome.explanation} />
        </>
      )}
    </p>
  );
}

function RecoveryEntry({
  item,
  onContinue,
  onUpdateWorktree,
  onRecheck,
}: {
  readonly item: StartupRecoveryItem;
  readonly onContinue: (attempt: AttemptObservation) => void;
  readonly onUpdateWorktree: (attempt: AttemptObservation) => void;
  readonly onRecheck: (attempt?: AttemptObservation) => void;
}) {
  const id = useId();
  const {
    request,
    cause,
    attempt,
    problem,
    answer,
    continuing,
    offersWorktreeUpdate,
  } = item;
  const subject = subjectOf(request);
  const named = startName(request.workflow);
  const continues =
    attempt !== undefined && cause !== "waiting" && cause !== "unacknowledged";
  const nativeCheckAdvice =
    continues &&
    !publicationRecordingStopped(attempt) &&
    !sessionStartRetained(attempt) &&
    !offersWorktreeUpdate
      ? hostDescription(request.host).nativeCheckAdvice
      : undefined;
  return (
    <article
      className="startup-recovery-entry"
      aria-labelledby={`${id}-subject`}
    >
      <h3 id={`${id}-subject`}>
        {subject} · {named} in {hostName(request.host)}
      </h3>
      <p className="launch-answer story-card-startup-static">
        {cause === "waiting" ? (
          <>
            Waiting for published story state:{" "}
            {problem ??
              "the published snapshot shown no longer lists this story."}
          </>
        ) : (
          <>
            Startup needs reconciliation:{" "}
            {reconciliationCause(
              { cause, ...(attempt === undefined ? {} : { attempt }) },
              named,
            )}
          </>
        )}
      </p>
      {cause === "unacknowledged" && problem !== undefined && (
        <p className="quiet">
          <LaunchExplanation text={problem} />
        </p>
      )}
      {attempt !== undefined && <KnownFacts attempt={attempt} />}
      {nativeCheckAdvice !== undefined && (
        <p className="quiet" id={`${id}-check`}>
          <LaunchExplanation text={nativeCheckAdvice} />
        </p>
      )}
      <p className="startup-recovery-actions">
        <button
          type="button"
          aria-label={`Recheck ${subject}`}
          onClick={() => {
            onRecheck(attempt);
          }}
        >
          Recheck
        </button>
        {continues && offersWorktreeUpdate && (
          <button
            type="button"
            aria-label={`Update worktree and retry ${named} of ${subject}`}
            disabled={continuing}
            onClick={() => {
              onUpdateWorktree(attempt);
            }}
          >
            {continuing ? "Updating…" : "Update worktree and retry"}
          </button>
        )}
        {continues && (
          <button
            type="button"
            aria-label={`Continue ${named} of ${subject}`}
            aria-describedby={
              nativeCheckAdvice === undefined ? undefined : `${id}-check`
            }
            disabled={continuing}
            onClick={() => {
              onContinue(attempt);
            }}
          >
            {continuing ? "Continuing…" : `Continue ${named}`}
          </button>
        )}
      </p>
      {answer !== undefined && (
        <LaunchProblemAnswer id={`${id}-answer`} problem={answer} />
      )}
    </article>
  );
}

export function StartupRecovery({
  sourceId,
  recoveries,
}: {
  readonly sourceId: string;
  readonly recoveries: StartupRecoveries;
}) {
  const headingId = useId();
  const items = recoveries.recoveriesOf(sourceId);
  const evidence = recoveries.attemptEvidence;
  if (items.length === 0 && (evidence === "read" || evidence === "unread"))
    return null;
  return (
    <section className="startup-recovery" aria-labelledby={headingId}>
      <h2 id={headingId}>Startup recovery</h2>
      {evidence === "unanswered" && (
        <>
          <p className="launch-answer launch-problem">
            The local dashboard server has not answered with this machine's
            launch evidence, so an earlier startup may still need
            reconciliation. Story starts stay unavailable until it answers.
          </p>
          <p className="startup-recovery-actions">
            <button
              type="button"
              onClick={() => {
                recoveries.recheckStartups();
              }}
            >
              Recheck launch evidence
            </button>
          </p>
        </>
      )}
      {evidence === "unreadable" && (
        <p className="launch-answer launch-problem">
          This machine's launch evidence (
          <code>~/.open-dough/dashboard/launch-attempts.json</code>) could not
          be read, so an earlier startup may still need reconciliation. Starts
          are refused until that file is repaired or moved aside.
        </p>
      )}
      {items.map((item) => (
        <RecoveryEntry
          key={item.key}
          item={item}
          onContinue={recoveries.continueStartup}
          onUpdateWorktree={recoveries.updateWorktreeAndRetry}
          onRecheck={recoveries.recheckStartups}
        />
      ))}
    </section>
  );
}
