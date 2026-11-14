import assert from "node:assert/strict";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assessWorktreePreparation } from "./execution-worktree-preparation-assessor.mjs";
import { runReadinessGate } from "./execution-worktree-preparation-readiness-gate.mjs";
import {
  createWrapperDrivenFixture,
  observeWrapperPreparation,
} from "./execution-worktree-preparation-wrapper-test-fixtures.mjs";

const skill = dirname(dirname(fileURLToPath(import.meta.url)));

function readSkill(name) {
  return readFileSync(join(skill, name), "utf8");
}

test("checked-in conventions cover wrapper-driven projects without an ecosystem branch", () => {
  const location = readSkill("references/execution-location.md");
  const gate = readSkill(
    "scripts/execution-worktree-preparation-readiness-gate.mjs",
  );

  assert.match(location, /generated\s+output/);
  assert.match(location, /artifact caches may remain machine-level/);
  assert.match(location, /do not require\s+npm/);
  assert.match(location, /command selected or the missing convention/);
  assert.doesNotMatch(location, /always `npm ci`/);
  assert.doesNotMatch(location, /open-dough\.json/);
  assert.doesNotMatch(gate, /\b(?:npm|nix|maven|gradle|pom\.xml)\b/i);
});

test("a fresh wrapper-driven worktree follows the project convention", async (t) => {
  const fixture = await createWrapperDrivenFixture();
  t.after(fixture.cleanup);
  const { origin, execution, artifactCache } = fixture;

  assert.equal(existsSync(join(execution, "target", "built")), false);
  assert.equal(existsSync(join(origin, "target", "origin-only")), true);
  assert.notEqual(realpathSync(origin), realpathSync(execution));
  assert.equal(
    realpathSync(artifactCache).startsWith(realpathSync(execution)),
    false,
  );

  const result = await runReadinessGate(execution, fixture.env);
  const observation = observeWrapperPreparation(fixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, true, result.report);
  assert.equal(result.reused, false);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.equal(result.convention.setup, "./wrapper prepare");
  assert.equal(result.convention.command, "./wrapper prove");
  assert.deepEqual(
    observation.traces.map(({ type, cwd, cache }) => ({ type, cwd, cache })),
    [
      { type: "setup", cwd: execution, cache: artifactCache },
      { type: "command", cwd: execution, cache: artifactCache },
    ],
  );
  assert.deepEqual(
    result.invocations.map(({ role, command, cwd, code }) => ({
      role,
      command,
      cwd,
      code,
    })),
    [
      {
        role: "setup",
        command: "./wrapper prepare",
        cwd: execution,
        code: 0,
      },
      {
        role: "command",
        command: "./wrapper prove",
        cwd: execution,
        code: 0,
      },
      { role: "delegate", command: "implementation", cwd: execution, code: 0 },
    ],
  );
  assert.match(result.invocations[0].stdout, /cache-reuse/);
  assert.match(result.invocations[1].stdout, /wrapper-prove-ok/);
  assert.equal(observation.generatedOutputInWorktree, true);
  assert.equal(observation.sharedArtifactCacheOutsideWorktree, true);
  assert.equal(observation.copiedOriginArtifacts, false);
  assert.equal(observation.usedNpmOrNix, false);
  assert.equal(observation.cacheDigestUnchanged, true);
  assert.equal(observation.originMarkerUnchanged, true);
  assert.equal(existsSync(join(execution, "node_modules")), false);
  assert.equal(existsSync(join(execution, "target", "origin-only")), false);
  assert.match(
    readFileSync(join(execution, "target", "built"), "utf8"),
    /seeded-artifact-v1/,
  );
});

test("a missing wrapper convention stops without ecosystem guessing", async (t) => {
  const fixture = await createWrapperDrivenFixture({ missingConvention: true });
  t.after(fixture.cleanup);
  const { execution } = fixture;

  assert.equal(existsSync(join(execution, "pom.xml")), true);
  assert.equal(existsSync(join(execution, "CONTRIBUTING.md")), false);
  assert.equal(existsSync(join(execution, "wrapper")), true);

  const result = await runReadinessGate(execution, fixture.env);
  const observation = observeWrapperPreparation(fixture, result);
  const assessment = assessWorktreePreparation(observation);

  assert.equal(result.ok, false);
  assert.equal(result.convention.missing, true);
  assert.equal(assessment.status, "pass", assessment.reason);
  assert.deepEqual(result.invocations, []);
  assert.deepEqual(observation.traces, []);
  assert.equal(observation.usedNpmOrNix, false);
  assert.equal(existsSync(join(execution, "target", "built")), false);
  assert.match(result.report, new RegExp(escapeRegExp(execution)));
  assert.match(result.report, /missing/i);
  assert.doesNotMatch(result.report, /\b(?:npm|nix|mvn|gradle)\b/i);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
