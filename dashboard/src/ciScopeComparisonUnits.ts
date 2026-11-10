// The units of results a compared scope shows at each endpoint and the rows
// it compares in (`./ciScopeComparison.ts`). At one endpoint a scope is a
// read gap, absent, without a file breakdown to say what it holds
// (`./ciScopeComparisonEndpoint.ts`), or one group of results per unit there
// (`./ciScopeProof.ts`, `./ciProofUnits.ts`) with its count
// (`./ciScopeComparisonCounts.ts`) and timing
// (`./ciScopeComparisonTiming.ts`); an endpoint with a group holds the scope.
// `./ciScopeComparisonUnitRows.ts` selects the compared units and takes each
// row's count and timing from these endpoint groups.

import { entryTimingOf, scopeTimingOf } from "./ciProofTiming.ts";
import {
  countedAny,
  hasFileBreakdown,
  namesUnits,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import { measuredOf, type MeasuredCount } from "./ciScopeComparisonCounts.ts";
import {
  endpointProofReadOf,
  type ScopeEndpointGap,
} from "./ciScopeComparisonEndpoint.ts";
import { unitTimingOf, type UnitTiming } from "./ciScopeComparisonTiming.ts";
import {
  entryOutsidesOf,
  showsEvidenceInside,
  noResultsKindOf,
  owningEntryOf,
  unitResultsAt,
  type SummaryChild,
  type UnitResults,
} from "./ciScopeProof.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

export {
  comparedRowsOf,
  inRowUnits,
  rowEndpointOf,
  type ComparedRow,
  type RowEndpoint,
} from "./ciScopeComparisonUnitRows.ts";

const noBreakdown = { kind: "no-breakdown" } as const;
const noCiResult = { kind: "status", text: "no CI result" } as const;

// One unit's results at a scope in one endpoint's summary.
export type UnitGroup = {
  readonly unit: CiProofUnit;
  readonly count:
    | MeasuredCount
    | { readonly kind: "nothing" }
    | typeof noBreakdown
    | typeof noCiResult;
  readonly timing: UnitTiming | typeof noBreakdown;
};

export type EndpointUnits =
  | (ScopeEndpointGap & { readonly groups?: readonly UnitGroup[] })
  | { readonly kind: "groups"; readonly groups: readonly UnitGroup[] };

// Whether ENDPOINT holds the scope: it shows a group of its results.
export const showsResults = (endpoint: EndpointUnits): boolean =>
  endpoint.kind === "groups";

// Whether ENDPOINT places the scope in no compared build: its summary lacks
// the scope, or it has no summary to place it in.
export const absentOn = (endpoint: EndpointUnits): boolean =>
  endpoint.kind === "absent" ||
  endpoint.kind === "checking" ||
  endpoint.kind === "status";

// Each unit SHOWN at a scope (`unitResultsAt`) with results there: at its
// entry's path every unit, counted or not; inside it each unit holding a
// result or evidence gap there (`showsEvidenceInside`), counted from its
// file breakdown when a path matched, otherwise unable to say.
function groupsShownOf(shown: readonly UnitResults[]): readonly UnitGroup[] {
  return shown.flatMap(({ evidence, figures }): UnitGroup[] => {
    const { unit } = evidence;
    if (figures === undefined) {
      return [
        {
          unit,
          count: countedAny(evidence)
            ? measuredOf(evidence, evidence)
            : { kind: "nothing" },
          timing: unitTimingOf(evidence, entryTimingOf(evidence)),
        },
      ];
    }
    if (!showsEvidenceInside(evidence, figures)) return [];
    if (!hasFileBreakdown(evidence))
      return [{ unit, count: noBreakdown, timing: noBreakdown }];
    return [
      {
        unit,
        count: figures.paths > 0 ? measuredOf(evidence, figures) : noCiResult,
        timing: unitTimingOf(evidence, scopeTimingOf(evidence, figures)),
      },
    ];
  });
}

// GROUPS at an endpoint, OTHERWISE without any. Preserve each unit's gap
// when NAMED beside another unit; otherwise keep the single-unit scope
// gap and its known unit for wording.
function endpointUnitsOf(
  groups: readonly UnitGroup[],
  otherwise: EndpointUnits,
  named = false,
): EndpointUnits {
  if (groups.length === 0) return otherwise;
  if (!named && groups.every(({ count }) => count.kind === "no-breakdown"))
    return { ...noBreakdown, groups };
  return { kind: "groups", groups };
}

// What one endpoint's proof shows at a scope path. LOOKUP is the path read
// in that summary (a rename's old path at baseline).
export function scopeEndpointUnitsOf(
  proof: ComparisonEndpointProof,
  lookup: string,
): EndpointUnits {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, lookup);
  if (entry === undefined) return { kind: "absent" };
  const shown = unitResultsAt(entry, lookup);
  return endpointUnitsOf(
    groupsShownOf(shown),
    { kind: noResultsKindOf(shown) },
    namesUnits(entry),
  );
}

// What one endpoint's proof holds under PATH that none of CHILDREN's rows
// shows, per unit (`entryOutsidesOf`).
export function outsideEndpointUnitsOf(
  proof: ComparisonEndpointProof,
  path: string,
  children: readonly SummaryChild[],
): EndpointUnits {
  const read = endpointProofReadOf(proof);
  if (read.kind !== "summary") return read;
  const entry = owningEntryOf(read.entries, path);
  if (entry === undefined) return { kind: "absent" };
  if (!entry.evidence.some(hasFileBreakdown)) return noBreakdown;
  const groups = entryOutsidesOf(entry, path, children).map(
    ({ evidence, outside }): UnitGroup => ({
      unit: evidence.unit,
      count: measuredOf(evidence, outside.figures),
      timing: unitTimingOf(evidence, scopeTimingOf(evidence, outside.figures)),
    }),
  );
  return endpointUnitsOf(groups, { kind: "absent" });
}
