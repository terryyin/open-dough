// File comparison content uses the same selected scope and file-unit scale as production.
import type { ReactNode } from "react";
import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import type { ScopeComparisonEvidence } from "./IntentScopeEvidence.tsx";
import { IntentScopeComparisonFrame } from "./IntentScopeComparisonFrame.tsx";
import {
  scopeComparisonReadingOf,
  scopeComparisonRowsFor,
} from "./intentScopeComparison.ts";
import {
  useCiComparisonPreference,
  type ComparisonPreference,
} from "./IntentCiComparisonPreference.tsx";
import { changeKindWords } from "./CiProofFigures.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import {
  proofRelativeTimings,
  type ProofFigureCells,
} from "./storyCiComparisonEntries.ts";

// The file's table: one row of the file for each of CELLS.
export function FileProofTable({
  path,
  scope,
  cells,
}: {
  readonly path: string;
  readonly scope: ReactNode;
  readonly cells: readonly ProofFigureCells[];
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
  readonly evidence: ScopeComparisonEvidence;
  readonly preference: ComparisonPreference;
}) {
  const marker = treeFile?.kind;
  const rows = scopeComparisonRowsFor(
    scopeComparisonReadingOf(evidence),
    path,
    treeFile,
  );

  return (
    <div className="intent-file-proof">
      <IntentScopeComparisonFrame
        preference={preference}
        evidence={evidence}
        relatives={rows.flatMap(proofRelativeTimings)}
      >
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
      </IntentScopeComparisonFrame>
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
