// A browser test group's shard from the patterns its CI job declares:
// support/testFiles.mjs selects through scripts/test-share-matrix.mjs, the
// rule the Distribution shares use (./test-share-workflow.test.mjs). Each
// group's actual specs over its CI shards: ./browser-group-shards.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  dashboardTestMatch,
  dashboardTestProjects,
} from "../../../dashboard/test-support/support/testFiles.mjs";

const workflowFile = ".github/workflows/ci.yml";

// The workflow text is the format under proof, so each case states its specs.
const workflowWith = (specs, shards = "[1, 2, 3]") => `jobs:
  dashboard-backend:
    uses: ./.github/workflows/browser-test-group.yml
    with:
      group: dashboard-backend
      root: dashboard/backend-tests
      shards: "${shards}"
      specs: |
${specs.map((line) => `        ${line}`).join("\n")}
`;

const threeShards = workflowWith([
  "1: dashboard/backend-tests/launches/** dashboard/backend-tests/runtime/**",
  "2: dashboard/backend-tests/sessions/agent-*",
]);

const specs = [
  "backend-tests/launches/start.spec.ts",
  "backend-tests/runtime/deep/production-watcher.spec.ts",
  "backend-tests/sessions/agent-a.spec.ts",
  "backend-tests/sessions/session-b.spec.ts",
  "backend-tests/intent/new-folder.spec.ts",
];

// A scratch repository: the spec files under `dashboard/` and the workflow.
function withRepository(workflow, body) {
  const repository = mkdtempSync(join(tmpdir(), "declared-shards-"));
  try {
    for (const file of specs) {
      mkdirSync(join(repository, "dashboard", file, ".."), { recursive: true });
      writeFileSync(join(repository, "dashboard", file), "");
    }
    mkdirSync(join(repository, ".github/workflows"), { recursive: true });
    writeFileSync(join(repository, workflowFile), workflow);
    const testDir = pathToFileURL(join(repository, "dashboard/"));
    const selection = {
      roots: ["backend-tests"],
      splitVariable: "OWN_SPLIT",
      workflow: pathToFileURL(join(repository, workflowFile)),
      job: "dashboard-backend",
    };
    body({ testDir, selection, dashboard: join(repository, "dashboard") });
  } finally {
    rmSync(repository, { recursive: true, force: true });
  }
}

// The specs (relative to the configuration's directory) `patterns` match.
const matchedSpecs = (patterns, dashboard) =>
  specs.filter((file) =>
    patterns.some((pattern) => pattern.test(join(dashboard, file))),
  );

test("each shard runs the specs its patterns match and the last shard the rest", () => {
  withRepository(threeShards, ({ testDir, selection, dashboard }) => {
    const shard = (split) =>
      matchedSpecs(dashboardTestMatch(testDir, split, selection), dashboard);
    assert.deepEqual(shard("1/3"), [
      "backend-tests/launches/start.spec.ts",
      "backend-tests/runtime/deep/production-watcher.spec.ts",
    ]);
    assert.deepEqual(shard("2/3"), ["backend-tests/sessions/agent-a.spec.ts"]);
    assert.deepEqual(shard("3/3"), [
      "backend-tests/sessions/session-b.spec.ts",
      "backend-tests/intent/new-folder.spec.ts",
    ]);
    assert.equal(dashboardTestMatch(testDir, "1/3", selection).length, 2);
    assert.deepEqual(shard(undefined), specs);
  });
});

test("the production chains and the rest partition the selected shard", () => {
  withRepository(threeShards, ({ testDir, selection, dashboard }) => {
    const [deployments, chromium] = dashboardTestProjects(
      testDir,
      "1/3",
      selection,
    );
    assert.equal(deployments.name, "chromium-deployments");
    assert.deepEqual(matchedSpecs(deployments.testMatch, dashboard), [
      "backend-tests/runtime/deep/production-watcher.spec.ts",
    ]);
    assert.equal(chromium.name, "chromium");
    assert.deepEqual(matchedSpecs(chromium.testMatch, dashboard), [
      "backend-tests/launches/start.spec.ts",
    ]);
    const [, rest] = dashboardTestProjects(testDir, "3/3", selection);
    assert.equal(matchedSpecs(rest.testMatch, dashboard).length, 2);
  });
});

for (const split of ["2/3", undefined]) {
  test(`a spec two shards match fails the configuration ${split ? "with" : "without"} a split, naming it and both shards`, () => {
    const overlapping = workflowWith([
      "1: dashboard/backend-tests/sessions/**",
      "2: dashboard/backend-tests/sessions/agent-*",
    ]);
    withRepository(overlapping, ({ testDir, selection }) => {
      for (const select of [dashboardTestMatch, dashboardTestProjects]) {
        assert.throws(
          () => select(testDir, split, selection),
          new Error(
            `FAIL: ${workflowFile}: dashboard/backend-tests/sessions/agent-a.spec.ts matches the patterns of shares 1 and 2.`,
          ),
        );
      }
    });
  });

  test(`a pattern matching no spec fails the configuration ${split ? "with" : "without"} a split, naming it`, () => {
    const unmatched = workflowWith([
      "1: dashboard/backend-tests/launches/**",
      "2: dashboard/backend-tests/removed/**",
    ]);
    withRepository(unmatched, ({ testDir, selection }) => {
      assert.throws(
        () => dashboardTestMatch(testDir, split, selection),
        new Error(
          `FAIL: ${workflowFile}: pattern dashboard/backend-tests/removed/** of share 2 matches no check.`,
        ),
      );
    });
  });
}

test("a split that is not one of the declared shards is refused naming its setting", () => {
  withRepository(threeShards, ({ testDir, selection }) => {
    for (const split of ["", "x", "0/3", "4/3", "1/2", "2/4", "1/3/3"]) {
      assert.throws(
        () => dashboardTestMatch(testDir, split, selection),
        (error) =>
          error.message ===
          `FAIL: ${workflowFile}: OWN_SPLIT=${split} is not <i>/<n> with n the share count and i a share of share: [1, 2, 3].`,
        split,
      );
    }
  });
});

test("a selection naming no job runs every spec under any split", () => {
  withRepository(threeShards, ({ testDir, selection, dashboard }) => {
    const fixtureRun = {
      roots: selection.roots,
      splitVariable: selection.splitVariable,
    };
    assert.deepEqual(
      matchedSpecs(dashboardTestMatch(testDir, "2/3", fixtureRun), dashboard),
      specs,
    );
  });
});

test("a last shard the patterns leave empty selects no spec rather than every spec", () => {
  const claimed = workflowWith([
    "1: dashboard/backend-tests/launches/** dashboard/backend-tests/runtime/** dashboard/backend-tests/intent/**",
    "2: dashboard/backend-tests/sessions/**",
  ]);
  withRepository(claimed, ({ testDir, selection }) => {
    const matches = dashboardTestProjects(testDir, "3/3", selection).flatMap(
      (project) => project.testMatch,
    );
    assert.equal(matches.length, 0);
  });
});
