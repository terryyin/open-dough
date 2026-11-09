// The part of a lead reading's table (./ci-proof-leads-table.mjs) that shows
// a ranking (./ci-proof-ranking.mjs): the scope's per-unit totals, the leads,
// the folders beyond them and the tail, every row in one unit.
import {
  capped,
  columns,
  count,
  elide,
  label,
  meanSeconds,
  seconds,
  share,
  unitText,
} from "./ci-proof-table-text.mjs";

const UNIT_LINES = 6;

// An item's path as a lead shows it: a block of an entry says what it is,
// and results without a duration are counted beside it.
function itemPath(item) {
  const untimed = item.untimed > 0 ? ` (+${count(item.untimed)} untimed)` : "";
  const parts = (item.parts ?? []).slice(0, 6).join(", ");
  const kinds = {
    file: "",
    entry: " (entry total, no file breakdown)",
    parts: ` (parts ${parts}${item.parts?.length > 6 ? ", …" : ""} without file breakdown)`,
    unassigned: " (results not placed in a file)",
  };
  return `${elide(item.path)}${kinds[item.kind]}${untimed}`;
}

function unitLines(ranking) {
  const rows = ranking.units.map((unit) => [
    unitText(unit.unit),
    count(unit.entries),
    count(unit.files),
    count(unit.cases),
    seconds(unit.durationMs),
    count(unit.untimed),
  ]);
  return [
    label(
      "Scope totals",
      `${seconds(ranking.totalMs)} s summed CI time over ${count(ranking.timedItems)} timed items; cases and means stay per unit`,
    ),
    ...capped(
      columns(
        ["unit", "entries", "files", "cases", "time s", "untimed"],
        rows,
        [1, 2, 3, 4, 5],
      ),
      UNIT_LINES + 1,
      "units",
    ),
  ];
}

function leadLines({ leads, timedItems, totalMs }) {
  const rows = leads.map((item, index) => [
    String(index + 1),
    seconds(item.durationMs),
    share(item.durationMs, totalMs),
    count(item.cases),
    unitText(item.unit),
    meanSeconds(item.durationMs, item.cases - item.untimed),
    itemPath(item),
  ]);
  const ranked = "ranked by summed CI time";
  return [
    label(
      "Leads",
      leads.length < timedItems
        ? `${count(leads.length)} of ${count(timedItems)} timed items, ${ranked}`
        : `all ${count(leads.length)} timed items, ${ranked}`,
    ),
    ...(rows.length === 0
      ? []
      : columns(
          ["#", "time s", "share", "cases", "unit", "mean s", "path"],
          rows,
          [0, 1, 2, 3, 5],
        )),
  ];
}

function restLines({ folders, folderCount, tail, totalMs }) {
  const folderRows = folders.map((folder) => [
    seconds(folder.durationMs),
    share(folder.durationMs, totalMs),
    count(folder.files),
    count(folder.cases),
    unitText(folder.unit),
    meanSeconds(folder.durationMs, folder.timedCases),
    elide(folder.folder),
  ]);
  const tailRows = tail.map((unit) => [
    count(unit.items),
    count(unit.cases),
    seconds(unit.durationMs),
    share(unit.durationMs, totalMs),
    meanSeconds(unit.durationMs, unit.timedCases),
    unitText(unit.unit),
  ]);
  return [
    label(
      "Folders",
      folders.length === 0
        ? "none beyond the leads"
        : `${count(folders.length)} of ${count(folderCount)} folders beyond the leads, ranked by summed CI time`,
    ),
    ...(folderRows.length === 0
      ? []
      : columns(
          ["time s", "share", "files", "cases", "unit", "mean s", "folder"],
          folderRows,
          [0, 1, 2, 3, 5],
        )),
    label(
      "Tail",
      tail.length === 0
        ? "none"
        : "the rest beyond the leads and those folders, per unit",
    ),
    ...(tailRows.length === 0
      ? []
      : capped(
          columns(
            ["items", "cases", "time s", "share", "mean s", "unit"],
            tailRows,
            [0, 1, 2, 3, 4],
          ),
          UNIT_LINES + 1,
          "units",
        )),
  ];
}

/**
 * RANKING's lines in a lead reading's table.
 * @param {import("./ci-proof-ranking.mjs").Ranking} ranking
 * @returns {string[]}
 */
export const rankingLines = (ranking) => [
  ...unitLines(ranking),
  ...leadLines(ranking),
  ...restLines(ranking),
];
