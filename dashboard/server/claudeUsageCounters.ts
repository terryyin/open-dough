// Claude reports disjoint input categories. Lifetime details refine cache writes.
import { objectOf } from "./nativeUsageFiles.ts";
import { emptyUsageTokens } from "./usageRecords.ts";

export function claudeCounters(raw: Record<string, unknown>) {
  const reported: Record<string, number> = {};
  const gaps: string[] = [];
  const read = (name: string, value: unknown): number | null => {
    if (value === undefined) return null;
    if (
      typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 0
    ) {
      reported[name] = value;
      return value;
    }
    gaps.push("invalid-token-counter");
    return null;
  };
  const tokens = emptyUsageTokens();
  tokens.uncachedInput = read("input_tokens", raw["input_tokens"]);
  tokens.cacheRead = read(
    "cache_read_input_tokens",
    raw["cache_read_input_tokens"],
  );
  tokens.cacheWrite = read(
    "cache_creation_input_tokens",
    raw["cache_creation_input_tokens"],
  );
  tokens.output = read("output_tokens", raw["output_tokens"]);
  tokens.reasoningOutput = read(
    "output_tokens_details.thinking_tokens",
    objectOf(raw["output_tokens_details"])["thinking_tokens"],
  );
  const cache = objectOf(raw["cache_creation"]);
  tokens.cacheWrite5m = read(
    "cache_creation.ephemeral_5m_input_tokens",
    cache["ephemeral_5m_input_tokens"],
  );
  tokens.cacheWrite1h = read(
    "cache_creation.ephemeral_1h_input_tokens",
    cache["ephemeral_1h_input_tokens"],
  );
  if (
    tokens.cacheWrite !== null &&
    tokens.cacheWrite5m !== null &&
    tokens.cacheWrite1h !== null &&
    tokens.cacheWrite5m + tokens.cacheWrite1h !== tokens.cacheWrite
  ) {
    tokens.cacheWrite5m = null;
    tokens.cacheWrite1h = null;
    gaps.push("inconsistent-cache-write-refinements");
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
