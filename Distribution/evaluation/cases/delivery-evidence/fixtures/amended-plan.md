# Export readings as CSV

**Identity:** SEED-042#export-readings
**Source:** [Selected story](../../seeds/SEED-042-soil-readings.md#export-readings)

## Goal and scope

Export logged soil readings as CSV through a library function and a command,
as the selected story describes.

## Ordered slices

### 1. Export rows in date order under a header
Type: Behavior
Status: planned
Proof: `node --test tests/export.test.mjs` covers example 1.

Behavior: `exportCsv(readings)` returns `date,bed,moisture` and one row per
reading sorted by date, joined with newlines.

### 2. Quote cells that hold a comma or a quote
Type: Behavior
Status: planned
Proof: `node --test tests/export.test.mjs` covers example 2 and an inner quote.

Behavior: a cell containing `,` or `"` is wrapped in double quotes with inner
quotes doubled; other cells are written as they are.

### 3. Export from the command with an optional start date
Type: Behavior
Status: planned
Proof: `node --test tests/cli.test.mjs` runs `bin/export.mjs` on a temporary
readings file and covers example 3 and the unfiltered output.

Behavior: `bin/export.mjs [--since DATE] [--file PATH]` reads the readings file
(default `data/readings.json`) and prints `exportCsv` of the readings on or
after DATE.

### 4. Document the command
Type: Behavior
Status: planned
Proof: the README's example command, run as written, prints its documented
output.

Behavior: the README shows `bin/export.mjs --since 2026-05-02` with its
output.

## Learnings

None yet.
