// A task's Token index under one tariff version (./usageTariffs.ts): its
// stored counters weighted per response at that response's own model's
// rates, summed, and divided by the reference model's input rate, so the
// result reads in the reference model's input-token equivalents. Uncached
// input and the cache writes Codex input includes take the input rate, cache
// reads the cached-input rate, and output, which already holds reasoning,
// the output rate. Weighting is linear, so a summary's per-model sums weigh
// the same as its responses one by one.
import type { SummaryUsage } from "./usageTaskSummary.ts";
import type { UsageTariff } from "./usageTariffs.ts";

// Undefined when the task has no response or a response's model has no rate.
export function tokenIndex(
  usage: readonly SummaryUsage[],
  tariff: UsageTariff,
): number | undefined {
  const reference = tariff.models[tariff.reference.model];
  if (usage.length === 0 || reference === undefined) return undefined;
  let credits = 0;
  for (const { model, tokens } of usage) {
    const rates = model === null ? undefined : tariff.models[model];
    if (rates === undefined) return undefined;
    credits +=
      (tokens.uncachedInput + tokens.cacheWrite) * rates.input +
      tokens.cacheRead * rates.cachedInput +
      tokens.output * rates.output;
  }
  return credits / reference.input;
}
