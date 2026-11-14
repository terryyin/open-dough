// Codex input includes cached reads and writes. Reasoning is already in output;
// total/turn/thread/lifetime counters are deliberately not additive sources.
import { emptyUsageTokens, type UsageTokens } from "./usageRecords.ts";
const names = [
  "input_tokens",
  "cached_input_tokens",
  "cache_write_input_tokens",
  "output_tokens",
  "reasoning_output_tokens",
  "total_tokens",
] as const;

export function codexCounters(raw: Record<string, unknown>): {
  reported: Record<string, number>;
  tokens: UsageTokens;
  gaps: string[];
} {
  const reported: Record<string, number> = {};
  const gaps: string[] = [];
  for (const name of names) {
    const value = raw[name];
    if (value === undefined) continue;
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0)
      reported[name] = value;
    else gaps.push("invalid-token-counter");
  }
  const tokens = emptyUsageTokens();
  tokens.cacheRead = reported["cached_input_tokens"] ?? null;
  tokens.cacheWrite = reported["cache_write_input_tokens"] ?? null;
  tokens.output = reported["output_tokens"] ?? null;
  tokens.reasoningOutput = reported["reasoning_output_tokens"] ?? null;
  const inclusive = reported["input_tokens"];
  if (
    inclusive !== undefined &&
    tokens.cacheRead !== null &&
    tokens.cacheWrite !== null
  ) {
    const uncached = inclusive - tokens.cacheRead - tokens.cacheWrite;
    if (uncached >= 0) tokens.uncachedInput = uncached;
    else gaps.push("inconsistent-input-components");
  }
  if (
    tokens.reasoningOutput !== null &&
    tokens.output !== null &&
    tokens.reasoningOutput > tokens.output
  ) {
    tokens.reasoningOutput = null;
    gaps.push("inconsistent-output-subset");
  }
  return { reported, tokens, gaps };
}
