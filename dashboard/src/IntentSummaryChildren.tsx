// A Gherkin location or folder summary's per-child breakdown
// (`./IntentGherkinSummary.tsx`): each immediate folder or file in tree order
// with its scenario total and, once any of its files is read, its proof count
// and summed duration, sliced from the selection's one walk
// (`./intentSummaryProofCost.ts`). Each child's name opens that folder or file
// in Intent's one selection, as its tree name does.

import {
  proofCountLineFor,
  scenarioTotalLine,
} from "./intentSummaryCoverage.ts";
import {
  proofCostLineFor,
  type ChildFigures,
} from "./intentSummaryProofCost.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummaryChildren({
  childList,
  onOpen,
}: {
  readonly childList: readonly ChildFigures[];
  readonly onOpen: (next: IntentSelection) => void;
}) {
  if (childList.length === 0) return null;
  return (
    <ul
      className="intent-summary-children"
      aria-label="Summary by folder and file"
    >
      {childList.map((child) => {
        const { coverage, scenarioCount, observed, cost } = child.figures;
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
              {scenarioTotalLine(coverage, scenarioCount)}
            </p>
            {showProof ? (
              <>
                <p className="intent-proof-counts">
                  {proofCountLineFor(coverage, observed)}
                </p>
                <p className="intent-proof-counts">
                  {proofCostLineFor(coverage, cost)}
                </p>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
