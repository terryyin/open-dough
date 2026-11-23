import type { ReactNode } from "react";
import { IntentCiComparisonFrameView } from "./IntentCiComparisonFrameView.tsx";
import type { ComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import { ComparisonNamed } from "./IntentComparisonNamed.tsx";
import type { ScopeComparisonEvidence } from "./IntentScopeEvidence.tsx";
import { comparisonEndpointProofsChecking } from "./storyCiComparisonEntries.ts";

// Summary and file Proof name the same held evidence before their figures.
export function IntentScopeComparisonFrame({
  evidence,
  preference,
  relatives,
  children,
}: {
  readonly evidence: ScopeComparisonEvidence;
  readonly preference: ComparisonPreference;
  readonly relatives: readonly (number | undefined)[];
  readonly children: ReactNode;
}) {
  return (
    <IntentCiComparisonFrameView
      preference={preference}
      answer={evidence.answer}
      {...(evidence.kind === "comparison" ? { proofs: evidence.proofs } : {})}
      relatives={relatives}
    >
      <ComparisonNamed evidence={evidence} />
      {comparisonEndpointProofsChecking(...Object.values(evidence.proofs)) && (
        <p className="intent-ci-reading" role="status">
          Reading entry comparison…
        </p>
      )}
      {children}
    </IntentCiComparisonFrameView>
  );
}
