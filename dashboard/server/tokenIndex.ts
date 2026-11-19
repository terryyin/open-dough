// A task's Token index under one tariff version (./usageTariffs.ts): its
// stored counters weighted per response at that response's own model's
// rates, summed, and divided by the reference model's input rate, so the
// result reads in the reference model's input-token equivalents. Uncached
// input takes the input rate, cache reads the cached-input rate, and output,
// which already holds reasoning, the output rate. Cache writes take the input
// rate, as Codex input includes them, unless the tariff prices five-minute
// and one-hour writes apart: then each takes its own rate, and writes stored
// without that split (an earlier store, a response without it) have no rate
// rather than one guessed from the mix; a group that wrote nothing needs no
// split. Weighting is linear, so a summary's per-model sums weigh
// the same as its responses one by one. A response at a speed tier the
// tariff does not price has no rate rather than a standard one, since faster
// tiers cost more; one with no recorded tier is at the tariff's tier.
// A named model the tariff does not list takes the reference model's rates
// as an estimate: the weighing carries each actual model with its substitute
// so the view can ask for the rate card to be updated. An absent model has no
// rate.
import type { SummaryUsage } from "./usageTaskSummary.ts";
import type { TokenRates, UsageTariff } from "./usageTariffs.ts";

function writeCredits(
  { cacheWrite, cacheWrite5m, cacheWrite1h }: SummaryUsage["tokens"],
  { input, cacheWrites }: TokenRates,
): number | undefined {
  if (cacheWrites === undefined) return cacheWrite * input;
  if (cacheWrite === 0) return 0;
  if (
    cacheWrite5m === undefined ||
    cacheWrite1h === undefined ||
    cacheWrite5m + cacheWrite1h !== cacheWrite
  )
    return undefined;
  return (
    cacheWrite5m * cacheWrites.fiveMinute + cacheWrite1h * cacheWrites.oneHour
  );
}

// The group's rates and, when they stand in for an unlisted model's, the
// substitute model they belong to.
function ratesOf(
  { model, tier }: SummaryUsage,
  tariff: UsageTariff,
): { rates: TokenRates; substitute?: string } | undefined {
  if (tier !== null && !tariff.speedTier.recorded.includes(tier))
    return undefined;
  if (model === null) return undefined;
  const listed = tariff.models[model];
  if (listed !== undefined) return { rates: listed };
  const substitute = tariff.reference.model;
  const reference = tariff.models[substitute];
  return reference === undefined ? undefined : { rates: reference, substitute };
}

type WeighedUsage = {
  readonly index: number;
  // Each distinct actual model weighed at another model's rates, by id, with
  // that substitute model's id.
  readonly substitutes: ReadonlyMap<string, string>;
};

// Undefined when the task is unpriced: a response has no rate. A task with
// no response weighs nothing.
export function tokenIndex(
  usage: readonly SummaryUsage[],
  tariff: UsageTariff,
): WeighedUsage | undefined {
  const reference = tariff.models[tariff.reference.model];
  if (reference === undefined) return undefined;
  let credits = 0;
  const substitutes = new Map<string, string>();
  for (const group of usage) {
    const priced = ratesOf(group, tariff);
    if (priced === undefined) return undefined;
    const { rates, substitute } = priced;
    if (substitute !== undefined && group.model !== null)
      substitutes.set(group.model, substitute);
    const writes = writeCredits(group.tokens, rates);
    if (writes === undefined) return undefined;
    const { tokens } = group;
    credits +=
      tokens.uncachedInput * rates.input +
      writes +
      tokens.cacheRead * rates.cachedInput +
      tokens.output * rates.output;
  }
  return { index: credits / reference.input, substitutes };
}
