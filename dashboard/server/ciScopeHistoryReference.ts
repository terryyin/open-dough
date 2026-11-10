// Scope projection owns completeness and matching. The common numeric rule
// alone owns attempt selection, local order, filtering and averaging.
import { priorBuildReferenceOf } from "../src/ciPriorBuildReference.ts";
import type { ScopeHistoryEntry } from "../src/ciScopeHistory.ts";
import type { DeclaredUnit } from "../src/ciProofUnits.ts";

export function scopeHistoryReferencesOf(
  entries: readonly ScopeHistoryEntry[],
  endpoint: string,
  expected: ReadonlyMap<DeclaredUnit, string | undefined>,
  order: readonly string[] | undefined,
) {
  const selectedKey = entries.find((entry) => entry.selected)?.key;
  return [...expected].map(([unit, signature]) => {
    const reason =
      signature === undefined
        ? "Selected scope identity unavailable: no comparable reference can be established; historical units and owning entries remain separate"
        : undefined;
    return {
      unit,
      ...(reason === undefined ? {} : { reason }),
      reference: priorBuildReferenceOf({
        endpoint,
        order,
        ...(selectedKey === undefined ? {} : { selectedKey }),
        samples: entries.map((entry) => {
          const reading = entry.readings.find(
            (reading) => reading.unit === unit,
          );
          return {
            key: entry.key,
            date: entry.date,
            landings: entry.landings.map((landing) => landing.revision),
            ...(entry.build === undefined
              ? {}
              : { revision: entry.build.revision }),
            ...(reading?.kind === "point" ? { ms: reading.ms } : {}),
            ...(reason !== undefined && !entry.selected
              ? {
                  reason:
                    reading?.kind === "gap"
                      ? `${reading.reason}; ${reason}`
                      : reason,
                }
              : reading?.kind === "gap"
                ? { reason: reading.reason }
                : reading === undefined
                  ? {
                      reason:
                        entry.kind === "gap"
                          ? entry.reason
                          : "Counted unit unavailable",
                    }
                  : {}),
          };
        }),
      }),
    };
  });
}
