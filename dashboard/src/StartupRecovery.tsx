// Startup recovery: the selected project's startups that need the developer
// (`./startupRecoveries.ts`), beside the project's own actions and outside
// every story's protected frame, so a startup whose story moved or left the
// published snapshot stays reachable. Each says statically what this
// machine knows of it -- when it was accepted, its publication receipt, its
// outcome -- and offers Recheck, which reads this machine's evidence and
// published state afresh, and, for an accepted attempt that needs
// reconciliation, Continue, which asks the local service to run that same
// attempt again under the existing recovery rules. A continuation that was
// not accepted says why, with the attempt kept as it was. When this
// machine's kept attempts cannot be read, the section says an earlier
// startup may still be unresolved.

import { useId } from "react";
import {
  startName,
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

// A launch answer as said beside Continue: what the answer directs the
// developer to do again from the card's Start is done here by continuing.
function forContinuation(explanation: string): string {
  return explanation
    .replaceAll("pressing Start again resumes it", "continuing resumes it")
    .replaceAll("before starting again", "before continuing")
    .replaceAll(", then start again", ", then continue");
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
          Its last answer:{" "}
          <LaunchExplanation text={forContinuation(outcome.explanation)} />
        </>
      )}
    </p>
  );
}

function RecoveryEntry({
  item,
  onContinue,
  onRecheck,
}: {
  readonly item: StartupRecoveryItem;
  readonly onContinue: (attempt: AttemptObservation) => void;
  readonly onRecheck: () => void;
}) {
  const id = useId();
  const { request, cause, attempt, problem, answer, continuing } = item;
  const subject = subjectOf(request);
  const named = startName(request.workflow);
  const continues =
    attempt !== undefined && cause !== "waiting" && cause !== "unacknowledged";
  const nativeCheckAdvice = continues
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
          <LaunchExplanation text={forContinuation(problem)} />
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
          onClick={onRecheck}
        >
          Recheck
        </button>
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
        <LaunchProblemAnswer
          id={`${id}-answer`}
          problem={{
            ...answer,
            explanation: forContinuation(answer.explanation),
          }}
        />
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
            <button type="button" onClick={recoveries.recheckStartups}>
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
