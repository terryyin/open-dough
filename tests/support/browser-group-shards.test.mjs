// Each browser test group's actual specs over the shards its CI job runs
// (./browserGroupConfigs.mjs), dealt by its own duration list
// (dashboard/tests/shards.md): every spec in exactly one shard, a new spec
// previewed as unrecorded, and E2E Test's production chains queued first.
// The deal itself: ./dashboard-test-files.test.mjs.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  dashboardSpecFiles,
  dashboardTestMatch,
  dashboardTestProjects,
} from "../../dashboard/tests/support/testFiles.mjs";
import {
  dealShares,
  formatPreview,
  readDurationList,
} from "../../scripts/share-deal.mjs";
import { browserGroupConfigs } from "./browserGroupConfigs.mjs";

const matched = (patterns, path) =>
  patterns.filter((pattern) => pattern.test(path)).length;

// Each group's configuration directory, own selection and CI shards.
const groups = browserGroupConfigs.map((group) => ({
  ...group,
  testDir: new URL(`../../${group.directory}/`, import.meta.url),
  selection: {
    roots: [group.root],
    splitVariable: `${group.prefix}_SPLIT`,
    durations: group.durations,
  },
  indices: Array.from({ length: group.shards }, (...[, index]) => index + 1),
}));

for (const group of groups)
  test(`${group.job}'s CI shards match every one of its actual specs exactly once, and the preview lists a new spec as unrecorded in its shard`, () => {
    const { testDir, selection, indices, shards } = group;
    const files = dashboardSpecFiles(testDir.pathname, selection.roots);
    assert.ok(files.length > 0);
    const matches = indices.flatMap((index) =>
      dashboardTestMatch(testDir, `${index}/${shards}`, selection),
    );
    assert.equal(matches.length, files.length);
    for (const file of files)
      assert.equal(matched(matches, new URL(file, testDir).pathname), 1, file);
    const { seconds } = readDurationList(
      new URL(selection.durations, testDir).pathname,
    );
    const added = `${group.root}/zz-new.spec.ts`.replace(/^\.\//, "");
    assert.equal(files.includes(added), false);
    const deal = dealShares([...files, added], seconds, shards);
    const receiving = deal.shares.find((share) =>
      share.jobs.some((job) => job.label === added),
    );
    const preview = formatPreview(deal, { listName: selection.durations });
    assert.match(
      preview,
      new RegExp(`^ {2}share ${receiving.index}/${shards} {2}${added}$`, "m"),
    );
    assert.doesNotMatch(preview, /headroom/);
  });

test("the integrated specs keep the feature groups under dashboard/tests", () => {
  const featureGroups = new Set([
    "configuration",
    "stories",
    "launches",
    "sessions",
    "terminals",
    "review",
    "intent",
    "navigation",
    "observation",
    "runtime",
  ]);
  const integrated = groups.find(({ job }) => job === "dashboard-integrated");
  for (const file of dashboardSpecFiles(integrated.testDir.pathname, ["tests"]))
    assert.equal(featureGroups.has(file.split("/")[1]), true, file);
});

test("E2E Test's native projects queue production chains first and partition every shard without omissions or repeats", () => {
  const { testDir, selection, indices, shards } = groups.find(
    ({ job }) => job === "e2e",
  );
  const files = dashboardSpecFiles(testDir.pathname, selection.roots);
  assert.ok(files.some((file) => /production-watcher/.test(file)));
  const allMatches = [];
  for (const index of indices) {
    const projects = dashboardTestProjects(
      testDir,
      `${index}/${shards}`,
      selection,
    );
    assert.deepEqual(
      projects.map((project) => project.name),
      ["chromium-deployments", "chromium"],
    );
    const matches = projects.flatMap((project) => project.testMatch);
    const selected = dashboardTestMatch(
      testDir,
      `${index}/${shards}`,
      selection,
    );
    for (const file of files) {
      const path = new URL(file, testDir).pathname;
      assert.equal(matched(matches, path), matched(selected, path), file);
      const expected = /(?:^|\/)production-watcher(?:-.*)?\.spec\.ts$/.test(
        file,
      )
        ? 0
        : 1;
      if (matched(matches, path)) {
        assert.equal(matched(projects[expected].testMatch, path), 1, file);
      }
    }
    allMatches.push(...matches);
  }
  for (const file of files) {
    assert.equal(matched(allMatches, new URL(file, testDir).pathname), 1, file);
  }
});
