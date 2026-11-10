// Rows that compare a scope's endpoint units (`./ciScopeComparisonUnits.ts`).
// Each declared unit Baseline and a later endpoint both show gets its own
// row. Units matching nothing on the other side share a row when both sides
// have such units; otherwise each gets its own. Each endpoint contributes
// only the selected units, keeping counts and timings apart and preserving
// unmeasured groups for the row's wording.

import { listedUnits, type CiProofUnit } from "./ciProofUnits.ts";
import type { ScopeEndpointCount } from "./ciScopeComparisonCounts.ts";
import type { ScopeEndpointTiming } from "./ciScopeComparisonTiming.ts";
import type { EndpointUnits, UnitGroup } from "./ciScopeComparisonUnits.ts";

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
  // The selected unit groups keep unmeasured unit identity for wording;
  // the classified count above still owns comparisons, sort keys and cues.
  readonly groups?: readonly UnitGroup[];
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
  if (endpoint.kind !== "groups")
    return {
      count: endpoint,
      timing: endpoint,
      ...(endpoint.groups === undefined ? {} : { groups: endpoint.groups }),
    };
  const groups = endpoint.groups.filter(({ unit }) =>
    inRowUnits(row.units, unit),
  );
  const [first, ...rest] = groups;
  if (first === undefined) return { count: unreported, timing: unreported };
  const figures =
    rest.length === 0
      ? { count: first.count, timing: first.timing }
      : severalOf([first, ...rest]);
  return { ...figures, groups };
}
