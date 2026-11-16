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
export function effortTotals(entries: ContributionEntry[], incomplete = false, responses: UsageObservation[] = []) {
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
  // The native reader retains inclusive Codex input independently of cache detail.
  // Preserve that reported observation; never infer its missing disjoint categories.
  let adjustment = 0;
  let inclusiveKnown = 0;
  for (const response of responses) {
    if (response.host !== "codex") continue;
    const values = new Set(response.measurements.map((item) => item.reported["input_tokens"]).filter((value) => value !== undefined));
    if (values.size !== 1) continue;
    const [inclusive] = values;
    if (inclusive === undefined) continue;
    const normalized = effortTotals(responseEntries([response])).totalInput.value ?? 0;
    adjustment += inclusive - normalized;
    inclusiveKnown++;
  }
  const inputValue = knownInput || inclusiveKnown ? sums.uncachedInput + sums.cacheRead + sums.cacheWrite + adjustment : null;
  const inputStatus = inputValue === null ? "unavailable" : incomplete || (inputMissing > 0 && inclusiveKnown !== requests) ? "partial" : "complete";
  const outputValue = metric(sums.output, missing.output);
  return {
    totalTokens: {
      value: inputValue === null && outputValue.value === null ? null : (inputValue ?? 0) + (outputValue.value ?? 0),
      status: inputStatus === "complete" && outputValue.status === "complete" ? "complete" : inputValue === null && outputValue.value === null ? "unavailable" : "partial",
    },
    requests: {
      value: requests || (incomplete ? null : 0),
      status: incomplete ? "partial" : "complete",
    },
    totalInput: {
      value: inputValue,
      status: inputStatus,
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
