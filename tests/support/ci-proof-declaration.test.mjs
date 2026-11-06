// ci.yml's ci-proof job declares the proof entries and parts that its
// producers write, after the proof jobs settle however they ended, and the
// two local CI proof actions run the collector with what ci.yml gives them.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { summaryArtifactName } from "../../src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs";
import { locatedRecord } from "../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs";

import {
  root,
  workflow,
  fragmentsAction,
  summaryAction,
  locations,
  jobs,
  steps,
  input,
  runAction,
} from "./ci-proof-action-fixtures.mjs";

const attempt = "${{ github.run_attempt }}";

const declared = jobs(workflow);
const collector = steps(declared.get("ci-proof"));
const producers = [
  { job: "test", axis: "share" },
  { job: "dashboard", axis: "shard" },
].map(({ job, axis }) => {
  const lines = declared.get(job);
  const matrix = new RegExp(`^ +${axis}: \\[([^\\]]*)\\]$`, "m").exec(
    lines.join("\n"),
  );
  const jobSteps = steps(lines);
  const proof = jobSteps.filter((step) =>
    step.includes("uses: ./.github/actions/ci-proof-fragments\n"),
  );
  return {
    job,
    axis,
    parts: matrix[1].split(",").length,
    steps: jobSteps,
    proof,
  };
});

test("the workflow names a pull request's head as CI_PROOF_REVISION before github.sha", () => {
  // A pull-request run must name head.sha (what Intent judges), not the
  // merge commit github.sha alone would give; drop the head preference and
  // every PR summary reads as another revision.
  assert.match(
    workflow,
    /^ {2}CI_PROOF_REVISION: \$\{\{ github\.event\.pull_request\.head\.sha \|\| github\.sha \}\}$/m,
  );
});

test("the ci-proof job runs after both proof jobs however they ended", () => {
  const lines = declared.get("ci-proof").join("\n");
  assert.match(lines, /^ {4}needs: \[test, dashboard\]$/m);
  assert.match(lines, /^ {4}if: \$\{\{ !cancelled\(\) \}\}$/m);
  assert.ok(
    collector.some((step) =>
      step.includes("uses: ./.github/actions/ci-proof-summary\n"),
    ),
  );
  assert.ok(
    summaryAction.includes(
      `pattern: ci-proof-fragments-*-attempt-${attempt}\n`,
    ),
  );
  assert.ok(summaryAction.includes(`name: ${summaryArtifactName(attempt)}\n`));
});

test("the declared parts equal the matrix lengths of the jobs that write each entry, in Intent location order", () => {
  const expected = new Map();
  for (const { proof, parts } of producers) {
    for (const entry of proof.flatMap((step) =>
      input(step, "entries").split(" "),
    )) {
      expected.set(entry, parts);
    }
  }
  const [summarize] = collector.filter((step) =>
    step.includes("ci-proof-summary\n"),
  );
  const declaration = input(summarize, "expect")
    .split(" ")
    .map((value) => value.split("="));
  assert.deepEqual(
    declaration,
    locations
      .filter((entry) => expected.has(entry))
      .map((entry) => [entry, String(expected.get(entry))]),
  );
  assert.deepEqual(
    new Set(declaration.map(([entry]) => entry)),
    new Set(expected.keys()),
  );
});

test("every producer keeps its part's attempt-named fragments whenever its suite ran", () => {
  for (const { job, axis, steps: jobSteps, proof } of producers) {
    assert.equal(proof.length, 1, `${job} keeps its CI proof fragments once`);
    const [step] = proof;
    assert.match(
      step,
      /\n {8}if: \$\{\{ !cancelled\(\) && steps\.suite\.outcome != 'skipped' \}\}\n/,
    );
    assert.ok(
      jobSteps.some((other) => /\n {8}id: suite\n/.test(other)),
      `${job} names no suite step`,
    );
    assert.equal(input(step, "part"), `\${{ matrix.${axis} }}`);
    assert.equal(input(step, "parts"), "${{ strategy.job-total }}");
  }
  assert.ok(
    fragmentsAction.includes(
      `name: ci-proof-fragments-\${{ github.job }}-\${{ inputs.part }}-attempt-${attempt}\n`,
    ),
  );
});

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
    "tests: 1 passed, 0 failed, 0 other checks\nsrc/skills: 0 passed, 1 failed, 0 other checks\n",
  );
  const written = JSON.parse(
    readFileSync(join(directory, "ci-proof-summary.json"), "utf8"),
  );
  assert.deepEqual(
    [written.runId, written.runAttempt, written.revision],
    [7, 2, "a".repeat(40)],
  );
  // Each entry is broken down by its checks' files for Intent's summaries.
  assert.deepEqual(
    written.entries.map((entry) => entry.files.map((file) => file.path)),
    [["tests/a.sh"], ["src/skills/x/scripts/b.test.mjs"]],
  );
});

test("one dashboard action invocation gives each browser or backend result to its own proof entry", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "ci-proof-shared-dashboard-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const cwd = fileURLToPath(root).replace(/\/$/, "");
  const report = join(directory, "dashboard-proof.json");
  writeFileSync(
    report,
    JSON.stringify(
      locatedRecord(cwd, [
        [`${cwd}/dashboard/tests/browser.spec.ts`, "expected", [35]],
        [`${cwd}/dashboard/backend-tests/server.spec.ts`, "expected", [50]],
        [`${cwd}/dashboard/backend-tests/problem.spec.ts`, "unexpected", [15]],
      ]),
    ),
  );
  const result = runAction(fragmentsAction, {
    RUNNER_TEMP: directory,
    GITHUB_RUN_ATTEMPT: "2",
    CI_PROOF_REVISION: "a".repeat(40),
    ENTRIES: "dashboard/tests dashboard/backend-tests",
    FORMAT: "playwright-record",
    REPORT: report,
    TIMES: "",
    PART: "1",
    PARTS: "12",
  });
  assert.deepEqual([result.status, result.stdout, result.stderr], [0, "", ""]);
  const values = ["dashboard-tests", "dashboard-backend-tests"].map((name) =>
    JSON.parse(
      readFileSync(join(directory, "ci-proof", `${name}-1.json`), "utf8"),
    ),
  );
  assert.deepEqual(
    values.map(({ entry, passed, failed, other, durationMs }) => ({
      entry,
      passed,
      failed,
      other,
      durationMs,
    })),
    [
      {
        entry: "dashboard/tests",
        passed: 1,
        failed: 0,
        other: 0,
        durationMs: 35,
      },
      {
        entry: "dashboard/backend-tests",
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
      [
        "dashboard/backend-tests/problem.spec.ts",
        "dashboard/backend-tests/server.spec.ts",
      ],
    ],
  );
});
