import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  committedLintFixture,
  toollessEnv,
  write,
} from "./lint-runner-fixture.mjs";
import { makeMe } from "./makeMe.mjs";

const tools = ["eslint", "prettier", "shellcheck", "shfmt"];

async function wholeTreeRun(t, failTool, missingTool) {
  const fixture = await committedLintFixture(
    t,
    makeMe.aRepository
      .withRevision("whole tree", {
        backlog: null,
        files: {
          "src/first.mjs": "export const first = 1;\n",
          "src/second.json": '{ "second": 2 }\n',
          "scripts/first.sh": "#!/bin/sh\nexit 0\n",
          "scripts/second with space.sh": "#!/bin/sh\nexit 0\n",
        },
      })
      .please(),
    { dependencies: false },
  );
  const environment = toollessEnv(t);
  const calls = join(environment.PATH, "calls.jsonl");
  for (const tool of tools) {
    if (tool === missingTool) continue;
    const executable = join(environment.PATH, tool);
    // Substitute only the external tool boundary. The repository's real Git
    // discovery and lint orchestration run unchanged.
    write(
      executable,
      `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
const tool = ${JSON.stringify(tool)};
appendFileSync(process.env.LINT_CALLS, JSON.stringify({ tool, args: process.argv.slice(2) }) + "\\n");
if (process.env.LINT_FAIL_TOOL === tool) {
  console.error(tool + ": deliberate finding");
  process.exitCode = 1;
}
`,
    );
    chmodSync(executable, 0o755);
  }
  const result = spawnSync("node", ["scripts/lint.mjs"], {
    cwd: fixture,
    env: { ...environment, LINT_CALLS: calls, LINT_FAIL_TOOL: failTool ?? "" },
    encoding: "utf8",
  });
  return {
    status: result.status,
    output: result.stdout + result.stderr,
    calls: readFileSync(calls, "utf8").trim().split("\n").map(JSON.parse),
  };
}

test("whole-tree lint retains file coverage and ShellCheck context without restarting shfmt", async (t) => {
  const result = await wholeTreeRun(t);
  assert.equal(result.status, 0, result.output);
  for (const tool of tools) {
    const calls = result.calls.filter((call) => call.tool === tool);
    const files = calls.flatMap(({ args }) =>
      args.slice(args.indexOf("--") + 1),
    );
    if (tool === "shellcheck") {
      assert.deepEqual(
        calls.map(({ args }) => args),
        [
          ["--", "scripts/first.sh"],
          ["--", "scripts/second with space.sh"],
        ],
      );
    } else {
      assert.equal(calls.length, 1, `${tool} must not restart for each source`);
    }
    if (tool === "shellcheck" || tool === "shfmt") {
      assert.deepEqual(files, [
        "scripts/first.sh",
        "scripts/second with space.sh",
      ]);
    } else {
      assert.ok(files.includes("src/first.mjs"), `${tool} checks the script`);
      if (tool === "prettier") {
        assert.ok(
          files.includes("src/second.json"),
          "Prettier checks JSON too",
        );
      }
    }
  }
});

for (const tool of tools) {
  test(`whole-tree lint retains a ${tool} failure while completing all checks`, async (t) => {
    const result = await wholeTreeRun(t, tool);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, new RegExp(`${tool}: deliberate finding`));
    assert.match(result.output, /Lint failed/);
    assert.deepEqual(
      [...new Set(result.calls.map((call) => call.tool))].sort(),
      [...tools].sort(),
    );
  });
}

test("a missing full-tree tool fails with its diagnostic after other checks complete", async (t) => {
  const result = await wholeTreeRun(t, undefined, "eslint");
  assert.equal(result.status, 1, result.output);
  assert.match(result.output, /eslint: not found on PATH[\s\S]*npm ci/);
  assert.deepEqual(
    [...new Set(result.calls.map((call) => call.tool))].sort(),
    ["prettier", "shellcheck", "shfmt"].sort(),
  );
});
