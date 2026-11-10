// Held file evidence; the public wrapper independently adds local history.
import { ScopePath } from "./CiProofTable.tsx";
import { owningEntryOf } from "./ciScopeProof.ts";
import { unitCellsAt } from "./ciProofWording.ts";
import type { ScopeEvidence } from "./IntentScopeEvidence.tsx";
import { EvidenceKept, EvidenceNamed } from "./IntentScopeEvidenceLabels.tsx";
import {
  FileComparison,
  FileComparisonContent,
  FileProofTable,
} from "./IntentFileComparisonContent.tsx";
import type { ComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";

export function IntentFileProofView({
  path,
  treeFile,
  revision,
  evidence,
  preference,
}: {
  readonly path: string;
  readonly treeFile: IntentTreeFile | undefined;
  // The revision the tree shows, so summary evidence can name when it differs.
  readonly revision: string;
  readonly evidence: ScopeEvidence;
  readonly preference?: ComparisonPreference;
}) {
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
    const compared = { path, treeFile, evidence };
    return preference === undefined ? (
      <FileComparison {...compared} />
    ) : (
      <FileComparisonContent {...compared} preference={preference} />
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
