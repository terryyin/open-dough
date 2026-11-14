import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { testEntryRules } from "../src/skills/dough-execute-plan/scripts/test-entry-rules.mjs";
import { sourceEntryOfRepositoryPath } from "../src/skills/dough-makeme/scripts/intent-location-selection.mjs";

test("runner-scheduled tests select MakeMe and retain their syntax hints", async () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const env = { ...process.env, OPEN_DOUGH_TEST_DIR: "Distribution/tests" };
  delete env.OPEN_DOUGH_TEST_SPLIT;
  const jobs = execFileSync("bash", ["scripts/test-jobs.sh"], {
    cwd: root,
    env,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .map((record) => {
      const [kind, path] = record.split("\t");
      return { kind, path };
    })
    .filter(({ path }) => path.startsWith("Distribution/"));
  assert.ok(jobs.length > 0, "the runner must list its test sources");
  const paths = jobs.map(({ path }) => path);
  const selection = await testEntryRules(root, paths);
  assert.equal(selection.status, "resolved");
  assert.deepEqual(
    selection.sources.map(({ path }) => path).sort(),
    [...paths].sort(),
    "the selector must return every listed source",
  );
  assert.deepEqual(
    selection.sources.filter(
      ({ makeMe, pageObjects }) => !makeMe || pageObjects,
    ),
    [],
    "every listed test must select MakeMe with page objects off; failing sources are named below",
  );

  // These are this repository's declarations under proof, not fixture data.
  const settings = JSON.parse(
    readFileSync(
      new URL("../../.planning/open-dough.json", import.meta.url),
      "utf8",
    ),
  );
  const location = settings.intent.locations.find(
    ({ path }) => path === "Distribution",
  );
  assert.equal(location?.label, "Distribution Tests");
  const testJobs = jobs;
  for (const [description, matches] of [
    ["shell", ({ kind }) => kind === "shell"],
    [
      "root Node",
      ({ kind, path }) =>
        kind === "node" &&
        path.startsWith("Distribution/tests/") &&
        !path.slice("Distribution/tests/".length).includes("/"),
    ],
    [
      "support Node",
      ({ kind, path }) =>
        kind === "node" && path.startsWith("Distribution/tests/support/"),
    ],
  ])
    assert.ok(
      testJobs.some(matches),
      `the runner must list a ${description} test`,
    );
  assert.deepEqual(
    testJobs.flatMap(({ kind, path }) => {
      const expected = kind === "shell" ? "shell" : "javascript";
      const actual = sourceEntryOfRepositoryPath(path, location)?.hint;
      return actual === expected ? [] : [{ path, expected, actual }];
    }),
    [],
    "every listed tests source must retain its shell or JavaScript syntax hint",
  );
});
