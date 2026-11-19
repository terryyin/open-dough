// Each browser test group is its own CI producer: ci.yml gives
// browser-test-group.yml one job per group, whose inputs alone name the
// group's command, settings, shards and root (its outputs and proof entry),
// and that command runs the group's own configuration with the same settings
// prefix and root. Changing one group's shards or settings therefore changes no
// other group's selection or settings. The fragments these producers keep:
// ./ci-proof-declaration.test.mjs; each group's declared shards:
// ./browser-group-shards.test.mjs.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { frontendGroup } from "../../../dashboard/test-support/support/browserTestGroups.mjs";
import { finishFrontendGroup } from "../../../dashboard/test-support/support/frontendOutputs.mjs";
import {
  browserWorkflow,
  locations,
  root,
} from "./ci-proof-action-fixtures.mjs";
import { browserGroupConfigs } from "./browserGroupConfigs.mjs";
import { makeMe } from "./makeMe.mjs";

test("each browser group's job names its own command, settings, root and shards", () => {
  for (const group of browserGroupConfigs) {
    const { inputs, directory, root, shards, prefix } = group;
    // Its job runs the command its runner declares.
    assert.equal(group.command, inputs.command, group.job);
    // Its times file labels specs relative to its configuration's directory.
    assert.match(group.configText, /\n {2}testDir: "\.",\n/, group.config);
    // Job settings agree with the configuration's prefix.
    assert.equal(inputs.settings, prefix, group.config);
    // Its root, holding its outputs and naming its proof entry, is its
    // configuration's root, an Intent location of its own.
    assert.equal(inputs.root, posix.join(directory, root));
    assert.ok(locations.includes(inputs.root), inputs.root);
    assert.deepEqual(
      JSON.parse(inputs.shards),
      Array.from({ length: shards }, (...[, index]) => index + 1),
    );
  }
  for (const name of ["group", "command", "settings", "root"])
    assert.equal(
      new Set(browserGroupConfigs.map(({ inputs }) => inputs[name])).size,
      browserGroupConfigs.length,
      `every group has its own ${name}`,
    );
});

test("the frontend times report records mounted durations under runner-relative spec labels", (t) => {
  const directory = fileURLToPath(frontendGroup.directory);
  const specLabel = posix.join(frontendGroup.root, "timed.mounted.spec.ts");
  const temp = mkdtempSync(join(tmpdir(), "frontend-ci-times-"));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const times = join(temp, "times.txt");
  const { run } = makeMe.aDashboardProofRecord
    .from(fileURLToPath(root))
    .please();
  const status = finishFrontendGroup({
    run: {
      ...run,
      rootDir: directory,
      outputDirs: [],
      startedAt: new Date().toISOString(),
    },
    nativeTimes: join(temp, "retained-times.txt"),
    times,
    mounted: {
      status: 0,
      report: {
        testResults: [
          {
            name: join(directory, specLabel),
            status: "passed",
            message: "",
            assertionResults: [
              {
                ancestorTitles: [],
                fullName: "reads the result",
                title: "reads the result",
                status: "passed",
                duration: 1240,
              },
            ],
          },
        ],
      },
    },
  });
  assert.equal(status, 0);
  const rows = readFileSync(times, "utf8").split("\n");
  assert.ok(rows.includes(`1.2\t${specLabel}`), rows.join("\n"));
});

test("the browser test group workflow takes every group-specific value from its caller's inputs", () => {
  // No group's settings prefix, command, root or shard count is
  // declared in the shared workflow, so one group's change reaches no other.
  const declarations = browserWorkflow
    .split("\n")
    .filter((line) => !/^\s*(?:#|description:)/.test(line))
    .join("\n");
  for (const { inputs } of browserGroupConfigs)
    for (const value of [
      inputs.settings,
      inputs.command,
      inputs.root,
      inputs.shards,
    ])
      assert.equal(declarations.includes(value), false, value);
});
