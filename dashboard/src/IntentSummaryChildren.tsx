// A location or folder summary's per-child breakdown
// (`./IntentProofSummary.tsx`): each immediate folder or file in tree order
// with its inventory total and, once any of its files is read, its proof count
// and summed duration, sliced from the selection's one walk
// (`./intentSummaryProofCost.ts`). Each child's name opens that folder or file
// in Intent's one selection, as its tree name does.

import {
  inventoryTotalLine,
  proofCountLineFor,
} from "./intentSummaryCoverage.ts";
import {
  proofCostLineFor,
  type ChildFigures,
} from "./intentSummaryProofCost.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { ProofKindWords } from "./proofKinds.ts";

export function IntentSummaryChildren({
  childList,
  words,
  onOpen,
}: {
  readonly childList: readonly ChildFigures[];
  readonly words: ProofKindWords;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  if (childList.length === 0) return null;
  return (
    <ul
      className="intent-summary-children"
      aria-label="Summary by folder and file"
    >
      {childList.map((child) => {
        const { coverage, inventoryCount, observed, cost } = child.figures;
        const showProof = coverage.readyCount > 0 || !coverage.incomplete;
        return (
          <li key={child.path}>
            <button
              type="button"
              className="intent-open-link"
              onClick={() => {
                onOpen({ path: child.path, scope: child.kind });
              }}
            >
              <code>{child.name}</code>
            </button>
            <p className="intent-summary-scenarios">
              {inventoryTotalLine(coverage, inventoryCount, words)}
            </p>
            {showProof ? (
              <>
                <p className="intent-proof-counts">
                  {proofCountLineFor(coverage, observed, words)}
                </p>
                <p className="intent-proof-counts">
                  {proofCostLineFor(coverage, cost, words)}
                </p>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
