// Each browser test group's actual specs over the shards its CI job declares
// in ci.yml (./browserGroupConfigs.mjs, dashboard/test-support/support/testFiles.mjs):
// every spec in exactly one shard, E2E Test's production chains queued first
// inside whichever shard holds them, a new spec landing where the
// declaration says, and a broken declaration refused before any test is
// selected. The selection rule over fixture workflows:
// ./dashboard-declared-shards.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import { pathToFileURL } from "node:url";
import { browserGroupSelection } from "../../../dashboard/test-support/support/browserTestGroups.mjs";
import {
  dashboardSpecFiles,
  dashboardTestMatch,
  dashboardTestProjects,
} from "../../../dashboard/test-support/support/testFiles.mjs";
import { browserGroupConfigs } from "./browserGroupConfigs.mjs";

const repository = new URL("../../../", import.meta.url);
const workflowFile = ".github/workflows/ci.yml";
const ciText = readFileSync(new URL(workflowFile, repository), "utf8");

const matched = (patterns, path) =>
  patterns.filter((pattern) => pattern.test(path)).length;

// Each group's own selection as its configuration makes it, and its shards.
const groups = browserGroupConfigs.map((group) => ({
  ...group,
  selection: browserGroupSelection(group),
  indices: Array.from({ length: group.shards }, (...[, index]) => index + 1),
}));
const groupOf = (job) => groups.find((group) => group.job === job);

for (const group of groups)
  test(`${group.job}'s CI shards match every one of its actual specs exactly once`, () => {
    const { selection, indices, shards } = group;
    const testDir = new URL(`${group.directory}/`, repository);
    const files = dashboardSpecFiles(testDir.pathname, selection.roots);
    assert.ok(files.length > 0);
    const matches = indices.flatMap((index) =>
      dashboardTestMatch(testDir, `${index}/${shards}`, selection),
    );
    assert.equal(matches.length, files.length);
    for (const file of files)
      assert.equal(matched(matches, new URL(file, testDir).pathname), 1, file);
    // Without a split the run takes every spec.
    assert.equal(
      dashboardTestMatch(testDir, undefined, selection).length,
      files.length,
    );
  });

test("E2E Test's native projects queue production chains first and partition every shard without omissions or repeats", () => {
  const { directory, selection, indices, shards } = groupOf("e2e");
  const testDir = new URL(`${directory}/`, repository);
  const files = dashboardSpecFiles(testDir.pathname, selection.roots);
  assert.ok(files.some((file) => /production-watcher/.test(file)));
  const allMatches = [];
  for (const index of indices) {
    const split = `${index}/${shards}`;
    const projects = dashboardTestProjects(testDir, split, selection);
    assert.deepEqual(
      projects.map((project) => project.name),
      ["chromium-deployments", "chromium"],
    );
    const matches = projects.flatMap((project) => project.testMatch);
    const selected = dashboardTestMatch(testDir, split, selection);
    for (const file of files) {
      const path = new URL(file, testDir).pathname;
      assert.equal(matched(matches, path), matched(selected, path), file);
      const chain = /(?:^|\/)production-watcher(?:-.*)?\.spec\.ts$/.test(file);
      if (matched(matches, path))
        assert.equal(matched(projects[chain ? 0 : 1].testMatch, path), 1, file);
    }
    allMatches.push(...matches);
  }
  for (const file of files)
    assert.equal(matched(allMatches, new URL(file, testDir).pathname), 1, file);
});

// A scratch repository holding `group`'s actual spec files (empty) and
// `added`, beside ci.yml's text after `edit`; `body` gets the group's
// selection there and the shard each spec label lands in.
function withScratchGroup(job, { added = [], edit = (text) => text }, body) {
  const group = groupOf(job);
  const scratch = mkdtempSync(join(tmpdir(), "browser-group-shards-"));
  try {
    const actual = dashboardSpecFiles(
      new URL(`${group.directory}/`, repository).pathname,
      group.selection.roots,
    ).map((file) => posix.join(group.directory, file));
    for (const file of [...actual, ...added]) {
      mkdirSync(join(scratch, file, ".."), { recursive: true });
      writeFileSync(join(scratch, file), "");
    }
    mkdirSync(join(scratch, ".github/workflows"), { recursive: true });
    writeFileSync(join(scratch, workflowFile), edit(ciText));
    const testDir = pathToFileURL(join(scratch, group.directory, "/"));
    const selection = {
      ...group.selection,
      workflow: pathToFileURL(join(scratch, workflowFile)),
    };
    const shardOf = (label) =>
      group.indices.filter((index) =>
        dashboardTestMatch(testDir, `${index}/${group.shards}`, selection).some(
          (pattern) => pattern.test(join(scratch, label)),
        ),
      );
    body({ testDir, selection, shardOf, shards: group.shards });
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

test("a spec in a new E2E folder runs once, in the last E2E shard", () => {
  const added = "e2e/new-area/first.spec.ts";
  withScratchGroup("e2e", { added: [added] }, ({ shardOf, shards }) => {
    assert.deepEqual(shardOf(added), [shards]);
  });
});

test("a new backend spec under a named folder runs once, in the shard naming that folder", () => {
  const added = "dashboard/backend-tests/launches/new-case.spec.ts";
  const naming = ciText
    .split("\n")
    .map((line) =>
      /^ +(\d+): .*dashboard\/backend-tests\/launches\/\*\*/.exec(line),
    )
    .find(Boolean)[1];
  withScratchGroup("dashboard-backend", { added: [added] }, ({ shardOf }) => {
    assert.deepEqual(shardOf(added), [Number(naming)]);
  });
});

test("overlapping E2E patterns fail every shard and the unsplit run before any test is selected, naming one spec and both shards", () => {
  // Shard 1 also names shard 2's first pattern, as `e2e/sessions/**` beside
  // `e2e/sessions/agent-*` would.
  const second = /^ +2: (\S+)/m.exec(
    ciText.slice(ciText.indexOf("\n  e2e:")),
  )[1];
  const overlap = (text) => text.replace(/^( +1: )(e2e\/)/m, `$1${second} $2`);
  withScratchGroup(
    "e2e",
    { edit: overlap },
    ({ testDir, selection, shards }) => {
      const splits = Array.from(
        { length: shards },
        (...[, i]) => `${i + 1}/${shards}`,
      );
      for (const split of [undefined, ...splits])
        for (const select of [dashboardTestMatch, dashboardTestProjects])
          assert.throws(
            () => select(testDir, split, selection),
            (error) =>
              /^FAIL: \.github\/workflows\/ci\.yml: e2e\/\S+\.spec\.ts matches the patterns of shares 1 and 2\.$/.test(
                error.message,
              ),
            String(split),
          );
    },
  );
});

test("a frontend pattern matching no spec fails the configuration naming it", () => {
  const workflowWithRetiredPattern = `jobs:
  dashboard-frontend:
    with:
      shards: "[1, 2]"
      specs: |
        1: dashboard/frontend-tests/retired/**
`;
  withScratchGroup(
    "dashboard-frontend",
    { edit: () => workflowWithRetiredPattern },
    ({ testDir, selection }) => {
      for (const split of [undefined, "1/2", "2/2"])
        assert.throws(
          () => dashboardTestMatch(testDir, split, selection),
          new Error(
            `FAIL: ${workflowFile}: pattern dashboard/frontend-tests/retired/** of share 1 matches no check.`,
          ),
        );
    },
  );
});
