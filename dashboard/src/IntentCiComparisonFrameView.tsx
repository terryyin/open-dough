// Shared comparison language at story, Summary and file Proof depth. Each
// display scales only its own already-held figures and rows; the preference
// belongs to the story's live reading place above all its views.
import type { ReactNode } from "react";
import type { ComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import {
  RelativeTimingControls,
  RelativeTimingProvider,
} from "./IntentCiTimeChange.tsx";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import type { SelectedCiComparisonAnswer } from "./selectedCiComparison.ts";
import type { ComparisonEndpointProofs } from "./storyCiComparisonEntries.ts";
import {
  activeComparisonOf,
  observedNotAttributedInFull,
} from "./storyCiComparisonWording.ts";
import { relativeScaleOf } from "./storyCiRelativeChange.ts";

export const ciTimingHeading = "CI timing changes";

export function IntentCiComparisonFrameView({
  answer,
  proofs,
  relatives,
  labelled = true,
  children,
  preference,
}: {
  readonly answer:
    | Extract<StoryCiComparisonAnswer, { kind: "comparison" }>
    | Extract<SelectedCiComparisonAnswer, { kind: "selection" }>;
  readonly proofs?: ComparisonEndpointProofs | undefined;
  readonly relatives: readonly (number | undefined)[];
  // A containing story comparison owns its region across all CI states.
  readonly labelled?: boolean;
  readonly children: ReactNode;
  readonly preference: ComparisonPreference;
}) {
  const { showPercent, onShowPercent } = preference;
  const active =
    answer.kind !== "comparison" || proofs === undefined
      ? undefined
      : activeComparisonOf(answer, proofs);
  const title =
    answer.kind === "selection"
      ? "Baseline with Selection"
      : (active?.title ?? ciTimingHeading);
  return (
    <section
      className="intent-ci-comparison-frame"
      aria-label={labelled ? "CI timing comparison" : undefined}
    >
      <div className="intent-ci-comparison-head">
        <div>
          <h3 className="intent-ci-comparison-active">{title}</h3>
          <p className="intent-ci-comparison-framing">
            {observedNotAttributedInFull}
          </p>
        </div>
        <RelativeTimingControls
          showPercent={showPercent}
          onShowPercent={onShowPercent}
        />
      </div>
      {active?.landedUnusedReason !== undefined && (
        <p className="intent-ci-comparison-active-reason">
          Landed is not used: {active.landedUnusedReason}
        </p>
      )}
      <RelativeTimingProvider
        value={{ scale: relativeScaleOf(relatives), showPercent }}
      >
        {children}
      </RelativeTimingProvider>
    </section>
  );
}
