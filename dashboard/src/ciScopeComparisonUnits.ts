// Compared unit rows and their endpoint figures. Endpoint evidence is
// interpreted by ./ciScopeComparisonEndpointUnits.ts; this module matches
// units across builds and selects the figures for each resulting row.
import { listedUnits, type CiProofUnit } from "./ciProofUnits.ts";
import type { ScopeEndpointCount } from "./ciScopeComparisonCounts.ts";
import type { ScopeEndpointTiming } from "./ciScopeComparisonTiming.ts";
import type {
  EndpointUnits,
  UnitGroup,
} from "./ciScopeComparisonEndpointUnits.ts";
export {
  absentOn,
  outsideEndpointUnitsOf,
  scopeEndpointUnitsOf,
  showsResults,
  type EndpointUnits,
  type UnitGroup,
} from "./ciScopeComparisonEndpointUnits.ts";

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
    count.kind === "measured" || count.kind === "unobserved" ? [count] : [],
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
