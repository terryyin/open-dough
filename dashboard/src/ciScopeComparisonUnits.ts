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
  listedUnits,
  type CiProofUnit,
} from "./ciProofUnits.ts";
import {
  measuredOf,
  type MeasuredCount,
  type ScopeEndpointCount,
} from "./ciScopeComparisonCounts.ts";
import {
  endpointProofReadOf,
  type ScopeEndpointGap,
} from "./ciScopeComparisonEndpoint.ts";
import {
  unitTimingOf,
  type ScopeEndpointTiming,
  type UnitTiming,
} from "./ciScopeComparisonTiming.ts";
import {
  entryOutsidesOf,
  holdsResultInside,
  noResultsKindOf,
  owningEntryOf,
  unitResultsAt,
  type SummaryChild,
  type UnitResults,
} from "./ciScopeProof.ts";
import type { ComparisonEndpointProof } from "./storyCiComparisonEntries.ts";

const noBreakdown = { kind: "no-breakdown" } as const;

// One unit's results at a scope in one endpoint's summary.
export type UnitGroup = {
  readonly unit: CiProofUnit;
  readonly count:
    MeasuredCount | { readonly kind: "nothing" } | typeof noBreakdown;
  readonly timing: UnitTiming | typeof noBreakdown;
};

export type EndpointUnits =
  | ScopeEndpointGap
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
// result there (`holdsResultInside`), counted from its file breakdown, or
// without one, so cannot say.
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
    if (!holdsResultInside(evidence, figures)) return [];
    if (!hasFileBreakdown(evidence))
      return [{ unit, count: noBreakdown, timing: noBreakdown }];
    return [
      {
        unit,
        count: measuredOf(evidence, figures),
        timing: unitTimingOf(evidence, scopeTimingOf(evidence, figures)),
      },
    ];
  });
}

// GROUPS at an endpoint, OTHERWISE without any; no file breakdown when no
// group can say what the scope holds.
function endpointUnitsOf(
  groups: readonly UnitGroup[],
  otherwise: EndpointUnits,
): EndpointUnits {
  if (groups.length === 0) return otherwise;
  if (groups.every(({ count }) => count.kind === "no-breakdown"))
    return noBreakdown;
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
  return endpointUnitsOf(groupsShownOf(shown), {
    kind: noResultsKindOf(shown),
  });
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

// One compared row of a scope: the units its figures are taken in (every
// unit when no endpoint shows one).
export type ComparedRow = {
  readonly units: readonly CiProofUnit[] | undefined;
};

// Whether a compared row in UNITS takes figures in UNIT.
export const inRowUnits = (
  units: ComparedRow["units"],
  unit: CiProofUnit,
): boolean => units === undefined || units.includes(unit);

const unitsOf = (endpoint: EndpointUnits): readonly CiProofUnit[] =>
  endpoint.kind === "groups" ? endpoint.groups.map(({ unit }) => unit) : [];

// The rows a scope compares in across BASELINE and the later endpoints.
export function comparedRowsOf(
  baseline: EndpointUnits,
  branch: EndpointUnits,
  landed: EndpointUnits,
): readonly ComparedRow[] {
  const before = unitsOf(baseline);
  const later = [...unitsOf(branch), ...unitsOf(landed)];
  const shown = listedUnits.filter(
    (unit) => before.includes(unit) || later.includes(unit),
  );
  if (shown.length === 0) return [{ units: undefined }];
  const matched = shown.filter(
    (unit) =>
      unit !== "legacy" && before.includes(unit) && later.includes(unit),
  );
  const unmatched = (units: readonly CiProofUnit[]) =>
    units.some((unit) => !matched.includes(unit));
  const own = (unit: CiProofUnit): ComparedRow => ({ units: [unit] });
  if (!unmatched(before) || !unmatched(later)) return shown.map(own);
  return [
    ...matched.map(own),
    { units: shown.filter((unit) => !matched.includes(unit)) },
  ];
}

// An endpoint's count and timing in one row.
export type RowEndpoint = {
  readonly count: ScopeEndpointCount;
  readonly timing: ScopeEndpointTiming;
};

const unreported = { kind: "unreported" } as const;

// Several groups' counts and timings kept apart; a group that cannot say
// stands in only when no other can.
function severalOf(groups: readonly [UnitGroup, ...UnitGroup[]]): RowEndpoint {
  const counts = groups.flatMap(({ count }) =>
    count.kind === "measured" ? [count] : [],
  );
  const timings = groups.flatMap(({ timing }) =>
    timing.kind === "no-breakdown" ? [] : [timing],
  );
  const [count] = counts;
  const [timing] = timings;
  return {
    count:
      counts.length > 1
        ? { kind: "units", counts }
        : (count ?? groups[0].count),
    timing:
      timings.length > 1
        ? { kind: "units", timings }
        : (timing ?? groups[0].timing),
  };
}

// ENDPOINT's count and timing in ROW's units.
export function rowEndpointOf(
  endpoint: EndpointUnits,
  row: ComparedRow,
): RowEndpoint {
  if (endpoint.kind !== "groups") return { count: endpoint, timing: endpoint };
  const groups = endpoint.groups.filter(({ unit }) =>
    inRowUnits(row.units, unit),
  );
  const [first, ...rest] = groups;
  if (first === undefined) return { count: unreported, timing: unreported };
  return rest.length === 0
    ? { count: first.count, timing: first.timing }
    : severalOf([first, ...rest]);
}
