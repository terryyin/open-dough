// A browser test group's spec discovery and run deadline
// (support/testFiles.mjs, support/suiteDeadline.mjs). A shard from the
// patterns a CI job declares: ./dashboard-declared-shards.test.mjs; each
// group's actual specs over its CI shards: ./browser-group-shards.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { dashboardTestProjects } from "../../../dashboard/test-support/support/testFiles.mjs";
import { remainingSuiteTime } from "../../../dashboard/test-support/support/suiteDeadline.mjs";

// A fixture runner naming no CI job, which runs every spec under its roots.
const scratch = {
  roots: ["tests", "frontend-tests", "backend-tests"],
  splitVariable: "SCRATCH_SPLIT",
};

// A scratch spec directory with the given spec files.
function withSpecDirectory(files, body) {
  const path = mkdtempSync(join(tmpdir(), "dashboard-shares-"));
  try {
    for (const file of files) {
      mkdirSync(join(path, file, ".."), { recursive: true });
      writeFileSync(join(path, file), "");
    }
    body(pathToFileURL(`${path}/`), path);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
}

const matched = (patterns, path) =>
  patterns.filter((pattern) => pattern.test(path)).length;

test("discovery never walks a run's output while Playwright changes it", () => {
  // A run keeps its output beside its specs (support/runnerConfig.mjs); a
  // worker reloading the configuration mid-run must not read it.
  const stamp = "tests/test-results/2026-11-14T02-10-56.693Z-2671";
  const traces = `${stamp}/.playwright-artifacts-3/traces`;
  const files = [
    "tests/a.spec.ts",
    "tests/nested/b.spec.ts",
    `${stamp}/copied.spec.ts`,
    `${traces}/resources/kept.spec.ts`,
    "tests/playwright-report/data/report.spec.ts",
  ];
  withSpecDirectory(files, (directory, path) => {
    // An unreadable directory stands in for one Playwright deletes mid-walk.
    chmodSync(join(path, traces), 0);
    try {
      const own = { ...scratch, roots: ["tests"] };
      const [, chromium] = dashboardTestProjects(directory, undefined, own);
      assert.equal(chromium.testMatch.length, 2);
      assert.equal(matched(chromium.testMatch, join(path, files[0])), 1);
      assert.equal(matched(chromium.testMatch, join(path, files[1])), 1);
    } finally {
      chmodSync(join(path, traces), 0o755);
    }
  });
});

test("the recorded deadline leaves the suite its remaining time", () => {
  const now = 1_700_000_000_000;
  const variable = "OWN_DEADLINE_MS";
  assert.equal(remainingSuiteTime(undefined, variable, now), undefined);
  assert.equal(
    remainingSuiteTime(String(now + 320_000), variable, now),
    320_000,
  );
  assert.equal(remainingSuiteTime(String(now + 1), variable, now), 1);
});

test("a passed or unreadable deadline fails the run naming it", () => {
  const now = 1_700_000_000_000;
  const variable = "OWN_DEADLINE_MS";
  for (const passed of [String(now), String(now - 5_000)]) {
    assert.throws(
      () => remainingSuiteTime(passed, variable, now),
      new RegExp(`OWN_DEADLINE_MS=${passed} passed`),
    );
  }
  for (const invalid of ["", "soon", "-1", "1.5", "1e12", "9007199254740993"]) {
    assert.throws(
      () => remainingSuiteTime(invalid, variable, now),
      (error) => error.message.startsWith(`OWN_DEADLINE_MS=${invalid} is not`),
    );
  }
});
test("unsharded projects include new specs", () => {
  const files = ["runtime/production-watcher-updates.spec.ts", "dom.spec.ts"];
  const own = { ...scratch, roots: ["."] };
  withSpecDirectory(files, (directory, path) => {
    const projects = dashboardTestProjects(directory, undefined, own);
    assert.equal(matched(projects[0].testMatch, join(path, files[0])), 1);
    assert.equal(matched(projects[1].testMatch, join(path, files[1])), 1);
  });
});
