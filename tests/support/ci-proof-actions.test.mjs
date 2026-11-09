// The two local CI proof actions run the collector with what ci.yml gives
// them (./ci-proof-declaration.test.mjs): a Playwright record's tests as
// test cases, each to its own proof entry, and an outcomes report that
// declares no unit as legacy results, as before units were declared.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { summaryProblems } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { locatedRecord } from "../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs";
import {
  root,
  fragmentsAction,
  summaryAction,
  runAction,
} from "./ci-proof-action-fixtures.mjs";

test("the actions' scripts give the collector each entry and declaration and write a summary", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-actions-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const outcomes = join(directory, "outcomes.txt");
  writeFileSync(
    outcomes,
    "passed\ttests/a.sh\nfailed\tsrc/skills/x/scripts/b.test.mjs\n",
  );
  const environment = {
    ...process.env,
    RUNNER_TEMP: directory,
    GITHUB_RUN_ATTEMPT: "2",
    GITHUB_RUN_ID: "7",
    GITHUB_REPOSITORY: "owner/repo",
    CI_PROOF_REVISION: "a".repeat(40),
  };
  const run = (action, env) => runAction(action, { ...environment, ...env });
  const fragments = run(fragmentsAction, {
    ENTRIES: "tests src/skills",
    FORMAT: "outcomes",
    REPORT: outcomes,
    PART: "1",
    PARTS: "1",
  });
  assert.deepEqual([fragments.status, fragments.stderr], [0, ""]);
  // The summary action reads the fragments where the download puts them.
  const moved = spawnSync("mv", [
    join(directory, "ci-proof"),
    join(directory, "ci-proof-fragments"),
  ]);
  assert.equal(moved.status, 0);
  const summary = run(summaryAction, { EXPECT: "tests=1 src/skills=1" });
  assert.deepEqual([summary.status, summary.stderr], [0, ""]);
  assert.equal(
    summary.stdout,
    "tests: 1 passed, 0 failed, 0 other legacy test results (checks)\nsrc/skills: 0 passed, 1 failed, 0 other legacy test results (checks)\n",
  );
  const written = JSON.parse(
    readFileSync(join(directory, "ci-proof-summary.json"), "utf8"),
  );
  assert.deepEqual(summaryProblems(written), []);
  assert.deepEqual(
    [
      written.schemaVersion,
      written.runId,
      written.runAttempt,
      written.revision,
    ],
    [2, 7, 2, "a".repeat(40)],
  );
  // Each entry is broken down by its checks' files for Intent's summaries,
  // its results legacy until the report declares their unit.
  assert.deepEqual(
    written.entries.map(({ evidence: [only] }) => [
      only.unit,
      only.label,
      only.files.map((file) => file.path),
    ]),
    [
      ["legacy", "checks", ["tests/a.sh"]],
      ["legacy", "checks", ["src/skills/x/scripts/b.test.mjs"]],
    ],
  );
});

test("one dashboard action invocation gives each browser, frontend, or backend result to its own proof entry", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-shared-dashboard-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const cwd = fileURLToPath(root).replace(/\/$/, "");
  const report = join(directory, "dashboard-proof.json");
  writeFileSync(
    report,
    JSON.stringify(
      locatedRecord(cwd, [
        [`${cwd}/dashboard/tests/browser.spec.ts`, "expected", [35]],
        [`${cwd}/dashboard/frontend-tests/dom.spec.ts`, "expected", [20]],
        [`${cwd}/dashboard/backend-tests/server.spec.ts`, "expected", [50]],
        [`${cwd}/dashboard/backend-tests/problem.spec.ts`, "unexpected", [15]],
      ]),
    ),
  );
  const result = runAction(fragmentsAction, {
    RUNNER_TEMP: directory,
    GITHUB_RUN_ATTEMPT: "2",
    CI_PROOF_REVISION: "a".repeat(40),
    ENTRIES: "dashboard/tests dashboard/frontend-tests dashboard/backend-tests",
    FORMAT: "playwright-record",
    REPORT: report,
    TIMES: "",
    PART: "1",
    PARTS: "12",
  });
  assert.deepEqual([result.status, result.stdout, result.stderr], [0, "", ""]);
  const values = [
    "dashboard-tests",
    "dashboard-frontend-tests",
    "dashboard-backend-tests",
  ].map((name) =>
    JSON.parse(
      readFileSync(join(directory, "ci-proof", `${name}-case-1.json`), "utf8"),
    ),
  );
  assert.deepEqual(
    values.map(({ entry, unit, passed, failed, other, durationMs }) => ({
      entry,
      unit,
      passed,
      failed,
      other,
      durationMs,
    })),
    [
      {
        entry: "dashboard/tests",
        unit: "case",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 35,
      },
      {
        entry: "dashboard/frontend-tests",
        unit: "case",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 20,
      },
      {
        entry: "dashboard/backend-tests",
        unit: "case",
        passed: 1,
        failed: 1,
        other: 0,
        durationMs: 65,
      },
    ],
  );
  assert.deepEqual(
    values.map((value) => value.files.map((file) => file.path)),
    [
      ["dashboard/tests/browser.spec.ts"],
      ["dashboard/frontend-tests/dom.spec.ts"],
      [
        "dashboard/backend-tests/problem.spec.ts",
        "dashboard/backend-tests/server.spec.ts",
      ],
    ],
  );
});
