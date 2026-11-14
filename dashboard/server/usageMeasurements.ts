// A stop reason describes one API response, never its owning task's outcome.
import { type UsageMeasurement, type UsageTokens } from "./usageRecords.ts";

export function reconcileMeasurements(
  facts: UsageMeasurement[],
): UsageMeasurement[] {
  const groups = new Map<string, UsageMeasurement[]>();
  for (const fact of facts) {
    const { completion, ...raw } = fact;
    // Only identical raw evidence can acquire previously absent metadata.
    // Changed counters, source lines, settings or lineage remain competing facts.
    const key = JSON.stringify(raw);
    const group = groups.get(key) ?? [];
    if (completion) {
      const missing = group.findIndex((item) => !item.completion);
      if (missing !== -1) group.splice(missing, 1);
      if (
        !group.some(
          (item) => item.completion?.stopReason === completion.stopReason,
        )
      )
        group.push(fact);
    } else if (group.length === 0) group.push(fact);
    groups.set(key, group);
  }
  return [...groups.values()].flat();
}

function isProgressive(measurement: UsageMeasurement): boolean {
  return (
    measurement.definition === "claude-disjoint-input" &&
    measurement.completion?.stopReason === null
  );
}

export function measurementsForCounter(
  measurements: UsageMeasurement[],
  name: keyof UsageTokens,
): UsageMeasurement[] {
  if (name !== "output" && name !== "reasoningOutput") return measurements;
  // Explicit progress is not a final output measurement. Unclassified legacy
  // facts keep their prior meaning and can still conflict with terminal facts.
  return measurements.filter((item) => !isProgressive(item));
}

export function hasIncompleteOutput(measurements: UsageMeasurement[]): boolean {
  return (
    measurements.some(isProgressive) &&
    !measurementsForCounter(measurements, "output").some(
      (item) => item.tokens.output !== null,
    )
  );
}
