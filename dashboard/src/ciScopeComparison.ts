// Scope comparison of a selected story's CI endpoints for Intent Summaries,
// a selected file's Proof (`./IntentFileProof.tsx`), the homepage's entry
// rows (`./IntentScopeProof.tsx`, `./storyCiComparisonEntries.ts`) and the
// tree (`./intentTreeComparison.ts`): for one path and each endpoint's proof
// summary, take what that scope shows in each unit
// (`./ciScopeComparisonUnits.ts`: entry totals at the entry's own path;
// folder and file figures from the file breakdown), compare each declared
// unit Baseline and a later endpoint both show on its own row, and keep the
// units matching nothing on the other side apart from them
// (`./ciProofUnits.ts`); each row's cells are `./ciScopeComparisonRow.ts`'s.
// A rename reads its baseline at its old path. Summary and file use precise
// duration words; the homepage keeps whole-second words. Parts completeness
// stays from the landed summary (or branch when landed has none), of the
// row's own units.

import {
  noComparisonCues,
  type ComparisonAfterSide,
} from "./ciScopeComparisonCues.ts";
import { rowCellsOf } from "./ciScopeComparisonRow.ts";
import type { ComparisonTimingPrecision } from "./ciScopeComparisonTiming.ts";
import { outsidePartsOf, partsForPath } from "./ciScopeComparisonPrimary.ts";
import type { SummaryChild } from "./ciScopeProof.ts";
import {
  absentOn,
  comparedRowsOf,
  outsideEndpointUnitsOf,
  scopeEndpointUnitsOf,
  showsResults,
} from "./ciScopeComparisonUnits.ts";
import type { ChangeKind } from "./reviewFileTree.ts";
import type {
  ComparisonEndpointProof,
  ComparisonEntryCells,
} from "./storyCiComparisonEntries.ts";

export {
  primaryEndpointOf,
  primaryProofOf,
} from "./ciScopeComparisonPrimary.ts";

const notInCompared = { text: "not in the compared builds" };

// The compared rows of one scope path across the three endpoint proofs: one
// per declared unit Baseline and a later endpoint both show, and the units
// that match nothing on the other side together or each on its own row
// (`comparedRowsOf`). `baselineLookup` is the path read at baseline (a
// rename's old path). `changeKind` is the story overlay's change kind when
// the path is a story change; the cells carry it as their Change.
// `afterSide` is the active comparison's after endpoint for cues.
export function scopeComparisonRowsOf(
  path: string,
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  precision: ComparisonTimingPrecision,
  baselineLookup: string = path,
  changeKind?: ChangeKind,
  afterSide: ComparisonAfterSide = "landed",
): readonly ComparisonEntryCells[] {
  const endpoints = {
    before: scopeEndpointUnitsOf(baseline, baselineLookup),
    branch: scopeEndpointUnitsOf(branch, path),
    landed: scopeEndpointUnitsOf(landed, path),
  };
  // Never measured in any compared summary — including when one endpoint is
  // still running or unavailable, and when a no-breakdown baseline cannot
  // place a later-trunk file. A removed story file keeps "removed" instead.
  const neverInComparedBuilds =
    changeKind !== "deleted" &&
    [baseline, branch, landed].some((proof) => proof.kind === "summary") &&
    ((absentOn(endpoints.before) &&
      absentOn(endpoints.branch) &&
      absentOn(endpoints.landed)) ||
      (endpoints.before.kind === "no-breakdown" &&
        endpoints.branch.kind === "absent" &&
        absentOn(endpoints.landed) &&
        changeKind === undefined));
  if (neverInComparedBuilds) {
    return [
      {
        // No measured count at any endpoint — same words as a scope with no
        // CI result, never a signed difference of zeros.
        counts: "no CI result",
        countedResults: undefined,
        ...partsForPath(path, undefined, baseline, branch, landed),
        baseline: notInCompared,
        branch: notInCompared,
        landed: notInCompared,
        cues: noComparisonCues,
        ...(changeKind === undefined ? {} : { change: changeKind }),
      },
    ];
  }
  const renamed = baselineLookup !== path && showsResults(endpoints.before);
  return comparedRowsOf(
    endpoints.before,
    endpoints.branch,
    endpoints.landed,
  ).map((row) =>
    rowCellsOf(row, endpoints, {
      precision,
      afterSide,
      ...(changeKind === undefined ? {} : { changeKind }),
      ...(renamed ? { renameNote: ` (was ${baselineLookup})` } : {}),
      parts: ({ units }) => partsForPath(path, units, baseline, branch, landed),
    }),
  );
}

// Comparison rows for the Summary's "Not in the rows above": each
// endpoint's outside figures under PATH given the same CHILDREN, one row per
// compared unit as a scope's, with Parts of the row's own units
// (`outsidePartsOf`).
export function outsideComparisonRowsOf(
  path: string,
  children: readonly SummaryChild[],
  baseline: ComparisonEndpointProof,
  branch: ComparisonEndpointProof,
  landed: ComparisonEndpointProof,
  precision: ComparisonTimingPrecision,
  afterSide: ComparisonAfterSide = "landed",
): readonly ComparisonEntryCells[] {
  const endpoints = {
    before: outsideEndpointUnitsOf(baseline, path, children),
    branch: outsideEndpointUnitsOf(branch, path, children),
    landed: outsideEndpointUnitsOf(landed, path, children),
  };
  return comparedRowsOf(
    endpoints.before,
    endpoints.branch,
    endpoints.landed,
  ).map((row) =>
    rowCellsOf(row, endpoints, {
      precision,
      afterSide,
      parts: ({ units }) =>
        outsidePartsOf(path, children, units, baseline, branch, landed),
    }),
  );
}
