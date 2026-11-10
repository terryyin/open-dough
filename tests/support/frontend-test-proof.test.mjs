// Offline frontend test proof renderer: validated summary → Markdown for one
// entry. Invalid or missing summary fails; incomplete evidence stays incomplete.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import {
  FRONTEND_TEST_PROOF_FILE,
  frontendTestProofArtifactName,
  renderFrontendTestProof,
} from "../../scripts/frontend-test-proof.mjs";

const script = fileURLToPath(
  new URL("../../scripts/frontend-test-proof.mjs", import.meta.url),
);
const entry = "dashboard/frontend-tests";
const revision = "a".repeat(40);

function temporary(t) {
  const directory = mkdtempSync(join(tmpdir(), "frontend-test-proof-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

const cli = (...args) =>
  spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

test("artifact and file names match the CI upload declaration", () => {
  assert.equal(FRONTEND_TEST_PROOF_FILE, "frontend-test-proof.md");
  assert.equal(
    frontendTestProofArtifactName("${{ github.run_attempt }}"),
    "frontend-test-proof-attempt-${{ github.run_attempt }}",
  );
  assert.equal(
    frontendTestProofArtifactName(2),
    "frontend-test-proof-attempt-2",
  );
});

test("a complete frontend summary lists identity, files, 0 ms versus untimed, and distinct outcomes", () => {
  const summary = makeMe.aCiProofSummary
    .inRepository("owner/repo")
    .ofRun({ runId: 7, runAttempt: 2, revision })
    .withEntries(
      makeMe.aCiProofEntry
        .at(entry)
        .withFile("dashboard/frontend-tests/pass.spec.ts", {
          passed: 1,
          durationMs: 0,
        })
        .withFile("dashboard/frontend-tests/fail.spec.ts", {
          passed: 0,
          failed: 1,
          durationMs: 30,
        })
        .withFile("dashboard/frontend-tests/other.spec.ts", {
          passed: 0,
          other: 1,
          untimed: 1,
        })
        .please(),
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .withFile("dashboard/tests/browser.spec.ts", {
          passed: 1,
          durationMs: 90,
        })
        .please(),
    )
    .please();

  const report = renderFrontendTestProof(summary, entry);
  assert.match(report, /Repository: owner\/repo/);
  assert.match(report, new RegExp(`Revision: ${revision}`));
  assert.match(report, /Run ID: 7/);
  assert.match(report, /Attempt: 2/);
  assert.match(report, /Frontend test proof: dashboard\/frontend-tests/);
  assert.match(
    report,
    /Durations are summed recorded test execution time from the proof record/,
  );
  assert.match(
    report,
    /Other results include skipped or unfinished selections/,
  );
  assert.match(report, /1 passed, 1 failed, 1 other test cases/);
  assert.match(
    report,
    /Duration: 30 ms summed recorded test execution; 1 untimed/,
  );
  assert.match(report, /pass\.spec\.ts \| 1 \| 0 \| 0 \| 0 ms/);
  assert.match(report, /fail\.spec\.ts \| 0 \| 1 \| 0 \| 30 ms/);
  assert.match(report, /other\.spec\.ts \| 0 \| 0 \| 1 \| unavailable/);
  assert.doesNotMatch(report, /browser\.spec\.ts/);
  assert.match(report, /Complete parts with failures/);
  assert.match(report, /remain failed/);
});

test("missing and ambiguous parts stay incomplete and never claim an executed pass", () => {
  const summary = makeMe.aCiProofSummary
    .ofRun({ runId: 7, runAttempt: 2, revision })
    .withEntries(
      makeMe.aCiProofEntry
        .at(entry)
        .counting(0)
        .inParts(3, { missing: [1, 2], ambiguous: [3] })
        .please(),
    )
    .please();
  const report = renderFrontendTestProof(summary, entry);
  assert.match(report, /Part 1 of 3: missing \(unknown; not a reported zero\)/);
  assert.match(report, /Part 2 of 3: missing/);
  assert.match(report, /Part 3 of 3: ambiguous/);
  assert.match(report, /Incomplete/);
  assert.match(
    report,
    /do not establish an executed pass of dashboard\/frontend-tests/,
  );
  assert.doesNotMatch(report, /All declared parts are present/);
  assert.doesNotMatch(report, /all-passed|all passed/i);
});

test("all parts missing still yields an incomplete report, not an empty pass", () => {
  const summary = makeMe.aCiProofSummary
    .ofRun({ runId: 9, runAttempt: 1, revision })
    .withEntries(
      makeMe.aCiProofEntry
        .at(entry)
        .counting(0)
        .inParts(2, { missing: [1, 2] })
        .please(),
    )
    .please();
  const report = renderFrontendTestProof(summary, entry);
  assert.match(report, /0 passed, 0 failed, 0 other test cases/);
  assert.match(report, /Incomplete/);
  assert.doesNotMatch(report, /All declared parts are present/);
});

test("a present empty shard is reported zero, distinct from missing", () => {
  const summary = makeMe.aCiProofSummary
    .ofRun({ runId: 7, runAttempt: 2, revision })
    .withEntries(
      makeMe.aCiProofEntry
        .at(entry)
        .counting(0)
        .brokenDownBy([])
        .inParts(2, { missing: [2] })
        .please(),
    )
    .please();
  const report = renderFrontendTestProof(summary, entry);
  assert.match(report, /Part 1 of 2: present zero/);
  assert.match(report, /Part 2 of 2: missing \(unknown; not a reported zero\)/);
  assert.match(report, /Present parts reported no test files/);
  assert.match(report, /Incomplete/);
});

test("failed evidence stays failed in the report wording", () => {
  const summary = makeMe.aCiProofSummary
    .ofRun({ runId: 7, runAttempt: 2, revision })
    .withEntries(
      makeMe.aCiProofEntry
        .at(entry)
        .withFile("dashboard/frontend-tests/fail.spec.ts", {
          passed: 0,
          failed: 1,
          durationMs: 30,
        })
        .please(),
    )
    .please();
  const report = renderFrontendTestProof(summary, entry);
  assert.match(report, /0 passed, 1 failed, 0 other/);
  assert.match(report, /Complete parts with failures/);
  assert.match(report, /remain failed/);
});

test("the CLI writes the report and refuses missing or invalid summaries", (t) => {
  const directory = temporary(t);
  const summaryPath = join(directory, "summary.json");
  const out = join(directory, FRONTEND_TEST_PROOF_FILE);
  const summary = makeMe.aCiProofSummary
    .ofRun({ runId: 7, runAttempt: 2, revision })
    .withEntries(makeMe.aCiProofEntry.at(entry).counting(2).timed(50).please())
    .please();
  writeFileSync(summaryPath, `${JSON.stringify(summary)}\n`);
  const ok = cli("--summary", summaryPath, "--entry", entry, "--out", out);
  assert.deepEqual([ok.status, ok.stderr], [0, ""]);
  assert.match(readFileSync(out, "utf8"), /Run ID: 7/);

  const missing = cli(
    "--summary",
    join(directory, "absent.json"),
    "--entry",
    entry,
    "--out",
    out,
  );
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /summary file not found/);

  writeFileSync(summaryPath, "{}\n");
  const invalid = cli("--summary", summaryPath, "--entry", entry, "--out", out);
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /summary is invalid/);

  writeFileSync(summaryPath, `${JSON.stringify(summary)}\n`);
  const wrongEntry = cli(
    "--summary",
    summaryPath,
    "--entry",
    "dashboard/tests",
    "--out",
    out,
  );
  assert.equal(wrongEntry.status, 1);
  assert.match(wrongEntry.stderr, /summary has no entry dashboard\/tests/);
});
