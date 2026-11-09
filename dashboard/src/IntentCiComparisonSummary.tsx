// Summary of Intent's story CI timing comparison (`./IntentCiComparison.tsx`):
// why Landed is unused when the active comparison skips it, then the active
// comparison's overall Counts and one signed change each in CI time without
// runner waits and CI wall time when both builds measured them, each with
// its relative mark (`./IntentCiTimeChange.tsx`).

import {
  countCueElementAttrs,
  durationCueElementAttrs,
} from "./ciScopeComparisonCuePresentation.ts";
import { TimeChangeFigure } from "./IntentCiTimeChange.tsx";
import type { ComparisonEndpointProofs } from "./useIntentCiComparisonEntries.ts";
import {
  overallTimingCue,
  timeWithoutRunnerWaitsChangeOf,
  wallTimeChangeOf,
  type ActiveComparison,
} from "./storyCiComparisonWording.ts";
import {
  overallCountsCue,
  overallCountsWords,
} from "./storyCiComparisonCountsWords.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import type { TimeChange } from "./storyCiRelativeChange.ts";

type ComparisonAnswer = Extract<
  StoryCiComparisonAnswer,
  { kind: "comparison" }
>;

// The active comparison's overall timing changes, which share the entry
// cells' relative scale.
export type OverallTimeChanges = {
  readonly withoutWaits: TimeChange | undefined;
  readonly wall: TimeChange | undefined;
};

export function overallTimeChangesOf(
  answer: ComparisonAnswer,
  active: ActiveComparison,
): OverallTimeChanges {
  return {
    withoutWaits: timeWithoutRunnerWaitsChangeOf(answer.baseline, active.slot),
    wall: wallTimeChangeOf(answer.baseline, active.slot),
  };
}

export function ActiveComparisonSummary({
  answer,
  proofs,
  active,
}: {
  readonly answer: ComparisonAnswer;
  readonly proofs: ComparisonEndpointProofs;
  readonly active: ActiveComparison;
}) {
  const overallCounts = overallCountsWords(proofs.baseline, active.proof);
  const { withoutWaits, wall } = overallTimeChangesOf(answer, active);
  const countsCue = overallCountsCue(proofs.baseline, active.proof);
  const timingCue = overallTimingCue(answer.baseline, active.slot);
  return (
    <div className="intent-ci-comparison-summary">
      <dl className="intent-ci-comparison-metrics">
        <div>
          <dt>Counts</dt>
          <dd
            {...countCueElementAttrs(
              countsCue,
              "intent-ci-comparison-overall-counts",
            )}
          >
            {overallCounts}
          </dd>
        </div>
        {withoutWaits !== undefined && (
          <div>
            <dt>CI time without runner waits</dt>
            <dd
              {...durationCueElementAttrs(
                timingCue,
                "intent-ci-comparison-overall-timing",
              )}
            >
              <TimeChangeFigure change={withoutWaits} />
            </dd>
          </div>
        )}
        {wall !== undefined && (
          <div>
            <dt>CI wall time</dt>
            <dd className="intent-ci-comparison-overall-wall">
              <TimeChangeFigure change={wall} />
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
