// File comparison content uses the same selected scope and file-unit scale as production.
import type { ReactNode } from "react";
import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import { scopeComparisonRowsOf } from "./ciScopeComparison.ts";
import type { CiProofCells } from "./ciProofWording.ts";
import type { ScopeEvidence } from "./IntentScopeEvidence.tsx";
import { IntentCiComparisonFrameView } from "./IntentCiComparisonFrameView.tsx";
import {
  useCiComparisonPreference,
  type ComparisonPreference,
} from "./IntentCiComparisonPreference.tsx";
import { ComparisonNamed } from "./IntentComparisonNamed.tsx";
import { changeKindWords } from "./CiProofFigures.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import {
  comparisonEndpointProofsChecking,
  type ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";
import { activeComparisonAfterSideOf } from "./useIntentCiComparisonEntries.ts";

// The file's table: one row of the file for each of CELLS.
export function FileProofTable({
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

export function FileComparisonContent({
  path,
  treeFile,
  evidence,
  preference,
}: {
  readonly path: string;
  readonly treeFile: IntentTreeFile | undefined;
  readonly evidence: Extract<ScopeEvidence, { kind: "comparison" }>;
  readonly preference: ComparisonPreference;
}) {
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
      <IntentCiComparisonFrameView
        preference={preference}
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
      </IntentCiComparisonFrameView>
    </div>
  );
}

// Only a comparison consumes the story preference; Project Proof has none.
export function FileComparison(
  props: Omit<Parameters<typeof FileComparisonContent>[0], "preference">,
) {
  return (
    <FileComparisonContent
      {...props}
      preference={useCiComparisonPreference()}
    />
  );
}
