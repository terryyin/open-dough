import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  assessWorktreePreparation,
  directoryPresenceObservation,
} from "./execution-worktree-preparation-assessor.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import {
  createLockedNodeFixture,
  observePreparation,
} from "./execution-worktree-preparation-test-fixtures.mjs";

const skill = dirname(dirname(fileURLToPath(import.meta.url)));
const reference = (name) =>
  readFileSync(join(skill, "references", name), "utf8");

test("execution-location owns project-command readiness before delegation", () => {
  const location = reference("execution-location.md");
  const skillBody = readFileSync(join(skill, "SKILL.md"), "utf8");
  const runtime = reference("runtime-setup.md");

  assert.match(
    skillBody,
    /Before creating the execution workspace, read[\s\S]*execution-location/,
  );
  assert.match(skillBody, /project-command readiness/);
  assert.match(
    skillBody,
    /Follow \[execution location\]\(references\/execution-location\.md\)/,
  );
  assert.match(skillBody, /reuse of host-established/);

  assert.match(location, /one setup lifecycle/);
  assert.match(location, /checked-in conventions and\s+locked dependency/);
  assert.match(location, /not from an Open Dough configuration key/);
  assert.match(location, /contributor or CI convention for `npm ci`/);
  assert.match(location, /do not require\s+npm/);
  assert.match(
    location,
    /do not[\s\S]*treat a lockfile's presence as an Open Dough recognizer/,
  );
  assert.match(location, /applicable project command/);
  assert.match(
    location,
    /Do not infer availability from the presence or absence\s+of `node_modules`/,
  );
  assert.match(location, /Do not copy or symlink\s+mutable installation/);
  assert.match(
    location,
    /stops before implementation delegation, formatting,\s+proof commands, or CI-readiness claims/,
  );
  assert.match(location, /command selected or the missing convention/);
  assert.match(
    location,
    /\[Runtime setup\]\(runtime-setup\.md\) remains the owner of checkout-bound CI\s+observer runtime only/,
  );
  assert.match(
    location,
    /Arm only after the project-command readiness\s+gate above has passed/,
  );
  assert.match(location, /Reuse that host-established outcome/);
  assert.match(location, /exact\s+selected checkout/);
  assert.match(location, /current locked dependency state/);
  assert.match(location, /write no registry, stamp\s+file/);
  assert.match(location, /host callback may supply evidence/);
  assert.match(location, /cannot redefine what prepared means/);
  assert.match(location, /parent-directory resolution/);
  assert.match(
    location,
    /copied installation, or a\s+symlink is not reuse evidence/,
  );
  assert.match(location, /same readiness gate, not a second preparation path/);
  assert.doesNotMatch(location, /always `npm ci`/);
  assert.doesNotMatch(location, /open-dough\.json/);
  assert.doesNotMatch(runtime, /npm ci/);
});

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
