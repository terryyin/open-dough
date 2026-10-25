#!/usr/bin/env bash
# Product source for delivery-evidence/amended at each delivered stage: slice 1
# exports rows in date order under a header, slice 2 quotes cells holding a
# comma or a quote, and slice 3 adds the `--since` command with its tests.
# shellcheck disable=SC2016 # Literal fixture code.

delivery_evidence_amended_write_product() {
  local workspace=$1 stage=$2
  mkdir -p -- "${workspace}/lib" "${workspace}/tests" "${workspace}/bin"
  if [[ ${stage} == slice1 ]]; then
    cat > "${workspace}/lib/export.mjs" << 'EOF'
// CSV export of logged soil readings.
export function exportCsv(readings) {
  const rows = [...readings]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((reading) => [reading.date, reading.bed, reading.moisture].join(","));
  return ["date,bed,moisture", ...rows].join("\n");
}
EOF
    cat > "${workspace}/tests/export.test.mjs" << 'EOF'
import assert from "node:assert/strict";
import test from "node:test";
import { exportCsv } from "../lib/export.mjs";

test("rows follow the header in date order", () => {
  const csv = exportCsv([
    { date: "2026-05-02", bed: "East", moisture: 0.31 },
    { date: "2026-05-01", bed: "West", moisture: 0.4 },
  ]);
  assert.equal(csv, "date,bed,moisture\n2026-05-01,West,0.4\n2026-05-02,East,0.31");
});
EOF
  elif [[ ${stage} == slice2 ]]; then
    cat > "${workspace}/lib/export.mjs" << 'EOF'
// CSV export of logged soil readings.
const cell = (value) => {
  const text = String(value);
  return /[",]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function exportCsv(readings) {
  const rows = [...readings]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((reading) =>
      [reading.date, reading.bed, reading.moisture].map(cell).join(","),
    );
  return ["date,bed,moisture", ...rows].join("\n");
}
EOF
    cat >> "${workspace}/tests/export.test.mjs" << 'EOF'

test("a cell holding a comma or a quote is quoted", () => {
  const csv = exportCsv([
    { date: "2026-05-01", bed: "North, raised", moisture: 0.4 },
    { date: "2026-05-02", bed: 'The "long" bed', moisture: 0.3 },
  ]);
  assert.equal(
    csv,
    'date,bed,moisture\n2026-05-01,"North, raised",0.4\n2026-05-02,"The ""long"" bed",0.3',
  );
});
EOF
  else
    cat > "${workspace}/bin/export.mjs" << 'EOF'
#!/usr/bin/env node
// Prints the CSV of a readings file, optionally from a start date on.
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { exportCsv } from "../lib/export.mjs";

const { values } = parseArgs({
  options: {
    since: { type: "string" },
    file: { type: "string", default: "data/readings.json" },
  },
});
const readings = JSON.parse(readFileSync(values.file, "utf8"));
const kept = values.since
  ? readings.filter((reading) => reading.date >= values.since)
  : readings;
process.stdout.write(`${exportCsv(kept)}\n`);
EOF
    cat > "${workspace}/tests/cli.test.mjs" << 'EOF'
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const file = join(mkdtempSync(join(tmpdir(), "readings-")), "readings.json");
writeFileSync(
  file,
  JSON.stringify([
    { date: "2026-05-01", bed: "West", moisture: 0.4 },
    { date: "2026-05-02", bed: "East", moisture: 0.31 },
  ]),
);
const run = (...args) =>
  execFileSync(process.execPath, ["bin/export.mjs", "--file", file, ...args], {
    encoding: "utf8",
  });

test("since keeps readings on or after the date", () => {
  assert.equal(run("--since", "2026-05-02"), "date,bed,moisture\n2026-05-02,East,0.31\n");
});

test("without since prints every reading", () => {
  assert.equal(
    run(),
    "date,bed,moisture\n2026-05-01,West,0.4\n2026-05-02,East,0.31\n",
  );
});
EOF
  fi
}
