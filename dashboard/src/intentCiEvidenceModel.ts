// Shared evidence meanings; the provider owns live and retained read lifecycles.
import type { CiFollowUpReading } from "./ciFollowUpReading.ts";
import type { ScopeHistoryEndpoint } from "./ciScopeHistory.ts";
import type { CiTarget } from "./intentCiTarget.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { ComparisonReading } from "./useIntentCiComparison.ts";
import type { ComparisonEndpointProofs } from "./useIntentCiComparisonEntries.ts";
import type { JudgedReading } from "./useIntentCiJudgment.ts";
import type { HistoryReading } from "./useIntentCiHistory.ts";
import type { ShownProof } from "./useIntentCiShownProof.ts";

export type CiEvidence =
  // Nothing here reads CI (no owner, or not active).
  | { readonly kind: "inactive" }
  | {
      readonly kind: "retained";
      readonly source: PublishedSource;
      readonly identity: string;
      readonly doneEndpoint?: ScopeHistoryEndpoint;
      readonly doneEndpointReason?: string;
      readonly reading: CiFollowUpReading | undefined;
      readonly problem: string | undefined;
      readonly retry: () => void;
    }
  | Extract<CiTarget, { kind: "gap" }>
  | {
      readonly kind: "comparison";
      readonly phase: "done" | "taken";
      readonly source: PublishedSource;
      readonly story: string;
      readonly identity: string;
      readonly comparison: ComparisonReading;
      readonly endpointProofs: ComparisonEndpointProofs | undefined;
      readonly doneEndpoint?: ScopeHistoryEndpoint;
      readonly doneEndpointReason?: string;
    }
  | {
      readonly kind: "judged";
      readonly source: PublishedSource;
      readonly branch: string;
      readonly story: string | undefined;
      readonly judged: JudgedReading;
      readonly proof: ShownProof | undefined;
      // The trunk's: its collected CI wall time history.
      readonly history?: HistoryReading;
      readonly projectEndpoint?: ScopeHistoryEndpoint;
      // Taken Story Branch: provisional comparison beside the live judgment.
      readonly comparison?: ComparisonReading;
      readonly comparisonStory?: string;
      readonly endpointProofs?: ComparisonEndpointProofs;
    };
