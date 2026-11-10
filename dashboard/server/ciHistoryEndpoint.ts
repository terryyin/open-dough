// One local retained cohort and availability meaning for exact Done endpoints.
// Dates describe observations; only shared Git order establishes precedence.
import type { ProjectHistory } from "./landedCiHistoryStore.ts";

export function historyEndpointOf(
  history: ProjectHistory,
  revision: string,
  order: readonly string[] | undefined,
) {
  const landings = Object.values(history.landings);
  const selected = landings.find((landing) => landing.revision === revision);
  const positions = new Map(order?.map((value, index) => [value, index]));
  const end = positions.get(revision);
  const outside =
    end !== undefined &&
    landings.length > 0 &&
    landings.every((landing) => (positions.get(landing.revision) ?? -1) > end);
  const unpositioned = landings.some(
    (landing) => !positions.has(landing.revision),
  );
  const availability =
    landings.length === 0
      ? "empty"
      : end === undefined || unpositioned
        ? "order-unavailable"
        : selected !== undefined
          ? "retained"
          : outside
            ? "outside-retention"
            : "uncollected";
  const cohort =
    end === undefined
      ? selected === undefined
        ? []
        : [selected]
      : landings
          .filter(
            (landing) => (positions.get(landing.revision) ?? Infinity) <= end,
          )
          .sort(
            (a, b) =>
              (positions.get(a.revision) ?? 0) -
              (positions.get(b.revision) ?? 0),
          );
  const missingReason =
    availability === "outside-retention"
      ? "Selected landing is outside the retained history"
      : end === undefined && landings.length > 0
        ? "Selected landing order unavailable from local Git evidence"
        : "Selected landing was not collected";
  return { selected, availability, cohort, missingReason } as const;
}
