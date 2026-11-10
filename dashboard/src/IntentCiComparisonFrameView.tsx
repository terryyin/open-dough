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
  children,
  preference,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly proofs: ComparisonEndpointProofs | undefined;
  readonly relatives: readonly (number | undefined)[];
  readonly children: ReactNode;
  readonly preference: ComparisonPreference;
}) {
  const { showPercent, onShowPercent } = preference;
  const active =
    proofs === undefined ? undefined : activeComparisonOf(answer, proofs);
  return (
    <section
      className="intent-ci-comparison-frame"
      aria-label="CI timing comparison"
    >
      <div className="intent-ci-comparison-head">
        <div>
          <h3 className="intent-ci-comparison-active">
            {active?.title ?? ciTimingHeading}
          </h3>
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
