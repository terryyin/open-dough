// Each browser test group is its own CI producer: ci.yml gives
// browser-test-group.yml one job per group, whose inputs alone name the
// group's command, settings, shards and root (its outputs and proof entry),
// and that command runs the group's own configuration with the same settings
// prefix and root. Changing one group's shards or settings therefore changes no
// other group's selection or settings. The fragments these producers keep:
// ./ci-proof-declaration.test.mjs; each group's deal:
// ./dashboard-test-files.test.mjs.
import assert from "node:assert/strict";
import { posix } from "node:path";
import test from "node:test";
import { browserWorkflow, locations } from "./ci-proof-action-fixtures.mjs";
import { browserGroupConfigs } from "./browserGroupConfigs.mjs";

test("each browser group's job names its own command, settings, root and shards", () => {
  assert.deepEqual(
    browserGroupConfigs.map(({ job, inputs, config, prefix, shards }) => [
      job,
      inputs.group,
      inputs.command,
      config,
      inputs.settings === prefix,
      shards,
    ]),
    [
      ["e2e", "e2e", "test:e2e", "e2e/playwright.config.ts", true, 6],
      [
        "dashboard-integrated",
        "dashboard-integrated",
        "test:dashboard:integrated",
        "dashboard/integrated.playwright.config.ts",
        true,
        5,
      ],
      [
        "dashboard-frontend",
        "dashboard-frontend",
        "test:dashboard:frontend",
        "dashboard/frontend.playwright.config.ts",
        true,
        1,
      ],
      [
        "dashboard-backend",
        "dashboard-backend",
        "test:dashboard:backend",
        "dashboard/backend.playwright.config.ts",
        true,
        4,
      ],
    ],
  );
  for (const group of browserGroupConfigs) {
    const { inputs, directory, root, shards } = group;
    // Its times file and its duration list label specs alike.
    assert.equal(group.timesRelativeToDeal, true, group.config);
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
  assert.match(
    browserWorkflow,
    /\n {8}shard: \$\{\{ fromJSON\(inputs\.shards\) \}\}\n/,
  );
  assert.match(
    browserWorkflow,
    /\n {10}export "\$\{SETTINGS\}_SPLIT=\$\{SPLIT\}" "\$\{SETTINGS\}_TIMES=\$\{TIMES\}" "\$\{SETTINGS\}_PROOF_RECORD=\$\{PROOF_RECORD\}"\n {10}exec npm run "\$\{COMMAND\}"\n/,
  );
  assert.match(
    browserWorkflow,
    /\n {10}echo "\$\{SETTINGS\}_DEADLINE_MS=\$\(\( started \+ 320000 \)\)" >> "\$GITHUB_ENV"\n/,
  );
  for (const artifact of ["times", "playwright-report"])
    assert.ok(
      browserWorkflow.includes(
        `name: \${{ inputs.group }}-${artifact}-\${{ matrix.shard }}\n`,
      ),
      artifact,
    );
});
