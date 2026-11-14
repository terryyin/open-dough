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
import {
  browserWorkflow,
  locations,
  workflow,
  jobs,
  steps,
} from "./ci-proof-action-fixtures.mjs";
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
      ["e2e", "e2e", "test:e2e", "e2e/playwright.config.ts", true, 5],
      [
        "dashboard-integrated",
        "dashboard-integrated",
        "test:dashboard:integrated",
        "dashboard/integrated.playwright.config.ts",
        true,
        4,
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
        3,
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

test("frontend cohosts lint once with complete history, leaving the other groups' checkout depth unchanged", () => {
  assert.equal(jobs(workflow).has("lint"), false);
  assert.deepEqual(
    browserGroupConfigs
      .filter(({ inputs }) => inputs.lint === "true")
      .map(({ job, shards }) => [job, shards]),
    [["dashboard-frontend", 1]],
  );
  assert.match(
    browserWorkflow,
    /\n {6}lint:\n[\s\S]*?\n {8}type: boolean\n {8}default: false\n/,
  );
  // Actions treats numeric zero as falsy. Checkout must receive string zero
  // for lint's repository-history checks and string one for ordinary shards.
  assert.match(
    browserWorkflow,
    /fetch-depth: \$\{\{ inputs\.lint && '0' \|\| '1' \}\}/,
  );
});

test("Node diagnostics name only actual acquisition failures in each job, never skipped setup after checkout failed", () => {
  for (const [job, dependencies] of [
    ["distribution-tests", ["node", "npm-cache"]],
    ["ci-proof", ["node"]],
  ]) {
    const diagnostic = steps(jobs(workflow).get(job)).find((step) =>
      step.startsWith("      - name: Diagnose Node acquisition failure\n"),
    );
    const guard = /\n {8}if: (.+)/.exec(diagnostic)?.[1];
    assert.match(guard, /^failure\(\) && /, job);
    assert.doesNotMatch(guard, /skipped|!=|success/, job);
    assert.deepEqual(
      [...guard.matchAll(/steps\.([\w-]+)\.outcome == 'failure'/g)]
        .map(([, id]) => id)
        .sort(),
      dependencies,
      job,
    );
  }
});

test("cohosted checks depend only on their own prerequisites and all run before the browser deadline can consume the tail", () => {
  const shardSteps = steps(jobs(browserWorkflow).get("shard"));
  const byName = (name) => {
    const step = shardSteps.find((text) =>
      text.startsWith(`      - name: ${name}\n`),
    );
    assert.ok(step, name);
    return step;
  };
  const guardOf = (name) => {
    const guard = /\n {8}if: (.+)/.exec(byName(name))?.[1];
    assert.ok(
      guard?.includes("!cancelled()"),
      `${name} survives another check's failure`,
    );
    assert.doesNotMatch(guard, /success\(\)|failure\(\)/, name);
    return guard;
  };
  // Independent outcomes may share npm, but must not gate on one another.
  // Every prerequisite below must also be an actual named workflow step.
  for (const [name, dependencies] of [
    ["Install shell lint tools", ["npm"]],
    ["Cache Playwright Chromium", ["npm"]],
    ["Install Playwright Chromium", ["npm"]],
    ["Run lint", ["lint-tools", "npm"]],
    ["Type-check the dashboard", ["npm"]],
    ["Run the group's browser tests", ["browser", "npm"]],
  ]) {
    const guard = guardOf(name);
    assert.doesNotMatch(guard, /\|\||!=/, `${name} requires all prerequisites`);
    assert.deepEqual(
      [...guard.matchAll(/steps\.([\w-]+)\.outcome == 'success'/g)]
        .map(([, id]) => id)
        .sort(),
      dependencies,
      name,
    );
    assert.equal(
      [...guard.matchAll(/steps\.([\w-]+)\.outcome/g)].length,
      dependencies.length,
      `${name} has no additional failed-outcome dependency`,
    );
    for (const id of dependencies) {
      const owners = shardSteps.filter((step) =>
        step.includes(`\n        id: ${id}\n`),
      );
      assert.equal(owners.length, 1, id);
      assert.ok(
        shardSteps.indexOf(owners[0]) < shardSteps.indexOf(byName(name)),
        id,
      );
    }
    assert.equal(
      guard.includes("inputs.lint"),
      [
        "Install shell lint tools",
        "Run lint",
        "Type-check the dashboard",
      ].includes(name),
      `${name} is optional only when it belongs to lint`,
    );
  }
  assert.match(
    guardOf("Use a clean browser directory after cache failure"),
    /steps\.playwright-cache\.outcome == 'failure'/,
  );
  assert.match(
    guardOf("Diagnose lint tool acquisition failure"),
    /steps\.lint-tools\.outcome == 'failure'/,
  );
  const position = (name) => shardSteps.indexOf(byName(name));
  assert.ok(position("Install shell lint tools") < position("Run lint"));
  assert.ok(
    position("Install shell lint tools") <
      position("Run the group's browser tests"),
  );
  for (const name of ["Run lint", "Type-check the dashboard"])
    assert.ok(position(name) < position("Run the group's browser tests"), name);
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
