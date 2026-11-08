// Summary of Intent's story CI timing comparison (`./IntentCiComparison.tsx`):
// names the active comparison (Baseline with Landed when Landed has proof,
// otherwise Branch or Provisional) and why Landed is unused, then lists its
// overall Counts and one signed change each in CI time without runner waits
// and CI wall time when both builds measured them.

import {
  countCueElementAttrs,
  durationCueElementAttrs,
} from "./ciScopeComparisonCuePresentation.ts";
import type { ComparisonEndpointProofs } from "./useIntentCiComparisonEntries.ts";
import {
  activeComparisonOf,
  overallTimingCue,
  timeWithoutRunnerWaitsChangeWords,
  wallTimeChangeWords,
} from "./storyCiComparisonWording.ts";
import {
  overallCountsCue,
  overallCountsWords,
} from "./storyCiComparisonCountsWords.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";

export function ActiveComparisonSummary({
  answer,
  proofs,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly proofs: ComparisonEndpointProofs;
}) {
  const active = activeComparisonOf(answer, proofs);
  const overallCounts = overallCountsWords(proofs.baseline, active.proof);
  const overallTiming = timeWithoutRunnerWaitsChangeWords(
    answer.baseline,
    active.slot,
  );
  const wallChange = wallTimeChangeWords(answer.baseline, active.slot);
  const countsCue = overallCountsCue(proofs.baseline, active.proof);
  const timingCue = overallTimingCue(answer.baseline, active.slot);
  return (
    <div className="intent-ci-comparison-summary">
      <p className="intent-ci-comparison-active">{active.title}</p>
      {active.landedUnusedReason !== undefined && (
        <p className="intent-ci-comparison-active-reason">
          Landed is not used: {active.landedUnusedReason}
        </p>
      )}
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
        {overallTiming !== undefined && (
          <div>
            <dt>CI time without runner waits</dt>
            <dd
              {...durationCueElementAttrs(
                timingCue,
                "intent-ci-comparison-overall-timing",
              )}
            >
              {overallTiming}
            </dd>
          </div>
        )}
        {wallChange !== undefined && (
          <div>
            <dt>CI wall time</dt>
            <dd className="intent-ci-comparison-overall-wall">{wallChange}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
