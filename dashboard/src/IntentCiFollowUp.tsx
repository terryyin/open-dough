// Both measurements use the saved reference, never today's moving window.
import type {
  CiFollowUpAttempt,
  CiFollowUpReading,
} from "./ciFollowUpReading.ts";
import {
  executionTimeWords,
  executionTimeDifferenceWords,
  relativePercentWords,
} from "./ciProofTimeWords.ts";
import { timeChangeOf } from "./storyCiRelativeChange.ts";
import { IntentCiPriorBuildReference } from "./IntentCiPriorBuildReference.tsx";
import { PriorBuildReferenceEvidenceList } from "./PriorBuildReferenceEvidenceList.tsx";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
import { exactAttemptUrl } from "./ciRunAttemptUrl.ts";
import { runAttemptOfBuildKey } from "./landedCiBuildKey.ts";
import "./ci-follow-up.css";
import "./intent-ci-history.css";

function Attempt({
  label,
  attempt,
  reading,
}: {
  readonly label: string;
  readonly attempt: CiFollowUpAttempt | undefined;
  readonly reading: CiFollowUpReading;
}) {
  const average = reading.reference.averageMs;
  const change =
    average === undefined || attempt?.comparableMs === undefined
      ? undefined
      : timeChangeOf(
          average,
          attempt.comparableMs,
          executionTimeDifferenceWords,
        );
  return (
    <section aria-label={`${label} CI attempt`}>
      <h4>{label}</h4>
      {attempt === undefined ? (
        <p>No repeat attempt has been verified. {reading.explanation}</p>
      ) : (
        <>
          <p>
            Revision <code>{attempt.revision}</code>
          </p>
          <p>
            {attempt.adapterAttempt === undefined ? (
              <>
                Workflow{" "}
                {attempt.workflowId === reading.workflowId
                  ? reading.workflow
                  : "unverified"}{" "}
                · ID {attempt.workflowId}
              </>
            ) : (
              <>
                Check {attempt.check ?? "unavailable"} · Context{" "}
                {attempt.context ?? "unavailable"} · Run{" "}
                {attempt.adapterAttempt.runId}
              </>
            )}
            <HistoryRunAttempt run={attempt} />
          </p>
          {attempt.runUrl === undefined && (
            <p>Exact attempt build link unavailable.</p>
          )}
          <p>
            CI verdict: {attempt.verdict}
            {attempt.status === undefined ? "" : ` · Status: ${attempt.status}`}
          </p>
          <p>
            Attempt wall time:{" "}
            {attempt.ms === undefined
              ? "unavailable"
              : executionTimeWords(attempt.ms)}
          </p>
          <p>
            Attempt start: {attempt.startedAt ?? "unavailable"} · Completion:{" "}
            {attempt.completedAt ?? "unavailable"}
          </p>
          <p>Proof completeness: {attempt.completeness}</p>
          <p>
            {change === undefined
              ? "Comparable difference unavailable"
              : `Difference from saved average: ${change.text} (${change.relative === undefined ? "percentage unavailable" : relativePercentWords(change.relative)})`}
          </p>
        </>
      )}
    </section>
  );
}

export function IntentCiFollowUp({
  reading,
}: {
  readonly reading: CiFollowUpReading;
}) {
  return (
    <section
      className={`intent-ci-history ci-follow-up ci-follow-up-${reading.kind}`}
      aria-label="Retained CI follow-up comparison"
    >
      <h3>CI timing follow-up</h3>
      <p>
        <strong>{reading.explanation}</strong>
      </p>
      <p>
        Published Done landing <code>{reading.revision}</code>
      </p>
      <p>Request submission: {reading.submission}</p>
      <p>
        Saved provisional rule: repeat once at or above {reading.rule.percent}%
        slower than the saved prior-build average.
      </p>
      <p>
        Provider-reported attempt start through completion; not every queue
        phase. Both attempts use this same frozen reference.
      </p>
      <Attempt label="Original" attempt={reading.original} reading={reading} />
      <Attempt label="Repeat" attempt={reading.repeat} reading={reading} />
      <h4>Saved prior-build reference</h4>
      <IntentCiPriorBuildReference reference={reading.reference} precise />
      <details open>
        <summary>Saved builds and reference evidence</summary>
        <PriorBuildReferenceEvidenceList
          evidence={reading.reference.evidence}
          medianMs={reading.reference.medianMs}
          precise
          details={(sample) => {
            const attempt = runAttemptOfBuildKey(sample.key);
            const url = exactAttemptUrl(
              reading.repository,
              attempt?.runId,
              attempt?.runAttempt,
              attempt === undefined
                ? undefined
                : `https://github.com/${reading.repository}/actions/runs/${attempt.runId}`,
            );
            return (
              <>
                <code> · {sample.key}</code>
                <HistoryRunAttempt
                  run={{
                    ...attempt,
                    ...(url === undefined ? {} : { runUrl: url }),
                  }}
                />
              </>
            );
          }}
        />
      </details>
      <p>
        Two observed timings are not proof of a regression, its cause or
        statistical confidence. One repeat only; the 5% calibration remains
        provisional.
      </p>
      <p>
        File and folder Proof below describes the original selected landing. The
        repeat has no separate scoped-proof browser.
      </p>
    </section>
  );
}
