// Leads from the in-scope items of one attempt's CI proof summary
// (./ci-proof-scope.mjs), ranked by summed CI time: up to LEAD_LIMIT items,
// then the folders holding the most of the rest, then the remaining tail,
// with per-unit totals of the scope. Every timed second is in exactly one of
// leads, shown folders or tail. Shares are of the scope's summed time; cases
// and means per case never mix units. Items that recorded no duration count
// in the totals only.

export const LEAD_LIMIT = 20;
const FOLDER_LIMIT = 10;

/** @typedef {import("./ci-proof-scope.mjs").ScopeItem} ScopeItem */

/**
 * Summed figures of some items: how many items, files and cases, how many
 * cases recorded a duration and the time they took, and how many recorded
 * none.
 * @typedef {{
 *   readonly items: number;
 *   readonly files: number;
 *   readonly cases: number;
 *   readonly timedCases: number;
 *   readonly durationMs: number;
 *   readonly untimed: number;
 * }} Totals
 */

/**
 * @typedef {{
 *   readonly totalMs: number;
 *   readonly timedItems: number;
 *   readonly units: readonly (Totals & { unit: string; entries: number })[];
 *   readonly leads: readonly ScopeItem[];
 *   readonly folders: readonly (Totals & { folder: string; unit: string })[];
 *   readonly folderCount: number;
 *   readonly tail: readonly (Totals & { unit: string })[];
 * }} Ranking
 */

const byPath = (one, other) => (one < other ? -1 : one > other ? 1 : 0);

// Larger summed time first; equal times by name, so a ranking is stable.
const byTime = (name) => (one, other) =>
  other.durationMs - one.durationMs || byPath(name(one), name(other));

/**
 * @param {readonly ScopeItem[]} items
 * @returns {Totals}
 */
function totalsOf(items) {
  let durationMs = 0;
  let timedCases = 0;
  for (const item of items)
    if (item.durationMs !== undefined) {
      durationMs += item.durationMs;
      timedCases += item.cases - item.untimed;
    }
  const sum = (field) => items.reduce((total, item) => total + item[field], 0);
  return {
    items: items.length,
    files: items.filter((item) => item.kind === "file").length,
    cases: sum("cases"),
    timedCases,
    durationMs,
    untimed: sum("untimed"),
  };
}

// ITEMS grouped by KEY, in first-seen order.
function grouped(items, key) {
  const groups = new Map();
  for (const item of items) {
    const name = key(item);
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  return [...groups.values()];
}

/**
 * The scope's ITEMS ranked: leads, the folders beyond them, the tail, and
 * per-unit totals.
 * @param {readonly ScopeItem[]} items
 * @returns {Ranking}
 */
export function rankedLeads(items) {
  const timed = items
    .filter((item) => item.durationMs !== undefined)
    .sort(byTime((item) => item.path));
  const leads = timed.slice(0, LEAD_LIMIT);
  const rest = timed.slice(LEAD_LIMIT);
  const folderKey = (item) => JSON.stringify([item.unit, item.folder]);
  const folders = grouped(
    rest.filter((item) => item.folder !== undefined),
    folderKey,
  )
    .map((group) => ({
      folder: group[0].folder,
      unit: group[0].unit,
      ...totalsOf(group),
    }))
    .sort(byTime((folder) => folder.folder));
  const shown = folders.slice(0, FOLDER_LIMIT);
  const shownKeys = new Set(shown.map(folderKey));
  const tail = grouped(
    rest.filter((item) => !shownKeys.has(folderKey(item))),
    (item) => item.unit,
  )
    .map((group) => ({ unit: group[0].unit, ...totalsOf(group) }))
    .sort(byTime((unit) => unit.unit));
  const units = grouped(items, (item) => item.unit)
    .map((group) => ({
      unit: group[0].unit,
      entries: new Set(group.map((item) => item.entry)).size,
      ...totalsOf(group),
    }))
    .sort(byTime((unit) => unit.unit));
  return {
    totalMs: totalsOf(timed).durationMs,
    timedItems: timed.length,
    units,
    leads,
    folders: shown,
    folderCount: folders.length,
    tail,
  };
}
