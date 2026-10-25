// Real deployed fresh-entry fixture. Each test owns its repository, hook,
// operation log, remote observations, and cleanup.
import assert from "node:assert/strict";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
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
  const state = { before: await revParse(workspace, "HEAD") };
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
      args: additionalArgs = [],
      env = fixture.env,
      filtered = false,
      commitMessage = "Guarded work\n\nCo-Authored-By: Model <model@example.test>\n",
    } = {},
  ) => {
    const config = join(fixture.fixture, "preparation.json");
    const message = join(fixture.fixture, "message.txt");
    writeFileSync(config, JSON.stringify(p));
    writeFileSync(message, commitMessage);
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
      ...additionalArgs,
    ];
    const result = await (
      filtered
        ? exec(
            "/bin/sh",
            ["-c", '"$@" | cat', "fresh-filter", process.execPath, ...args],
            { cwd: workspace, env },
          )
        : exec(process.execPath, args, { cwd: workspace, env })
    ).catch((error) => error);
    assert.equal(result.stderr, "");
    const delivered = JSON.parse(result.stdout.trim().split("\n").at(-1));
    fixture.stopAtTeardown(delivered.observation?.directory);
    return { code: result.code ?? 0, result: delivered };
  };
  const withheld = async ({ hookCalled = false } = {}) => {
    assert.equal(await revParse(workspace, "HEAD"), state.before);
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
    get before() {
      return state.before;
    },
    // Commits the checkout's own plan as preparation landing does before
    // Take, without the delivery hook, so it becomes the unchanged base.
    async commitPlan(text) {
      writeFileSync(join(workspace, "PLAN.md"), text);
      await git(workspace, "add", "PLAN.md");
      await git(workspace, "commit", "--quiet", "--no-verify", "-m", "Plan");
      state.before = await revParse(workspace, "HEAD");
    },
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

// Planned work whose committed plan has slices 1–4 planned; the coordinator's
// own accepted-proof edit is already in the working plan before invocation.
export const acceptedProof = "\n## Accepted proof\n\naccepted proof\n";
export async function planned(f, plan = slicePlan("")) {
  await f.commitPlan(plan);
  writeFileSync(join(f.workspace, "PLAN.md"), `${plan}${acceptedProof}`);
  return {
    ...f.preparation,
    kind: "planned",
    plan: { path: "PLAN.md", slice: 4 },
    staging: { ownedPaths: ["work.txt", "PLAN.md"], stagedPaths: [] },
  };
}

export async function freshApi(f, overrides = {}, deliver) {
  const request = {
    ...f.requestBase,
    workspace: f.workspace,
    branch: "exec/story",
    previouslyPublishedBase: f.trunkSha,
    targetRef: "refs/heads/main",
    repo: "owner/project",
    preparation: f.preparation,
    message: "Fresh owned repair",
    ...overrides,
  };
  const module = await import(
    pathToFileURL(join(f.skill, "scripts/execution-increment-delivery.mjs"))
  );
  const result = deliver
    ? await (
        await import(
          pathToFileURL(join(f.skill, "scripts/execution-increment-fresh.mjs"))
        )
      ).prepareAndDeliverFreshIncrement(request, deliver)
    : await module.deliverFreshExecutionIncrement(request);
  // Thrown managed callbacks can leave an unregistered live owner; account for
  // that actual observer as well as an ordinary returned directory at teardown.
  if (existsSync(f.storage))
    for (const name of readdirSync(f.storage).filter((name) =>
      name.startsWith("watch-"),
    ))
      if (existsSync(join(f.storage, name, "worker.json")))
        f.stopAtTeardown(join(f.storage, name));
  return result;
}
