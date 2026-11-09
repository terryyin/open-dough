// The bounded text a lead reading prints (./ci-proof-leads-table.mjs): its
// sections, in order, and its byte limit whatever the summary holds. What a
// reading puts in it: ./ci-proof-leads.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { leadsTable } from "./ci-proof-leads-table.mjs";
import { rankedLeads } from "./ci-proof-ranking.mjs";
import { scopeOf } from "./ci-proof-scope.mjs";

const revision = "a1b2c3d".padEnd(40, "0");

// The most bytes a reading prints: 16 KiB.
const limitBytes = 16 * 1024;

// The ranking of SUMMARY's entries.
const rankingOf = (summary) => rankedLeads(scopeOf(summary, undefined).items);

const reportOf = (facts) => ({
  repository: "owner/repo",
  requested: { spec: "HEAD", revision },
  source: "GitHub Actions workflow ci.yml",
  gaps: [],
  ...facts,
});

test("the table names the attempt, how it relates to the requested revision, the recorded selection and gaps, then totals, leads, folders and tail", () => {
  const summary = makeMe.aCiProofSummary
    .withEntries(
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .countingIn("tests")
        .withFile("dashboard/tests/runtime/watcher.spec.ts", {
          passed: 10,
          durationMs: 115_281,
        })
        .withFile("dashboard/tests/intent/gaps.spec.ts", {
          passed: 4,
          durationMs: 59_436,
        })
        .please(),
      makeMe.aCiProofEntry
        .at("tests")
        .countingIn("checks")
        .withFile("tests/proof.sh", { durationMs: 54_400, untimed: 0 })
        .please(),
    )
    .please();

  const text = leadsTable(
    reportOf({
      attempt: { identity: "run 41 attempt 1", revision, outcome: "success" },
      compatibility: {
        text: "earlier: the attempt's revision is an ancestor of the requested one, 2 commits before it; 1 in-scope path changed since",
        changed: [{ status: "M", path: "tests/proof.sh" }],
      },
      selection: {
        text: "test-selection command not recorded in the summary; remedy: read it from .github/workflows/ci.yml",
        entries: [
          {
            path: "tests",
            declared: "shell *.sh",
            unit: "checks",
            parts: "3 of 3 parts present",
          },
        ],
      },
      gaps: ["tests: 1 checks failed in this attempt"],
      ranking: rankingOf(summary),
    }),
  );

  assert.equal(
    text,
    `CI proof leads for owner/repo
Requested      HEAD = ${revision}
Source         GitHub Actions workflow ci.yml
Attempt        run 41 attempt 1 (success) at ${revision}
Compatibility  earlier: the attempt's revision is an ancestor of the requested one, 2 commits before it; 1 in-scope path changed since
  M  tests/proof.sh
Selection      test-selection command not recorded in the summary; remedy: read it from .github/workflows/ci.yml
  entry  declared    unit    parts
  tests  shell *.sh  checks  3 of 3 parts present
Gaps           1
  - tests: 1 checks failed in this attempt
Scope totals   229.1 s summed CI time over 3 timed items; cases and means stay per unit
  unit    entries  files  cases  time s  untimed
  tests         1      2     14   174.7        0
  checks        1      1      1    54.4        0
Leads          all 3 timed items, ranked by summed CI time
  #  time s  share  cases  unit    mean s  path
  1   115.3  50.3%     10  tests    11.53  dashboard/tests/runtime/watcher.spec.ts
  2    59.4  25.9%      4  tests    14.86  dashboard/tests/intent/gaps.spec.ts
  3    54.4  23.7%      1  checks   54.40  tests/proof.sh
Folders        none beyond the leads
Tail           none
`,
  );
});

test("whatever a summary holds, the table stays within its byte limit, every list capped", () => {
  const long = (index) =>
    `dashboard/tests/${"deep/".repeat(40)}folder-${index % 300}/spec-${index}.spec.ts`;
  const entries = Array.from({ length: 40 }, (...[, entry]) => {
    const builder = makeMe.aCiProofEntry
      .at(`area-${entry}`)
      .countingIn(`unit-${entry}-${"u".repeat(30)}`);
    for (let file = 0; file < 75; file += 1)
      builder.withFile(`area-${entry}/${long(entry * 75 + file)}`, {
        passed: 3,
        durationMs: 1000 + file,
      });
    return builder.please();
  });
  const summary = makeMe.aCiProofSummary.withEntries(...entries).please();
  const report = reportOf({
    source: `summary file /tmp/${"x".repeat(5000)}`,
    attempt: { identity: "run 41 attempt 1", revision, outcome: "success" },
    compatibility: {
      text: `earlier: ${"x".repeat(5000)}`,
      changed: Array.from({ length: 500 }, (...[, index]) => ({
        status: "M",
        path: long(index),
      })),
    },
    selection: {
      text: `test-selection command not recorded ${"x".repeat(5000)}`,
      entries: entries.map((entry) => ({
        path: entry.path,
        declared: "x".repeat(500),
        unit: entry.unit ?? "",
        parts: "1 of 1 parts present",
      })),
    },
    gaps: Array.from(
      { length: 200 },
      (...[, index]) => `gap ${index} ${"x".repeat(2000)}`,
    ),
    ranking: rankingOf(summary),
  });

  const text = leadsTable(report);
  assert.ok(
    Buffer.byteLength(text) <= limitBytes,
    `${Buffer.byteLength(text)} bytes`,
  );
  assert.doesNotMatch(text, /output cut/);
  for (const more of [
    "490 more changed paths",
    "30 more entries",
    "188 more gaps",
    "34 more units",
  ])
    assert.match(text, new RegExp(more));
  assert.equal(
    text
      .split("\n")
      .filter((line) => line.startsWith("  ") && /\.spec\.ts$/.test(line))
      .length,
    10 + 20 + 0,
  );

  const wideText = (index) => `${"試験".repeat(150)} ${index}`;
  const wide = leadsTable({
    ...report,
    compatibility: {
      text: wideText(0),
      changed: Array.from({ length: 20 }, (...[, index]) => ({
        status: "M",
        path: wideText(index),
      })),
    },
    selection: {
      text: wideText(0),
      entries: report.selection.entries.map((entry) => ({
        ...entry,
        path: wideText(entry.path),
      })),
    },
    gaps: Array.from({ length: 40 }, (...[, index]) => wideText(index)),
    ranking: rankingOf(
      makeMe.aCiProofSummary
        .withEntries(
          ...Array.from({ length: 3 }, (...[, entry]) => {
            const builder = makeMe.aCiProofEntry.at(`領域${entry}`);
            for (let file = 0; file < 40; file += 1)
              builder.withFile(`領域${entry}/${"試験".repeat(60)}/${file}`, {
                durationMs: file,
              });
            return builder.please();
          }),
        )
        .please(),
    ),
  });
  assert.ok(
    Buffer.byteLength(wide) <= limitBytes,
    `${Buffer.byteLength(wide)} bytes`,
  );
  assert.match(wide, /\n… output cut at its byte limit\n$/);
});
