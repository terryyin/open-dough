// The production comparison content over its held answer and proof summaries.
import type { ReactNode } from "react";
import type { CiProofSorting } from "./CiProofTable.tsx";
import { ComparisonEndpointsTable } from "./IntentCiComparisonEndpoints.tsx";
import {
  ActiveComparisonSummary,
  overallTimeChangesOf,
  type OverallTimeChanges,
} from "./IntentCiComparisonSummary.tsx";
import { EntryComparisonView } from "./IntentCiEntryComparison.tsx";
import { IntentCiComparisonFrameView } from "./IntentCiComparisonFrameView.tsx";
import type { ComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import type { ComparisonEntries } from "./storyCiComparisonEntries.ts";
import type { StoryCiComparisonAnswer } from "./storyCiComparison.ts";
import { activeComparisonOf } from "./storyCiComparisonWording.ts";
import {
  activeComparisonAfterSideOf,
  comparisonEntriesFromProofs,
  type ComparisonEndpointProofs,
} from "./useIntentCiComparisonEntries.ts";
// Every relative change the comparison shows: the summary's and each entry's
// Branch and Landed.
function relativesOf(
  overall: OverallTimeChanges,
  entries: ComparisonEntries,
): (number | undefined)[] {
  const rows = entries.kind === "rows" ? entries.rows : [];
  return [
    overall.withoutWaits?.relative,
    overall.wall?.relative,
    ...rows.flatMap(({ cells }) => [
      cells.branch.relative,
      cells.landed.relative,
    ]),
  ];
}

export function IntentCiComparisonContent({
  answer,
  proofs,
  checkAgainButton,
  preference,
  sorting,
  labelled = true,
}: {
  readonly answer: Extract<StoryCiComparisonAnswer, { kind: "comparison" }>;
  readonly proofs: ComparisonEndpointProofs | undefined;
  readonly checkAgainButton: ReactNode;
  readonly preference: ComparisonPreference;
  readonly sorting: CiProofSorting;
  readonly labelled?: boolean;
}) {
  const taken = answer.phase === "taken";
  const active =
    proofs === undefined ? undefined : activeComparisonOf(answer, proofs);
  const entries =
    proofs === undefined || active === undefined
      ? undefined
      : comparisonEntriesFromProofs(
          proofs,
          activeComparisonAfterSideOf(answer, proofs),
        );
  const overall =
    active === undefined ? undefined : overallTimeChangesOf(answer, active);
  return (
    <IntentCiComparisonFrameView
      preference={preference}
      labelled={labelled}
      answer={answer}
      proofs={proofs}
      relatives={
        overall === undefined || entries === undefined
          ? []
          : relativesOf(overall, entries)
      }
    >
      {proofs !== undefined && active !== undefined && (
        <ActiveComparisonSummary
          answer={answer}
          proofs={proofs}
          active={active}
        />
      )}
      <ComparisonEndpointsTable
        baseline={answer.baseline}
        branch={answer.branch}
        provisional={answer.provisional}
        landed={answer.landed}
        branchProvisional={taken && answer.mode === "story-branch"}
      />
      <EntryComparisonView entries={entries} sorting={sorting} />
      {checkAgainButton}
    </IntentCiComparisonFrameView>
  );
}
