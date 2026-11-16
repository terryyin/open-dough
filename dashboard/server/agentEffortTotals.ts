import {
  collectContributions,
  tokenSum,
  type ContributionEntry,
} from "./usageContributions.ts";
import { usageTokenCategories, type UsageObservation } from "./usageRecords.ts";

export function responseEntries(
  responses: UsageObservation[],
): ContributionEntry[] {
  const collected = collectContributions();
  for (const response of responses)
    collected.add(response, {
      taskId: null,
      candidates: ["selected-native-evidence"],
      gaps: [],
    });
  return Object.values(collected.sessions).flatMap(
    (session) => session.entries,
  );
}

// The same disjoint sums used by Usage; nullable counts retain known subtotals.
export function effortTotals(entries: ContributionEntry[], incomplete = false) {
  const requests = entries.reduce((sum, entry) => sum + entry.responses, 0);
  let sums = {
    uncachedInput: 0,
    cacheRead: 0,
    cacheWrite: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    output: 0,
  } as ReturnType<typeof tokenSum>;
  const missing = { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
  for (const entry of entries) {
    sums = tokenSum(sums, entry.tokens);
    for (const category of usageTokenCategories)
      missing[category] += entry.missing[category];
  }
  const metric = (value: number | undefined, absent: number) => ({
    value:
      value === undefined || requests === 0 || absent === requests
        ? null
        : value,
    status:
      value === undefined || requests === 0 || absent === requests
        ? "unavailable"
        : incomplete || absent > 0
          ? "partial"
          : "complete",
    missingRequests: absent,
  });
  const inputMissing = Math.max(
    missing.uncachedInput,
    missing.cacheRead,
    missing.cacheWrite,
  );
  const lifetime = (category: "cacheWrite5m" | "cacheWrite1h") => {
    const known = entries.filter(
      (entry) => entry.tokens[category] !== undefined,
    );
    const absent =
      requests - known.reduce((sum, entry) => sum + entry.responses, 0);
    const total = known.reduce<ReturnType<typeof tokenSum>>(
      (sum, entry) => tokenSum(sum, entry.tokens),
      {
        uncachedInput: 0,
        cacheRead: 0,
        cacheWrite: 0,
        cacheWrite5m: 0,
        cacheWrite1h: 0,
        output: 0,
      },
    );
    return metric(total[category], absent);
  };
  const knownInput = entries.some((entry) =>
    ["uncachedInput", "cacheRead", "cacheWrite"].some(
      (category) =>
        entry.missing[category as keyof typeof missing] < entry.responses,
    ),
  );
  return {
    requests: {
      value: requests || (incomplete ? null : 0),
      status: incomplete ? "partial" : "complete",
    },
    totalInput: {
      value: knownInput
        ? sums.uncachedInput + sums.cacheRead + sums.cacheWrite
        : null,
      status: !knownInput
        ? "unavailable"
        : incomplete || inputMissing > 0
          ? "partial"
          : "complete",
      missingComponents: {
        uncachedInput: missing.uncachedInput,
        cachedInput: missing.cacheRead,
        cacheWrite: missing.cacheWrite,
      },
    },
    uncachedInput: metric(sums.uncachedInput, missing.uncachedInput),
    cachedInput: metric(sums.cacheRead, missing.cacheRead),
    cacheWrite: metric(sums.cacheWrite, missing.cacheWrite),
    cacheWrite5m: lifetime("cacheWrite5m"),
    cacheWrite1h: lifetime("cacheWrite1h"),
    output: metric(sums.output, missing.output),
  };
}
