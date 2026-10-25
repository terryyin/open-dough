---
id: SEED-042
---

# SEED-042: Soil readings

## Stories

<a id="daily-summary"></a>

### Print a daily moisture summary

**Identity:** SEED-042#daily-summary

**Goal:** A gardener sees each bed's average moisture for one day.

**Scope:** `bin/summary.mjs DATE` prints one line per bed with its mean
moisture for that date.

<a id="export-readings"></a>

### Export readings as CSV

**Identity:** SEED-042#export-readings

**Goal:** A gardener exports logged soil readings as CSV to open them in a
spreadsheet.

**Scope:**

- `exportCsv(readings)` returns the header `date,bed,moisture` followed by one
  row per reading in date order.
- A cell containing a comma or a double quote is quoted, doubling inner quotes.
- `bin/export.mjs` prints the CSV of `data/readings.json`; `--since DATE`
  keeps readings on or after DATE.
- The README documents the command.

Excluded: other formats, editing readings, time zones.

**Key examples:**

1. Two readings logged out of date order → the header, then both rows sorted
   by date.
2. A bed named `North, raised` → its cell is `"North, raised"`.
3. `bin/export.mjs --since 2026-05-02` with readings on May 1 and May 2 → only
   the May 2 row follows the header.

<a id="bed-names"></a>

### Rename a bed

**Identity:** SEED-042#bed-names

**Goal:** A gardener renames a bed without losing its readings.

## Human-Owned Decisions

None.
