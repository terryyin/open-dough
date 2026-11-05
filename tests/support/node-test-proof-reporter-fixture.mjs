// Shared scratch checkout and runners for node:test proof-recorder tests.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after } from "node:test";
import { fileURLToPath } from "node:url";

const supportDir = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(supportDir, "../..");
const scratchRoot = realpathSync(
  mkdtempSync(path.join(tmpdir(), "node-test-proof-reporter-")),
);
after(() => rmSync(scratchRoot, { recursive: true, force: true }));

const childEnvBase = { ...process.env };
delete childEnvBase.NODE_TEST_CONTEXT;
delete childEnvBase.RECORD_NODE_TEST_PROOF;
for (const key of Object.keys(childEnvBase)) {
  if (key.startsWith("OPEN_DOUGH_TEST_")) delete childEnvBase[key];
}

export function git(cwd, args) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  assert.equal(
    result.status,
    0,
    `git ${args.join(" ")} failed: ${result.stderr}`,
  );
  return result.stdout.trim();
}

function copySupport(fixture) {
  const dest = path.join(fixture, "tests", "support");
  mkdirSync(dest, { recursive: true });
  for (const name of [
    "node-test-failures-reporter.mjs",
    "node-test-proof-reporter.mjs",
    "proofStore.mjs",
    "proofDirectoryRefresh.mjs",
    "proofObservationOrder.mjs",
  ]) {
    cpSync(path.join(supportDir, name), path.join(dest, name));
  }
}

function copyRunner(fixture) {
  mkdirSync(path.join(fixture, "scripts"), { recursive: true });
  for (const name of [
    "test.sh",
    "test-run-job.bash",
    "test-jobs.sh",
    "test-shares.mjs",
    "share-deal.mjs",
    "duration-list.mjs",
    "local-test-suite.mjs",
    "local-test-processes.mjs",
    "lost-setpgid-race.bash",
    "test-environment.bash",
    "bash-floor.bash",
  ]) {
    cpSync(
      path.join(repoRoot, "scripts", name),
      path.join(fixture, "scripts", name),
    );
  }
}

function writeOpenDough(fixture, locations) {
  mkdirSync(path.join(fixture, ".planning"), { recursive: true });
  writeFileSync(
    path.join(fixture, ".planning", "open-dough.json"),
    `${JSON.stringify({ intent: { locations } }, null, 2)}\n`,
  );
}

export function scratchCheckout({
  covered = "covered",
  proof = "tests/proof",
} = {}) {
  const fixture = mkdtempSync(path.join(scratchRoot, "fx-"));
  copyRunner(fixture);
  copySupport(fixture);
  mkdirSync(path.join(fixture, covered), { recursive: true });
  writeOpenDough(fixture, [
    {
      path: covered,
      kind: "javascript",
      include: ["**/*.test.mjs"],
      runner: "node:test",
      proof,
      proofGeneration: {
        command: "RECORD_NODE_TEST_PROOF=1 bash scripts/test.sh <files>",
      },
    },
  ]);
  git(fixture, ["init"]);
  git(fixture, ["config", "user.email", "node-test-proof@example.com"]);
  git(fixture, ["config", "user.name", "Node Test Proof"]);
  git(fixture, ["add", "."]);
  git(fixture, ["commit", "-m", "seed"]);
  return fixture;
}

export function writeTest(fixture, relativeFile, source) {
  const absolute = path.join(fixture, relativeFile);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, source);
  return absolute;
}

export function readLatest(fixture, proof = "tests/proof") {
  const file = path.join(fixture, proof, "latest.json");
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, "utf8"));
}

export function seedObservations(fixture, observations, proof = "tests/proof") {
  const directory = path.join(fixture, proof);
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, "latest.json"),
    `${JSON.stringify({ version: 1, observations }, null, 2)}\n`,
  );
}

export function passedObservation(file, testNames, commit, fileBlob) {
  return {
    file,
    test: testNames,
    outcome: "passed",
    attempts: 1,
    durationMs: 1,
    finishedAt: "2026-11-04T12:00:00.000Z",
    commit,
    fileBlob,
  };
}

export function maskTiming(text) {
  return text
    .replace(/\d+(?:\.\d+)?m?s\b/g, "<time>")
    .replace(/\d{4}-\d{2}-\d{2}T[\d:.]+Z/g, "<iso>");
}

export function runTestSh(
  fixture,
  files,
  { record = false, jobs, env = {} } = {},
) {
  const envForChild = {
    ...childEnvBase,
    ...env,
  };
  if (record) envForChild.RECORD_NODE_TEST_PROOF = "1";
  else delete envForChild.RECORD_NODE_TEST_PROOF;
  if (jobs !== undefined) envForChild.OPEN_DOUGH_TEST_JOBS = String(jobs);
  return spawnSync(process.env.BASH || "bash", ["scripts/test.sh", ...files], {
    cwd: fixture,
    encoding: "utf8",
    env: envForChild,
  });
}

export function runNodeDirect(
  fixture,
  files,
  { record = false, extraArgs = [], env = {} } = {},
) {
  const failures = path.join(
    fixture,
    "tests/support/node-test-failures-reporter.mjs",
  );
  const proof = path.join(
    fixture,
    "tests/support/node-test-proof-reporter.mjs",
  );
  const envForChild = {
    ...childEnvBase,
    ...env,
  };
  if (record) envForChild.RECORD_NODE_TEST_PROOF = "1";
  else delete envForChild.RECORD_NODE_TEST_PROOF;
  return spawnSync(
    process.execPath,
    [
      "--test",
      `--test-reporter=${failures}`,
      "--test-reporter-destination=stdout",
      `--test-reporter=${proof}`,
      "--test-reporter-destination=stdout",
      ...extraArgs,
      ...files.map((file) => path.join(fixture, file)),
    ],
    { cwd: fixture, encoding: "utf8", env: envForChild },
  );
}

export function spawnNodeDirect(
  fixture,
  relativeFile,
  { record = false } = {},
) {
  const failures = path.join(
    fixture,
    "tests/support/node-test-failures-reporter.mjs",
  );
  const proof = path.join(
    fixture,
    "tests/support/node-test-proof-reporter.mjs",
  );
  const envForChild = { ...childEnvBase };
  if (record) envForChild.RECORD_NODE_TEST_PROOF = "1";
  else delete envForChild.RECORD_NODE_TEST_PROOF;
  return spawn(
    process.execPath,
    [
      "--test",
      `--test-reporter=${failures}`,
      "--test-reporter-destination=stdout",
      `--test-reporter=${proof}`,
      "--test-reporter-destination=stdout",
      path.join(fixture, relativeFile),
    ],
    { cwd: fixture, env: envForChild, stdio: "ignore" },
  );
}
