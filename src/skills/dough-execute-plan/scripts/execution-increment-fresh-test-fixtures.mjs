// Real deployed fresh-entry fixture. Each test owns its repository, hook,
// operation log, remote observations, and cleanup.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createManagedFixture } from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  exec,
  git,
  revParse,
  remoteHeads,
} from "./publication-test-fixtures.mjs";
import { slicePlan } from "./story-obligations-test-fixtures.mjs";

const skipped = {
  notRequired: "project context establishes no applicable operation",
};
const nodeCommand = (source, options = {}) => ({
  command: [process.execPath, "-e", source],
  ...options,
});

export async function localFixture(t) {
  const fixture = await createManagedFixture();
  t.after(fixture.cleanup);
  const workspace = fixture.execution;
  const hookLog = join(fixture.fixture, "commit-hook.log");
  const operations = join(fixture.fixture, "operations.log");
  const hook = (
    await git(
      workspace,
      "rev-parse",
      "--path-format=absolute",
      "--git-path",
      "hooks/pre-commit",
    )
  ).stdout.trim();
  writeFileSync(hook, `#!/bin/sh\nprintf 'commit\\n' >> '${hookLog}'\n`, {
    mode: 0o755,
  });
  writeFileSync(join(workspace, "work.txt"), "owned work\n");
  const before = await revParse(workspace, "HEAD");
  const refs = await remoteHeads(fixture.origin);
  const preparation = {
    kind: "quick",
    commit: "git",
    generation: skipped,
    formatting: skipped,
    summary: skipped,
    staging: { ownedPaths: ["work.txt"], stagedPaths: [] },
  };
  const logged = (name, source = "") =>
    nodeCommand(
      `const fs = require('node:fs'); fs.appendFileSync(${JSON.stringify(operations)}, ${JSON.stringify(`${name}\n`)}); ${source}`,
    );
  const fresh = async (
    p = preparation,
    {
      mode = "story-branch",
      branch = "exec/story",
      authority = "local-only",
    } = {},
  ) => {
    const config = join(fixture.fixture, "preparation.json");
    const message = join(fixture.fixture, "message.txt");
    writeFileSync(config, JSON.stringify(p));
    writeFileSync(
      message,
      "Guarded work\n\nCo-Authored-By: Model <model@example.test>\n",
    );
    const args = [
      join(fixture.skill, "scripts/execution-increment-delivery.mjs"),
      "fresh",
      "--workspace",
      workspace,
      "--branch",
      branch,
      "--mode",
      mode,
      "--authority",
      authority,
      "--preparation-file",
      config,
      "--message-file",
      message,
    ];
    const result = await exec(process.execPath, args, {
      cwd: workspace,
      env: fixture.env,
    }).catch((error) => error);
    assert.equal(result.stderr, "");
    return {
      code: result.code ?? 0,
      result: JSON.parse(result.stdout.trim().split("\n").at(-1)),
    };
  };
  const withheld = async ({ hookCalled = false } = {}) => {
    assert.equal(await revParse(workspace, "HEAD"), before);
    assert.equal(existsSync(hookLog), hookCalled);
    assert.equal(await remoteHeads(fixture.origin), refs);
    assert.equal(
      existsSync(fixture.storage),
      false,
      "no observer or registration storage created",
    );
  };
  return {
    ...fixture,
    workspace,
    before,
    refs,
    hook,
    hookLog,
    operations,
    preparation,
    fresh,
    logged,
    withheld,
  };
}

export function planned(
  f,
  source = "const text = fs.readFileSync('PLAN.md', 'utf8'); fs.writeFileSync('PLAN.md', text.replace('### 4. Work 4\\nType: Behavior\\nStatus: planned', '### 4. Work 4\\nType: Behavior\\nStatus: done') + '\\n## Accepted proof\\n\\naccepted proof\\n');",
) {
  writeFileSync(join(f.workspace, "PLAN.md"), slicePlan(""));
  return {
    ...f.preparation,
    kind: "planned",
    plan: {
      path: "PLAN.md",
      slice: 4,
      update: f.logged("plan update", source),
    },
    staging: { ownedPaths: ["work.txt", "PLAN.md"], stagedPaths: [] },
  };
}
