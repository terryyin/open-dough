import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  assessWorktreePreparation,
  directoryPresenceObservation,
} from "../../support/execution-worktree-preparation-assessor.mjs";
import { runReadinessGate } from "../../support/execution-worktree-preparation-readiness-gate.mjs";
import {
  createLockedNodeFixture,
  observePreparation,
} from "./execution-worktree-preparation-test-fixtures.mjs";

test("a fresh locked worktree becomes command-usable before delegation", async (t) => {
  const fixture = await createLockedNodeFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;

  assert.equal(
    existsSync(join(execution, "node_modules/.bin/fixture-cli")),
    false,
    "the locked executable must be unavailable before npm ci",
  );
  assert.equal(existsSync(join(execution, "origin-marker")), false);
  assert.notEqual(realpathSync(origin), realpathSync(execution));

  const result = await runReadinessGate(execution, fixture.env);
  const observation = observePreparation(fixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, true, result.report);
  assert.equal(result.reused, false);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.deepEqual(
    observation.traces.map(({ type, cwd }) => ({ type, cwd })),
    [
      { type: "setup", cwd: execution },
      { type: "command", cwd: execution },
    ],
  );
  assert.deepEqual(
    result.invocations.map(({ role, cwd, code }) => ({ role, cwd, code })),
    [
      { role: "setup", cwd: execution, code: 0 },
      { role: "command", cwd: execution, code: 0 },
      { role: "delegate", cwd: execution, code: 0 },
    ],
  );
  assert.match(result.invocations[1].stdout, /fixture-cli-ok/);
  assert.equal(observation.executionOwnsInstall, true);
  assert.equal(existsSync(join(origin, "origin-marker")), true);
  assert.equal(
    existsSync(join(origin, "node_modules/.origin-install-marker")),
    true,
  );
  assert.equal(
    existsSync(join(execution, "node_modules/.origin-install-marker")),
    false,
  );
});

test("failed preparation stops before delegation, proof, or CI readiness", async (t) => {
  const fixture = await createLockedNodeFixture({ failingInstall: true });
  t.after(fixture.cleanup);
  const { execution } = fixture;

  const result = await runReadinessGate(execution, fixture.env);
  const observation = observePreparation(fixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, false);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.equal(
    result.invocations.some((entry) => entry.role === "delegate"),
    false,
  );
  assert.equal(
    result.invocations.some((entry) =>
      ["format", "proof", "ci-ready", "command"].includes(entry.role),
    ),
    false,
  );
  assert.match(result.report, new RegExp(escapeRegExp(execution)));
  assert.match(result.report, /npm ci/);
  assert.match(result.report, /fail|error|exit|ELIFECYCLE/i);
  assert.deepEqual(observation.traces, []);
  assert.equal(observation.originMarkerUnchanged, true);
  assert.equal(observation.originLockUnchanged, true);
  assert.equal(observation.executionLockUnchanged, true);
});

test("a node_modules presence check fails the assessor", (t) => {
  const checkout = mkdtempSync(join(tmpdir(), "execution-worktree-presence-"));
  t.after(() => rmSync(checkout, { recursive: true, force: true }));
  mkdirSync(join(checkout, "node_modules"));
  const observation = directoryPresenceObservation(checkout);
  assert.equal(observation.nodeModulesExists, true);
  const assessment = assessWorktreePreparation(observation);
  assert.equal(assessment.status, "fail");
  assert.match(assessment.reason, /node_modules/);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
