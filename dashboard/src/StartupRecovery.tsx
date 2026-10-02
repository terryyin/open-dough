// Startup recovery: the selected project's startups that need the developer
// (`./startupRecoveries.ts`), beside the project's own actions and outside
// every story's protected frame, so a startup whose story moved or left the
// published snapshot stays reachable. Each says statically what this
// machine knows of it -- when it was accepted, its publication receipt, its
// outcome -- and offers Recheck, which reads this machine's evidence and
// published state afresh, first settling a story launch that may or may not
// have started from its host's own session listing when it can, and, for an
// accepted attempt that needs reconciliation, Continue, which asks the local service to run that same
// attempt again under the existing recovery rules. A continuation that was
// not accepted says why, with the attempt kept as it was. When this
// machine's kept attempts cannot be read, the section says an earlier
// startup may still be unresolved. Answers are shown as they were formed:
// each says what is known and what to check, true wherever it is shown, and
// leaves the action to the control beside it; this section adds only its own
// native check and buttons.

import { useId } from "react";
import {
  startName,
  type AgentLaunchRequest,
  type AttemptObservation,
} from "./agentLaunch.ts";
import { Moment } from "./Moment.tsx";
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

// Where the host's own sessions are checked before continuing.
function NativeCheck({ host }: { readonly host: AgentLaunchRequest["host"] }) {
  return host === "claude" ? (
    <>
      Check <code>claude agents</code> before continuing: continuing starts its
      session again unless its kept evidence resumes it.
    </>
  ) : (
    <>
      Check the dashboard history and native {hostName(host)} conversations
      before continuing; a recorded conversation is resumed, never submitted
      again.
    </>
  );
}

function RecoveryEntry({
  item,
  onContinue,
  onRecheck,
}: {
  readonly item: StartupRecoveryItem;
  readonly onContinue: (attempt: AttemptObservation) => void;
  readonly onRecheck: (attempt?: AttemptObservation) => void;
}) {
  const id = useId();
  const { request, cause, attempt, problem, answer, continuing } = item;
  const subject = subjectOf(request);
  const named = startName(request.workflow);
  const continues =
    attempt !== undefined && cause !== "waiting" && cause !== "unacknowledged";
  return (
    <article
      className="startup-recovery-entry"
      aria-labelledby={`${id}-subject`}
    >
      <h3 id={`${id}-subject`}>
        {subject} · {named} in {hostName(request.host)}
      </h3>
      <p className="launch-answer card-startup-static">
        {cause === "waiting" ? (
          <>
            Waiting for published story state:{" "}
            {problem ??
              "the published snapshot shown no longer lists this story."}
          </>
        ) : (
          <>
            Startup needs reconciliation:{" "}
            {reconciliationCause({ cause }, named)}
          </>
        )}
      </p>
      {cause === "unacknowledged" && problem !== undefined && (
        <p className="quiet">
          <LaunchExplanation text={problem} />
        </p>
      )}
      {attempt !== undefined && <KnownFacts attempt={attempt} />}
      {continues && (
        <p className="quiet" id={`${id}-check`}>
          <NativeCheck host={request.host} />
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
        {continues && (
          <button
            type="button"
            aria-label={`Continue ${named} of ${subject}`}
            aria-describedby={`${id}-check`}
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
          onRecheck={recoveries.recheckStartups}
        />
      ))}
    </section>
  );
}
