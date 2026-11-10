// Actual production content and projections; no client effects or substitute rows.
import { renderToStaticMarkup } from "react-dom/server";
import { IntentCiComparisonContent } from "../../src/IntentCiComparisonContent.tsx";
import { JudgedBranch } from "../../src/IntentCiJudgedBranch.tsx";
import { shownRunOf } from "../../src/shownCiProofRun.ts";
import { ciTargetOf } from "../../src/intentCiTarget.ts";
import { IntentSummaryView } from "../../src/IntentSummaryView.tsx";
import { IntentScopeProofView } from "../../src/IntentScopeProofView.tsx";
import { IntentFileProofView } from "../../src/IntentFileProofView.tsx";
import { scopeEvidenceOf } from "../../src/IntentScopeEvidence.tsx";
import {
  intentStoryOverlay,
  overlayFilesByPath,
} from "../../src/intentStoryOverlay.ts";
import {
  filesOfSelection,
  owningLocation,
} from "../../src/intentSelectionCoverage.ts";
import type { ComparisonRenderOptions } from "../support/comparisonRendering.ts";
import { preparedComparisonEvidence } from "./evidence.ts";
import type { ComparisonRenderFacts } from "../support/comparisonRenderFacts.ts";

export function comparisonMarkup(
  facts: ComparisonRenderFacts,
  options: ComparisonRenderOptions = {},
) {
  const preference = {
    showPercent: options.showPercent ?? false,
    onShowPercent() {},
  };
  const sorting = { sort: options.sort, onSort() {} };
  const { answer, endpointProofs } = facts;
  if (facts.scope === undefined) {
    const target = ciTargetOf(facts.source, facts.work, facts.identity);
    const status = options.liveStatus;
    return renderToStaticMarkup(
      <>
        {target.kind === "judged" && status !== undefined && (
          <JudgedBranch
            branch={target.branch}
            story={target.story}
            judged={{
              shown: status,
              reading: false,
              previouslyRetrieved: false,
              refreshFailed: undefined,
              round: undefined,
              checkAgain() {},
            }}
            proof={{ run: shownRunOf(status), read: undefined }}
          />
        )}
        <IntentCiComparisonContent
          answer={answer}
          proofs={endpointProofs}
          preference={preference}
          sorting={sorting}
          checkAgainButton={null}
        />
      </>,
    );
  }
  const { scope } = facts;
  const evidence = scopeEvidenceOf(preparedComparisonEvidence(facts));
  const overlay = intentStoryOverlay(scope.locations, scope.changed);
  const treeFiles = overlayFilesByPath(scope.locations, overlay);
  const selection = scope.selection;
  const location = owningLocation(scope.locations, selection);
  const inventory = filesOfSelection(treeFiles, selection);
  const content =
    selection.scope === "file" ? (
      <section aria-label="Proof">
        <IntentFileProofView
          path={selection.path}
          treeFile={treeFiles.get(selection.path)}
          revision={scope.revision}
          evidence={evidence}
          preference={preference}
        />
      </section>
    ) : location === undefined ? null : (
      <IntentSummaryView
        path={selection.path}
        files={inventory}
        location={location}
      >
        <IntentScopeProofView
          path={selection.path}
          inventory={inventory}
          revision={scope.revision}
          treeFiles={treeFiles}
          evidence={evidence}
          preference={preference}
          sorting={sorting}
          onOpen={() => {}}
        />
      </IntentSummaryView>
    );
  return renderToStaticMarkup(
    <div className="intent-perspective">
      <div className="intent-browser intent-files-hidden">
        <div className="intent-reading">{content}</div>
      </div>
    </div>,
  );
}
