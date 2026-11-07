// Durations in Intent's CI proof (`./ciProofWording.ts`,
// `./IntentCiProof.tsx`): a scope's cumulative test execution time, precise enough to tell sub-minute
// scopes apart, and the attempt's CI wall time in whole minutes, read from its
// start and completion and never from summed durations. Story CI comparison
// (`./storyCiComparisonWording.ts`) uses whole-second words so sub-minute
// differences stay distinct.

const minuteMs = 60_000;
const secondMs = 1_000;

// Whole minutes / hours / days for Intent CI wall time, and for a long test
// execution time (`executionTimeWords`).
function wholeMinuteWords(ms: number): string {
  const minutes = Math.floor(Math.max(0, ms) / minuteMs);
  if (minutes < 1) return "less than 1 min";
  if (minutes < 60) return `${String(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${String(hours)} h ${String(minutes % 60)} min`;
  return `${String(Math.floor(hours / 24))} d ${String(hours % 24)} h`;
}

// Whole-second duration for story CI comparison: "3 min", "3 min 20 s",
// "20 s", "1 h 2 min 3 s". Never rounds a sub-minute change away.
export function wholeSecondWords(ms: number): string {
  const seconds = Math.round(Math.max(0, ms) / secondMs);
  if (seconds < 60) return `${String(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes < 60)
    return rest === 0
      ? `${String(minutes)} min`
      : `${String(minutes)} min ${String(rest)} s`;
  const hours = Math.floor(minutes / 60);
  const minuteRest = minutes % 60;
  const parts = [`${String(hours)} h`];
  if (minuteRest > 0) parts.push(`${String(minuteRest)} min`);
  if (rest > 0) parts.push(`${String(rest)} s`);
  return parts.join(" ");
}

// Signed whole-second difference for comparison: "+20 s", "+1 min", "−30 s".
export function wholeSecondDifferenceWords(ms: number): string {
  if (ms === 0) return "0 s";
  const sign = ms > 0 ? "+" : "−";
  return `${sign}${wholeSecondWords(Math.abs(ms))}`;
}

// Percentage of a measured non-zero baseline duration only: "+10%", "−25%".
// A measured zero baseline yields no percentage.
export function durationPercentageWords(
  baselineMs: number,
  deltaMs: number,
): string | undefined {
  if (!(baselineMs > 0)) return undefined;
  const pct = Math.round((deltaMs / baselineMs) * 100);
  if (pct === 0) return "0%";
  return pct > 0 ? `+${String(pct)}%` : `−${String(Math.abs(pct))}%`;
}

// Readable duration change: "8 s → 12 s (+4 s, +50%)", "4 s (no change)",
// or "0 s → 2 s (+2 s)" with no percentage for a measured zero baseline.
export function durationChangeWords(
  baselineMs: number,
  afterMs: number,
  value: (ms: number) => string,
  difference: (ms: number) => string,
): string {
  const before = value(baselineMs);
  const after = value(afterMs);
  const delta = afterMs - baselineMs;
  if (delta === 0) return `${after} (no change)`;
  const diff = difference(delta);
  const pct = durationPercentageWords(baselineMs, delta);
  return pct === undefined
    ? `${before} → ${after} (${diff})`
    : `${before} → ${after} (${diff}, ${pct})`;
}

export function wallTimeMs(
  startedAt: string | undefined,
  completedAt: string | undefined,
): number | undefined {
  const started = startedAt === undefined ? Number.NaN : Date.parse(startedAt);
  const completed =
    completedAt === undefined ? Number.NaN : Date.parse(completedAt);
  if (!Number.isFinite(started) || !Number.isFinite(completed))
    return undefined;
  return Math.max(0, completed - started);
}

// "CI wall time 3 min" from the attempt's start and completion, or not
// recorded with why when either bound is absent. Never from summed durations.
export function ciWallTime(
  startedAt: string | undefined,
  completedAt: string | undefined,
): { readonly words: string; readonly full?: string } {
  const ms = wallTimeMs(startedAt, completedAt);
  if (ms === undefined)
    return {
      words: "CI wall time not recorded",
      full: "This attempt's CI read has no start and completion times.",
    };
  return { words: `CI wall time ${wholeMinuteWords(ms)}` };
}

// Cumulative test execution time, precise enough to tell sub-minute scopes
// apart: "340 ms", "12.5 s", "4 min 5 s", "2 h 3 min". A measured zero is
// "0 ms". CI wall time keeps its whole minutes (`ciWallTime`).
export function executionTimeWords(ms: number): string {
  const rounded = Math.round(Math.max(0, ms));
  if (rounded < 1000) return `${String(rounded)} ms`;
  if (rounded < 59_950) return `${(rounded / 1000).toFixed(1)} s`;
  const seconds = Math.round(rounded / 1000);
  if (seconds < 3600) {
    const rest = seconds % 60;
    return `${String(Math.floor(seconds / 60))} min${rest === 0 ? "" : ` ${String(rest)} s`}`;
  }
  return wholeMinuteWords(rounded);
}

// Signed precise difference for Summary comparisons: "+70 ms", "+4.0 s",
// "−300 ms". Never rounds a sub-second change away.
export function executionTimeDifferenceWords(ms: number): string {
  if (ms === 0) return "0 ms";
  const sign = ms > 0 ? "+" : "−";
  return `${sign}${executionTimeWords(Math.abs(ms))}`;
}
