// How long ago a sidebar entry's session was launched, by its largest whole
// unit: "<1m" under a minute, then "5m", "2h", "3d"; the entry ticks it every
// 30 seconds (`./useTickingNow.ts`).

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

export function elapsedWords(ms: number): string {
  if (ms < minute) return "<1m";
  if (ms < hour) return `${String(Math.floor(ms / minute))}m`;
  if (ms < day) return `${String(Math.floor(ms / hour))}h`;
  return `${String(Math.floor(ms / day))}d`;
}
