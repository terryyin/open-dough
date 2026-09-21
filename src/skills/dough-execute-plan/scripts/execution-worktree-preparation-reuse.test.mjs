import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";
import { assessWorktreePreparation } from "./execution-worktree-preparation-assessor.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import {
  createLockedNodeFixture,
  integritySnapshot,
  lockfileDigest,
  observePreparation,
  setupTraceCount,
} from "./execution-worktree-preparation-test-fixtures.mjs";
import {
  changeDependencyState,
  createNestedUnpreparedCheckout,
  hostPrepareCheckout,
} from "./execution-worktree-preparation-reuse-test-fixtures.mjs";

const exec = promisify(execFile);

test("host-established preparation of the selected checkout is reused", async (t) => {
  const fixture = await createLockedNodeFixture();
  t.after(fixture.cleanup);
  const { execution } = fixture;

  await hostPrepareCheckout(execution, fixture.env);
  assert.equal(setupTraceCount(fixture.tracePath), 1);

  const result = await runReadinessGate(
    execution,
    fixture.env,
    hostEstablished(execution),
  );
  const observation = observePreparation(fixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, true, result.report);
  assert.equal(result.reused, true);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.equal(setupTraceCount(fixture.tracePath), 1);
  assert.equal(
    result.invocations.some((entry) => entry.role === "setup"),
    false,
  );
  assert.deepEqual(
    result.invocations.map(({ role, cwd, code }) => ({ role, cwd, code })),
    [
      { role: "command", cwd: execution, code: 0 },
      { role: "delegate", cwd: execution, code: 0 },
    ],
  );
  assert.match(result.invocations[0].stdout, /fixture-cli-ok/);
  assert.equal(observation.executionOwnsInstall, true);
});

test("preparation evidence naming another worktree is not reused", async (t) => {
  const fixture = await createLockedNodeFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;

  const result = await runReadinessGate(
    execution,
    fixture.env,
    hostEstablished(execution, {
      hostCheckout: origin,
      dependencyState: lockfileDigest(origin),
    }),
  );
  const observation = observePreparation(fixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, true, result.report);
  assert.equal(result.reused, false);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.deepEqual(
    result.invocations.map(({ role, cwd, code }) => ({ role, cwd, code })),
    [
      { role: "setup", cwd: execution, code: 0 },
      { role: "command", cwd: execution, code: 0 },
      { role: "delegate", cwd: execution, code: 0 },
    ],
  );
  assert.equal(setupTraceCount(fixture.tracePath), 1);
  assert.equal(observation.traces[0].cwd, execution);
});

test("changed dependency state is not reused", async (t) => {
  const fixture = await createLockedNodeFixture();
  t.after(fixture.cleanup);
  const { origin, execution } = fixture;

  await hostPrepareCheckout(execution, fixture.env);
  const preparedState = lockfileDigest(execution);
  assert.equal(setupTraceCount(fixture.tracePath), 1);

  changeDependencyState(execution);
  assert.notEqual(lockfileDigest(execution), preparedState);
  const afterChange = {
    ...fixture,
    before: integritySnapshot(origin, execution),
  };

  const result = await runReadinessGate(
    execution,
    fixture.env,
    hostEstablished(execution, { dependencyState: preparedState }),
  );
  const observation = observePreparation(afterChange, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, true, result.report);
  assert.equal(result.reused, false);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.equal(
    result.invocations.some(
      (entry) => entry.role === "setup" && entry.cwd === execution,
    ),
    true,
  );
  assert.equal(setupTraceCount(fixture.tracePath), 2);
  assert.equal(
    observation.traces.filter((entry) => entry.type === "setup").at(-1).cwd,
    execution,
  );
});

test("a nested checkout is not prepared by an enclosing installation", async (t) => {
  const fixture = await createLockedNodeFixture();
  t.after(fixture.cleanup);
  const nested = createNestedUnpreparedCheckout(fixture.origin);
  const nestedFixture = {
    ...fixture,
    execution: nested,
    before: integritySnapshot(fixture.origin, nested),
  };

  assert.equal(existsSync(join(nested, "node_modules")), false);
  await exec("npm", ["run", "prove"], {
    cwd: nested,
    env: {
      ...fixture.env,
      PREP_TRACE: join(fixture.fixture, "parent-probe.jsonl"),
    },
    timeout: 60_000,
  });

  const result = await runReadinessGate(
    nested,
    fixture.env,
    hostEstablished(nested),
  );
  const observation = observePreparation(nestedFixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, true, result.report);
  assert.equal(result.reused, false);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.deepEqual(
    result.invocations.map(({ role, cwd, code }) => ({ role, cwd, code })),
    [
      { role: "setup", cwd: nested, code: 0 },
      { role: "command", cwd: nested, code: 0 },
      { role: "delegate", cwd: nested, code: 0 },
    ],
  );
  assert.equal(observation.executionOwnsInstall, true);
  assert.equal(existsSync(join(nested, "node_modules/.bin/fixture-cli")), true);
});

function hostEstablished(checkout, { hostCheckout, dependencyState } = {}) {
  const evidenceCheckout = hostCheckout ?? checkout;
  return {
    hostPreparation: {
      checkout: evidenceCheckout,
      dependencyState: dependencyState ?? lockfileDigest(evidenceCheckout),
    },
    dependencyStateOf: lockfileDigest,
  };
}
