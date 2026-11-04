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

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const workflow = read(".github/workflows/ci.yml");
const fragmentsAction = read(".github/actions/ci-proof-fragments/action.yml");
const summaryAction = read(".github/actions/ci-proof-summary/action.yml");
const locations = JSON.parse(
  read(".planning/open-dough.json"),
).intent.locations.map((location) => location.path);
const attempt = "${{ github.run_attempt }}";

// Each job's lines, by its id under `jobs:`.
function jobs(text) {
  const result = new Map();
  let current;
  for (const line of text.slice(text.indexOf("\njobs:\n")).split("\n")) {
    const id = /^ {2}([A-Za-z][\w-]*):\s*$/.exec(line);
    if (id) result.set((current = id[1]), []);
    else if (/^ {2}\S/.test(line)) current = undefined;
    else if (current) result.get(current).push(line);
  }
  return result;
}

// A job's steps, each as its lines joined.
const steps = (lines) =>
  lines
    .join("\n")
    .split(/\n(?= {6}- )/)
    .filter((step) => step.startsWith("      - "));

// A step's `with:` input value.
const input = (step, name) =>
  new RegExp(`\\n {10}${name}: (.+)`).exec(step)?.[1];

// An action's one `run: |` block, unindented; Actions runs it as `bash -eo pipefail`.
function runBlock(action) {
  const lines = action.slice(action.indexOf("      run: |\n") + 13).split("\n");
  const end = lines.findIndex((line) => !line.startsWith("        "));
  return lines
    .slice(0, end)
    .map((line) => line.slice(8))
    .join("\n");
}

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
  const run = (action, env) =>
    spawnSync("bash", ["-eo", "pipefail", "-c", runBlock(action)], {
      cwd: fileURLToPath(root),
      encoding: "utf8",
      env: { ...environment, ...env },
    });
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
});
