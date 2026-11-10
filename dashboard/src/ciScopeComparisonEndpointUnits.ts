// The units of results a compared scope shows at each endpoint and the rows
// it compares in (`./ciScopeComparison.ts`). At one endpoint a scope is a
// read gap, absent, without a file breakdown to say what it holds
// (`./ciScopeComparisonEndpoint.ts`), or one group of results per unit there
// (`./ciScopeProof.ts`, `./ciProofUnits.ts`) with its count
// (`./ciScopeComparisonCounts.ts`) and timing
// (`./ciScopeComparisonTiming.ts`); an endpoint with a group holds the scope.
// Each declared unit that Baseline and a later endpoint both show compares
// on its own row. The units matching nothing on the other side share one
// row, each endpoint showing its own, when both sides have such units
// (legacy test results → test cases, test files → test cases), so that row
// shows both labelled ends and no difference; otherwise each such unit has
// its own row, where an endpoint reporting the scope only in other units
// shows it unreported, never as a zero.

import { entryTimingOf, scopeTimingOf } from "./ciProofTiming.ts";
import {
  countedAny,
  hasFileBreakdown,
  namesUnits,
  entryEvidenceOf,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  measuredOf,
  countPartGapsOf,
  unobservedOf,
  type MeasuredCount,
  type UnobservedCount,
} from "./ciScopeComparisonCounts.ts";
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

const noBreakdown = { kind: "no-breakdown" } as const;
const noCiResult = { kind: "status", text: "no CI result" } as const;

// One unit's results at a scope in one endpoint's summary.
export type UnitGroup = {
  readonly unit: CiProofUnit;
  readonly count:
    | MeasuredCount
    | UnobservedCount
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
            : countPartGapsOf(evidence).length > 0
              ? unobservedOf(evidence)
              : { kind: "nothing" },
          timing: unitTimingOf(evidence, entryTimingOf(evidence)),
        },
      ];
    }
    if (!showsEvidenceInside(evidence, figures)) return [];
    if (figures.paths === 0 && countPartGapsOf(evidence).length > 0) {
      return [
        {
          unit,
          count: unobservedOf(evidence),
          timing: unitTimingOf(evidence, scopeTimingOf(evidence, figures)),
        },
      ];
    }
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
// gap when no group can say what it holds.
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
  const outside = entryOutsidesOf(entry, path, children);
  const unresolved = entryEvidenceOf(entry).filter(
    (evidence) =>
      countPartGapsOf(evidence).length > 0 &&
      !outside.some((shown) => shown.evidence.unit === evidence.unit),
  );
  if (!entry.evidence.some(hasFileBreakdown) && unresolved.length === 0)
    return noBreakdown;
  const groups = outside.map(({ evidence, outside }): UnitGroup => ({
    unit: evidence.unit,
    count: measuredOf(evidence, outside.figures),
    timing: unitTimingOf(evidence, scopeTimingOf(evidence, outside.figures)),
  }));
  groups.push(
    ...groupsShownOf(
      unresolved.map((evidence) => ({
        evidence,
        figures: { passed: 0, failed: 0, other: 0, paths: 0 },
      })),
    ),
  );
  return endpointUnitsOf(groups, { kind: "absent" });
}
