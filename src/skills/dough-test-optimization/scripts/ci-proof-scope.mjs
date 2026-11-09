// The part of one attempt's CI proof summary (./ci-proof-contract.mjs) that a
// requested scope holds, at the granularity the summary supports, for a lead
// reading to rank (./ci-proof-ranking.mjs): each in-scope test file of an
// entry's file breakdown and, as one block each, an entry without a
// breakdown, its parts reported without one, and the results its reports
// could not place in a file. Its gaps keep partial figures visible: missing
// and ambiguous parts, failed and untimed results, those blocks, and scope
// paths no entry covers. Each entry keeps its own unit.

/**
 * One rankable item of the scope: its path, its entry, what it is, its
 * entry's unit, its folder when it is a file, and its counted cases, how
 * many failed, how many recorded no duration, and the summed time of the
 * rest, absent when none recorded one.
 * @typedef {{
 *   readonly path: string;
 *   readonly entry: string;
 *   readonly kind: "file" | "entry" | "parts" | "unassigned";
 *   readonly unit: string;
 *   readonly folder?: string;
 *   readonly parts?: readonly number[];
 *   readonly cases: number;
 *   readonly failed: number;
 *   readonly untimed: number;
 *   readonly durationMs?: number;
 * }} ScopeItem
 */

/**
 * One in-scope entry as the attempt reported it: its path and unit, how
 * many parts it declares, and the numbers of those present, missing and
 * ambiguous.
 * @typedef {{
 *   readonly path: string;
 *   readonly unit: string;
 *   readonly of: number;
 *   readonly present: number;
 *   readonly missing: readonly number[];
 *   readonly ambiguous: readonly number[];
 * }} ScopeEntry
 */

// Whether PATH is SCOPE or inside it.
const isWithin = (path, scope) =>
  path === scope || path.startsWith(`${scope}/`);

const unitOf = (entry) => entry.unit ?? "(no unit)";

// FIGURES' cases, failed and untimed, and the time those timed took. A
// figure without a duration recorded none for any of its cases.
function measured(figures) {
  const cases = figures.passed + figures.failed + figures.other;
  const { failed } = figures;
  if (figures.durationMs === undefined)
    return { cases, failed, untimed: cases };
  const untimed = Math.min(cases, figures.untimed ?? 0);
  return { cases, failed, untimed, durationMs: figures.durationMs };
}

function plus(one, other) {
  const durations = [one.durationMs, other.durationMs].filter(
    (value) => value !== undefined,
  );
  return {
    cases: one.cases + other.cases,
    failed: one.failed + other.failed,
    untimed: one.untimed + other.untimed,
    ...(durations.length === 0
      ? {}
      : { durationMs: durations.reduce((sum, value) => sum + value, 0) }),
  };
}

const none = { cases: 0, failed: 0, untimed: 0 };
const measuredParts = (parts) => parts.map(measured).reduce(plus, none);
const partList = (numbers, of) =>
  `part${numbers.length > 1 ? "s" : ""} ${numbers.slice(0, 8).join(", ")}${numbers.length > 8 ? ", …" : ""} of ${of}`;

/** @returns {ScopeEntry} */
function scopeEntry(entry) {
  const numbers = (status) =>
    entry.parts
      .filter((part) => part.status === status)
      .map(({ part }) => part);
  return {
    path: entry.path,
    unit: unitOf(entry),
    of: entry.parts.length,
    present: numbers("present").length,
    missing: numbers("missing"),
    ambiguous: numbers("ambiguous"),
  };
}

// ENTRY's items and gaps, whole or, when INSIDE names scope paths within
// it, only for its files under them.
function entryScope(entry, inside) {
  const unit = unitOf(entry);
  const item = (path, kind, figures, extra = {}) => ({
    path,
    entry: entry.path,
    kind,
    unit,
    ...extra,
    ...figures,
  });
  const present = entry.parts.filter((part) => part.status === "present");
  const unbroken = present.filter((part) => part.breakdown !== true);
  const where = inside
    ? `${inside.join(", ")}: inside ${entry.path}, whose`
    : `${entry.path}:`;
  if (entry.files === undefined) {
    if (inside)
      return {
        items: [],
        gaps: [
          `${where} results have no file breakdown, so they cannot be measured`,
        ],
      };
    const total = measuredParts(present);
    return {
      items: total.cases > 0 ? [item(entry.path, "entry", total)] : [],
      gaps: [
        `${entry.path}: no file breakdown; its results rank as one entry total`,
      ],
    };
  }
  const files = entry.files.filter(
    (file) => !inside || inside.some((scope) => isWithin(file.path, scope)),
  );
  const items = files.map((file) =>
    item(file.path, "file", measured(file), {
      folder: file.path.slice(0, file.path.lastIndexOf("/")),
    }),
  );
  const gaps = [];
  const unbrokenTotal = measuredParts(unbroken);
  if (unbrokenTotal.cases > 0) {
    const parts = unbroken.map(({ part }) => part);
    if (!inside)
      items.push(item(entry.path, "parts", unbrokenTotal, { parts }));
    gaps.push(
      `${where} ${partList(parts, entry.parts.length)} reported no file breakdown; ${inside ? "some of its results may be there" : "they rank as one block"}`,
    );
  }
  const unassigned = entry.unassigned && measured(entry.unassigned);
  if (unassigned && unassigned.cases > 0) {
    if (!inside) items.push(item(entry.path, "unassigned", unassigned));
    gaps.push(
      `${where} ${unassigned.cases} ${unit} were not placed in a file; ${inside ? "some of its results may be among them" : "they rank as one block"}`,
    );
  }
  return { items, gaps };
}

// The gaps of an in-scope entry's own reports, as its ScopeEntry states
// them, and of the in-scope ITEMS' results.
function reportGaps({ path, unit, of, missing, ambiguous }, items) {
  const gaps = [];
  for (const [status, numbers] of [
    ["missing", missing],
    ["ambiguous", ambiguous],
  ])
    if (numbers.length > 0)
      gaps.push(
        `${path}: ${partList(numbers, of)} ${status}${status === "ambiguous" ? " (reported more than once)" : ""}; their results are not counted`,
      );
  const { cases, failed, untimed } = items.reduce(plus, none);
  if (failed > 0)
    gaps.push(`${path}: ${failed} ${unit} failed in this attempt`);
  if (untimed > 0)
    gaps.push(
      untimed === cases
        ? `${path}: no duration recorded for its ${cases} ${unit}; they cannot rank`
        : `${path}: ${untimed} of ${cases} ${unit} recorded no duration; its time sums are partial`,
    );
  return gaps;
}

/**
 * The part of SUMMARY, a valid summary, that SCOPE holds: repository paths
 * of entries, folders or files, or every entry when SCOPE is undefined.
 * @param {{ readonly entries: readonly any[] }} summary
 * @param {readonly string[] | undefined} scope
 * @returns {{
 *   entries: ScopeEntry[];
 *   items: ScopeItem[];
 *   gaps: string[];
 *   noBreakdown: string[];
 * }}
 */
export function scopeOf(summary, scope) {
  const paths = scope ?? summary.entries.map((entry) => entry.path);
  const entries = [];
  const items = [];
  const gaps = [];
  const noBreakdown = [];
  for (const entry of summary.entries) {
    const whole = paths.some((path) => isWithin(entry.path, path));
    const inside = paths.filter(
      (path) => path !== entry.path && isWithin(path, entry.path),
    );
    if (!whole && inside.length === 0) continue;
    const reported = scopeEntry(entry);
    entries.push(reported);
    if (entry.files === undefined) noBreakdown.push(entry.path);
    const held = entryScope(entry, whole ? undefined : inside);
    items.push(...held.items);
    gaps.push(...reportGaps(reported, held.items), ...held.gaps);
  }
  for (const path of paths) {
    const covering = summary.entries.filter(
      (entry) => isWithin(entry.path, path) || isWithin(path, entry.path),
    );
    if (covering.length === 0)
      gaps.push(`${path}: no entry of this summary covers it`);
    else if (
      covering.every((entry) => entry.files !== undefined) &&
      !items.some((item) => isWithin(item.path, path))
    )
      gaps.push(`${path}: the summary holds no results under it`);
  }
  return { entries, items, gaps, noBreakdown };
}
