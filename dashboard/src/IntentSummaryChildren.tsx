// A Gherkin location or folder summary's per-child breakdown
// (`./IntentGherkinSummary.tsx`): each immediate folder or file in tree order
// with its scenario total and, once any of its files is read, its proof count
// and summed duration (`./intentSummaryCoverage.ts`,
// `./intentSummaryProofCost.ts`). Each child's name opens that folder or file
// in Intent's one selection, as its tree name does.

import {
  coverageOf,
  observationsForFiles,
  proofCountLineFor,
  scenarioCountForFiles,
  scenarioTotalLine,
  type SummaryChild,
  type SummaryFileStatus,
} from "./intentSummaryCoverage.ts";
import { proofCostLineFor, proofCostOf } from "./intentSummaryProofCost.ts";
import type { SuccessfulProofObservation } from "./cucumberProof.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

export function IntentSummaryChildren({
  childList,
  statusOf,
  textOf,
  latest,
  onOpen,
}: {
  readonly childList: readonly SummaryChild[];
  readonly statusOf: (path: string) => SummaryFileStatus;
  readonly textOf: (path: string) => string | undefined;
  readonly latest: ReadonlyMap<string, SuccessfulProofObservation>;
  readonly onOpen: (next: IntentSelection) => void;
}) {
  if (childList.length === 0) return null;
  return (
    <ul
      className="intent-summary-children"
      aria-label="Summary by folder and file"
    >
      {childList.map((child) => {
        const coverage = coverageOf(child.files, statusOf);
        const scenarios = scenarioCountForFiles(child.files, textOf);
        const showProof = coverage.readyCount > 0 || !coverage.incomplete;
        const observed = observationsForFiles(child.files, textOf, latest);
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
              {scenarioTotalLine(coverage, scenarios)}
            </p>
            {showProof ? (
              <>
                <p className="intent-proof-counts">
                  {proofCountLineFor(coverage, observed)}
                </p>
                <p className="intent-proof-counts">
                  {proofCostLineFor(coverage, proofCostOf(observed))}
                </p>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
