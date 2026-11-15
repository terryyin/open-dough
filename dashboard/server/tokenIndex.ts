// A task's Token index under one tariff version (./usageTariffs.ts): its
// stored counters weighted per response at that response's own model's
// rates, summed, and divided by the reference model's input rate, so the
// result reads in the reference model's input-token equivalents. Uncached
// input and the cache writes Codex input includes take the input rate, cache
// reads the cached-input rate, and output, which already holds reasoning,
// the output rate. Weighting is linear, so a summary's per-model sums weigh
// the same as its responses one by one. A response at a speed tier the
// tariff does not price has no rate rather than a standard one, since faster
// tiers cost more; one with no recorded tier is at the tariff's tier.
import type { SummaryUsage } from "./usageTaskSummary.ts";
import type { TokenRates, UsageTariff } from "./usageTariffs.ts";

function ratesOf(
  { model, tier }: SummaryUsage,
  tariff: UsageTariff,
): TokenRates | undefined {
  if (tier !== null && !tariff.speedTier.recorded.includes(tier))
    return undefined;
  return model === null ? undefined : tariff.models[model];
}

// Undefined when the task is unpriced: a response has no rate. A task with
// no response weighs nothing.
export function tokenIndex(
  usage: readonly SummaryUsage[],
  tariff: UsageTariff,
): number | undefined {
  const reference = tariff.models[tariff.reference.model];
  if (reference === undefined) return undefined;
  let credits = 0;
  for (const group of usage) {
    const rates = ratesOf(group, tariff);
    if (rates === undefined) return undefined;
    const { tokens } = group;
    credits +=
      (tokens.uncachedInput + tokens.cacheWrite) * rates.input +
      tokens.cacheRead * rates.cachedInput +
      tokens.output * rates.output;
  }
  return credits / reference.input;
}
