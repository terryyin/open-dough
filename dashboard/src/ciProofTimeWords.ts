// Durations in Intent's CI proof (`./ciProofWording.ts`,
// `./IntentCiProof.tsx`): a scope's cumulative test execution time, precise enough to tell sub-minute
// scopes apart, and the attempt's CI wall time in whole minutes, read from its
// start and completion and never from summed durations.

const minuteMs = 60_000;

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

// "CI wall time 3 min" from the attempt's start and completion, or not
// recorded with why when either bound is absent. Never from summed durations.
export function ciWallTimeLine(
  startedAt: string | undefined,
  completedAt: string | undefined,
): string {
  const started = startedAt === undefined ? Number.NaN : Date.parse(startedAt);
  const completed =
    completedAt === undefined ? Number.NaN : Date.parse(completedAt);
  if (!Number.isFinite(started) || !Number.isFinite(completed)) {
    return "CI wall time not recorded: this attempt's CI read has no start and completion times.";
  }
  return `CI wall time ${wholeMinuteWords(completed - started)}.`;
}

// Cumulative test execution time, precise enough to tell sub-minute scopes
// apart: "340 ms", "12.5 s", "4 min 5 s", "2 h 3 min". A measured zero is
// "0 ms". CI wall time keeps its whole minutes (`ciWallTimeLine`).
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
