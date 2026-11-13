// CI Proof of a selected test file (`./IntentFileReading.tsx`): Intent's one
// CI evidence owner (`./IntentCiEvidence.tsx`) with no further acquisition.
// Project and Done files first read locally collected timing history above
// that evidence, independently of usable live Proof. For a
// judged-run summary, one row of counts and execution time for each unit of
// results the file shows, such as its test cases and its own test file
// outcome, with the same gap wording Summaries use (`./ciScopeProof.ts`,
// `./ciProofWording.ts`). For a
// selected story's comparison, the same baseline, branch and landed figures
// the Summary uses (`./ciScopeComparison.ts`), one row per compared unit,
// with change markers and the observed-not-attributed statement. Without
// usable evidence, the same absence line Summaries use.

import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { scopeEvidenceOf } from "./IntentScopeEvidence.tsx";
import { IntentFileProofView } from "./IntentFileProofView.tsx";
import { IntentScopeTimingHistory } from "./IntentScopeTimingHistory.tsx";

function FileProofContent(
  props: Omit<
    Parameters<typeof IntentFileProofView>[0],
    "evidence" | "preference"
  >,
) {
  return (
    <IntentFileProofView
      {...props}
      evidence={scopeEvidenceOf(useIntentCiEvidence())}
    />
  );
}

// Local history remains available even when live Proof has no usable data.
export function IntentFileProof(props: Parameters<typeof FileProofContent>[0]) {
  return (
    <>
      <IntentScopeTimingHistory path={props.path} file />
      <FileProofContent {...props} />
    </>
  );
}
