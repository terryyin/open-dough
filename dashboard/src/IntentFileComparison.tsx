// Compact CI timing comparison for a selected test file
// (`./IntentFileReading.tsx`): the same baseline, branch and landed figures
// the Summary uses (`./ciScopeComparison.ts`), read from Intent's one CI
// evidence owner (`./IntentCiEvidence.tsx`) with no further CI read. It sits
// above Purpose when the evidence is a story CI comparison (including when
// Review attribution is unavailable); without that comparison target it is
// not shown.

import { CiProofTable, ScopePath } from "./CiProofTable.tsx";
import { scopeComparisonCellsOf } from "./ciScopeComparison.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { EvidenceKept, scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import { ComparisonNamed } from "./IntentScopeComparisonTable.tsx";
import { changeKindWords } from "./IntentScopeProofChild.tsx";
import { baselinePathOf, type IntentTreeFile } from "./intentStoryOverlay.ts";
import { comparisonEndpointProofsChecking } from "./storyCiComparisonEntries.ts";

export function IntentFileComparison({
  path,
  treeFile,
}: {
  readonly path: string;
  readonly treeFile: IntentTreeFile | undefined;
}) {
  const raw = useIntentCiEvidence();
  // Compact comparison follows a selected story's CI comparison evidence,
  // including when Review attribution is unavailable. Without a story
  // comparison target, the homepage judgment must not become a File summary.
  if (
    raw.kind !== "comparison" &&
    !(raw.kind === "judged" && raw.comparison !== undefined)
  )
    return null;
  const evidence = scopeEvidenceOf(raw);
  if (evidence.kind === "none") {
    return (
      <section className="intent-file-comparison" aria-label="File summary">
        <EvidenceKept kept={evidence.kept} />
        <p
          className="intent-summary-evidence-absent"
          {...(evidence.checking ? { "aria-live": "polite" as const } : {})}
        >
          {evidence.line}
        </p>
      </section>
    );
  }
  if (evidence.kind !== "comparison") return null;

  const marker = treeFile?.kind;
  const cells = scopeComparisonCellsOf(
    path,
    evidence.proofs.baseline,
    evidence.proofs.branch,
    evidence.proofs.landed,
    "precise",
    baselinePathOf(treeFile, path),
    marker,
  );
  const { baseline, branch, landed } = evidence.proofs;
  const checking = comparisonEndpointProofsChecking(baseline, branch, landed);

  return (
    <section className="intent-file-comparison" aria-label="File summary">
      <ComparisonNamed evidence={evidence} />
      {checking && (
        <p className="intent-ci-reading" role="status">
          Reading entry comparison…
        </p>
      )}
      <CiProofTable
        label={`CI proof of ${path}`}
        scopeHeader="Scope"
        rows={[
          {
            key: path,
            scope: (
              <>
                <ScopePath path={path} />
                {marker !== undefined ? ` ${changeKindWords[marker]}` : ""}
              </>
            ),
            cells,
          },
        ]}
      />
    </section>
  );
}
