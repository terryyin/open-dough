// CI Proof of a selected test file (`./IntentFileReading.tsx`): Intent's one
// CI evidence owner (`./IntentCiEvidence.tsx`) with no further acquisition.
// A Done file also reads its locally collected timing history beside that
// evidence, independently of usable live Proof. For a
// judged-run summary, one row of counts and execution time for each unit of
// results the file shows, such as its test cases and its own test file
// outcome, with the same gap wording Summaries use (`./ciScopeProof.ts`,
// `./ciProofWording.ts`). For a
// selected story's comparison, the same baseline, branch and landed figures
// the Summary uses (`./ciScopeComparison.ts`), one row per compared unit,
// with change markers and the observed-not-attributed statement. Without
// usable evidence, the same absence line Summaries use.

import type { ReactNode } from "react";
import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import { owningEntryOf } from "./ciScopeProof.ts";
import { scopeComparisonRowsOf } from "./ciScopeComparison.ts";
import { unitCellsAt, type CiProofCells } from "./ciProofWording.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import { EvidenceKept, EvidenceNamed } from "./IntentScopeEvidenceLabels.tsx";
import { IntentCiComparisonFrame } from "./IntentCiComparisonFrame.tsx";
import { ComparisonNamed } from "./IntentScopeComparisonTable.tsx";
import { changeKindWords } from "./CiProofFigures.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import {
  comparisonEndpointProofsChecking,
  type ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";
import { IntentScopeTimingHistory } from "./IntentScopeTimingHistory.tsx";
import { activeComparisonAfterSideOf } from "./useIntentCiComparisonEntries.ts";

// The file's table: one row of the file for each of CELLS.
function FileProofTable({
  path,
  scope,
  cells,
}: {
  readonly path: string;
  readonly scope: ReactNode;
  readonly cells: readonly (CiProofCells | ComparisonEntryCells)[];
}) {
  return (
    <CiProofTable
      label={`CI proof of ${path}`}
      scopeHeader="Scope"
      rows={cells.map((one, at) => ({
        key: at === 0 ? path : `${path}\0${String(at)}`,
        scope,
        cells: one,
      }))}
    />
  );
}

function FileProofContent({
  path,
  treeFile,
  revision,
}: {
  readonly path: string;
  readonly treeFile: IntentTreeFile | undefined;
  // The revision the tree shows, so summary evidence can name when it differs.
  readonly revision: string;
}) {
  const evidence = scopeEvidenceOf(useIntentCiEvidence());
  if (evidence.kind === "none") {
    return (
      <>
        <EvidenceKept kept={evidence.kept} />
        <p
          className="intent-summary-evidence-absent"
          {...(evidence.checking ? { "aria-live": "polite" as const } : {})}
        >
          {evidence.line}
        </p>
      </>
    );
  }

  if (evidence.kind === "comparison") {
    const marker = treeFile?.kind;
    const afterSide = activeComparisonAfterSideOf(
      evidence.answer,
      evidence.proofs,
    );
    const rows = scopeComparisonRowsOf(
      path,
      evidence.proofs.baseline,
      evidence.proofs.branch,
      evidence.proofs.landed,
      "precise",
      baselinePathOf(treeFile, path),
      marker,
      afterSide,
    );
    const { baseline, branch, landed } = evidence.proofs;
    const checking = comparisonEndpointProofsChecking(baseline, branch, landed);

    return (
      <div className="intent-file-proof">
        <IntentCiComparisonFrame
          answer={evidence.answer}
          proofs={evidence.proofs}
          relatives={rows.flatMap((cells) => [
            cells.branch.relative,
            cells.landed.relative,
          ])}
        >
          <ComparisonNamed evidence={evidence} />
          {checking && (
            <p className="intent-ci-reading" role="status">
              Reading entry comparison…
            </p>
          )}
          <FileProofTable
            path={path}
            scope={
              <>
                <ScopePath path={path} />
                {marker !== undefined ? ` ${changeKindWords[marker]}` : ""}
              </>
            }
            cells={rows}
          />
        </IntentCiComparisonFrame>
      </div>
    );
  }

  const entry = owningEntryOf(evidence.summary.entries, path);
  if (entry === undefined) {
    return (
      <>
        <EvidenceNamed evidence={evidence} revision={revision} />
        <p className="intent-summary-evidence-absent">
          This CI proof summary declares no entry holding <code>{path}</code>.
        </p>
      </>
    );
  }
  const cells = unitCellsAt(entry, path).map((unit) => unit.cells);

  return (
    <div className="intent-file-proof">
      <EvidenceNamed evidence={evidence} revision={revision} />
      <FileProofTable
        path={path}
        scope={<ScopePath path={path} />}
        cells={cells}
      />
    </div>
  );
}

// A Done file keeps local history even when the live Proof has no usable data.
export function IntentFileProof(props: Parameters<typeof FileProofContent>[0]) {
  return (
    <>
      <FileProofContent {...props} />
      <IntentScopeTimingHistory path={props.path} />
    </>
  );
}
