// A browser test group's share selection: support/testFiles.mjs deals the
// group's spec files through scripts/share-deal.mjs by the seconds in the
// group's own duration list (dashboard/tests/shards.md). Each group's actual
// specs over the shards its CI job runs: ./browser-group-shards.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { durationListText } from "./job-duration-list.mjs";
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
import {
  dashboardTestMatch,
  dashboardTestProjects,
} from "../../dashboard/tests/support/testFiles.mjs";
import { remainingSuiteTime } from "../../dashboard/tests/support/suiteDeadline.mjs";

// A runner owning every scratch root below, dealt by `longest-first`.
const scratch = {
  roots: ["tests", "frontend-tests", "backend-tests"],
  splitVariable: "SCRATCH_SPLIT",
  durations: "longest-first",
};

// A scratch spec directory with the given spec files and list text.
function withSpecDirectory(files, list, body) {
  const path = mkdtempSync(join(tmpdir(), "dashboard-shares-"));
  try {
    for (const file of files) {
      mkdirSync(join(path, file, ".."), { recursive: true });
      writeFileSync(join(path, file), "");
    }
    writeFileSync(join(path, "longest-first"), list);
    body(pathToFileURL(`${path}/`), path);
  } finally {
    rmSync(path, { recursive: true, force: true });
  }
}

const matched = (patterns, path) =>
  patterns.filter((pattern) => pattern.test(path)).length;

test("the config deals recorded specs by their seconds and new specs after them at the median", () => {
  const files = [
    "tests/known.spec.ts",
    "frontend-tests/dom.spec.ts",
    "backend-tests/short.spec.ts",
    "tests/new.spec.ts",
  ];
  // A removed entry is ignored and a repeated one keeps its largest seconds.
  const list =
    "# header\n9.0\ttests/known.spec.ts\n1.0\ttests/removed.spec.ts\n3.0\tfrontend-tests/dom.spec.ts\n0.5\tbackend-tests/short.spec.ts\n1.0\tbackend-tests/short.spec.ts\n";
  withSpecDirectory(files, list, (directory, path) => {
    const first = dashboardTestMatch(directory, "1/2", scratch);
    const second = dashboardTestMatch(directory, "2/2", scratch);
    // known 9.0 to share 1; dom 3.0 and short 1.0 to share 2; new at the
    // median 3.0 to the lighter share 2.
    assert.equal(first.length, 1);
    assert.equal(second.length, 3);
    assert.equal(matched(first, join(path, "tests/known.spec.ts")), 1);
    assert.equal(matched(second, join(path, "frontend-tests/dom.spec.ts")), 1);
    assert.equal(matched(second, join(path, "backend-tests/short.spec.ts")), 1);
    assert.equal(matched(second, join(path, "tests/new.spec.ts")), 1);
    assert.equal(matched(first, join(path, "longest-first")), 0);
  });
});

test("a runner owning one root deals only its specs and names its own split", () => {
  const files = ["tests/a.spec.ts", "frontend-tests/b.spec.ts"];
  const list = "9.0\ttests/a.spec.ts\n2.0\tfrontend-tests/b.spec.ts\n";
  withSpecDirectory(files, list, (directory, path) => {
    const own = {
      roots: ["frontend-tests"],
      splitVariable: "OWN_SPLIT",
      durations: "longest-first",
    };
    // Alone in its runner, the frontend spec takes the first share.
    const first = dashboardTestMatch(directory, "1/2", own);
    assert.equal(first.length, 1);
    assert.equal(matched(first, join(path, "frontend-tests/b.spec.ts")), 1);
    assert.equal(dashboardTestMatch(directory, "2/2", own).length, 0);
    assert.throws(() => dashboardTestMatch(directory, "x", own), /OWN_SPLIT=x/);
  });
});

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
  withSpecDirectory(files, "", (directory, path) => {
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

test("invalid shares fail before selecting tests", () => {
  withSpecDirectory(
    ["tests/a.spec.ts"],
    durationListText(
      makeMe.jobDurations.with([["tests/a.spec.ts", 1]]).please(),
    ),
    (directory) => {
      for (const invalid of [
        "",
        "0/2",
        "3/2",
        "1/0",
        "x",
        "1/2/3",
        "1/9007199254740992",
      ]) {
        assert.throws(
          () => dashboardTestMatch(directory, invalid, scratch),
          /SCRATCH_SPLIT=/,
        );
      }
    },
  );
});

test("a list line without seconds fails the configuration naming the file, line and content", () => {
  withSpecDirectory(
    ["tests/a.spec.ts", "tests/b.spec.ts"],
    "# header\n2.0\ttests/a.spec.ts\ntests/b.spec.ts\n",
    (directory, path) => {
      assert.throws(
        () => dashboardTestMatch(directory, "1/2", scratch),
        new Error(
          `FAIL: ${join(path, "longest-first")}:3: "tests/b.spec.ts" is not <seconds><TAB><label>; no check was run.`,
        ),
      );
    },
  );
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
test("unsharded projects include new specs and an empty shard never expands to every file", () => {
  const files = ["runtime/production-watcher-updates.spec.ts", "dom.spec.ts"];
  const own = { ...scratch, roots: ["."] };
  withSpecDirectory(files, "", (directory, path) => {
    const projects = dashboardTestProjects(directory, undefined, own);
    assert.equal(matched(projects[0].testMatch, join(path, files[0])), 1);
    assert.equal(matched(projects[1].testMatch, join(path, files[1])), 1);
    const matches = dashboardTestProjects(directory, "4/4", own).flatMap(
      (project) => project.testMatch,
    );
    assert.equal(matches.length, 0);
  });
});
