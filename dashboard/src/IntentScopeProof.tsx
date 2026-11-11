// A selected entry's or folder's CI proof in its Summary
// (`./IntentSummary.tsx`), from the CI proof Intent's homepage shows
// (`./IntentCiEvidence.tsx`), with no source read: it names that evidence
// once (`./IntentScopeEvidence.tsx`), then the selected scope's own figures
// as a labelled group (`./IntentScopeFigures.tsx`) above one table in the
// homepage's columns (`./CiProofTable.tsx`, `./ciProofWording.ts`): one row
// per immediate folder and file the tree lists, in its order, each name
// opening that folder or file, and a row for what the scope's figures hold
// that no child row shows (`./ciScopeProof.ts`), explained below it. The table
// sorts by its columns with that outside row kept last; the sort choice is
// held with Intent's reading place (`./pageIntentReading.tsx`), in memory
// only, so it stays while drilling down and across Development and back.
// When a story is selected, the group and table compare baseline, branch and
// landed execution time through the shared scope comparison
// (`./ciScopeComparison.ts`), mark rows the story changed, and reuse the
// homepage's observed-not-attributed statement. Without usable evidence, the
// rows stay for drilling down, the group and rows say why in a word or two,
// and one line says why as the homepage says it. Project and Done scopes add local
// collected execution-time history beside these existing readings, with its
// own failed-read feedback and retry (./IntentScopeTimingHistory.tsx).

import type { CiProofSorting } from "./CiProofTable.tsx";
import type { ColumnSort } from "./ciProofSort.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import { IntentScopeProofView } from "./IntentScopeProofView.tsx";
import { IntentScopeTimingHistory } from "./IntentScopeTimingHistory.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";

// The Summary table's sort choice, kept with Intent's reading place.
function useSummarySorting(): CiProofSorting {
  const [sort, onSort] = useKeptReading<ColumnSort | undefined>(
    "summaryCiSort",
    () => undefined,
  );
  return { sort, onSort };
}

function ScopeProofContent(
  props: Omit<
    Parameters<typeof IntentScopeProofView>[0],
    "evidence" | "preference" | "sorting"
  >,
) {
  return (
    <IntentScopeProofView
      {...props}
      evidence={scopeEvidenceOf(useIntentCiEvidence())}
      sorting={useSummarySorting()}
    />
  );
}

// History reads independently of whether the current comparison has usable proof.
export function IntentScopeProof(
  props: Parameters<typeof ScopeProofContent>[0],
) {
  return (
    <>
      <ScopeProofContent {...props} />
      <IntentScopeTimingHistory path={props.path} />
    </>
  );
}
