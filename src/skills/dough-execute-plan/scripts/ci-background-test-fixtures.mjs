// Installed command/hook proof with a substitute live interactive host process,
// real accepted local Git publication, detached observer, and controlled provider.
import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { once } from "node:events";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { setTimeout as pause } from "node:timers/promises";
import {
  createManagedFixture,
  git,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  deliverThroughCli,
  claudeHookInput,
} from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";

const exec = promisify(execFile);
const hostSource = `
  const { execFile } = require('node:child_process');
  process.title = process.env.HOST_TITLE || 'claude';
  process.send('ready');
  process.on('message', ({ args, env }) => execFile(process.execPath, args,
    { env, maxBuffer: 4194304 }, (error, stdout, stderr) =>
      process.send({ code: error?.code ?? 0, stdout, stderr })));
`;
export async function backgroundFixture(
  t,
  { mode = "story-branch", title = "claude" } = {},
) {
  const fixture = await createManagedFixture({ platforms: [".claude"] });
  t.after(fixture.cleanup);
  const fragment = JSON.parse(
    readFileSync(
      fileURLToPath(new URL("../assets/claude-hooks.json", import.meta.url)),
      "utf8",
    ),
  );
  writeFileSync(
    join(fixture.execution, ".claude/settings.json"),
    JSON.stringify(fragment),
  );
  // A previously published base supplies Story Branch managed-publication
  // preconditions; the candidate itself is accepted by the product command.
  if (mode === "story-branch")
    await git(
      fixture.execution,
      "push",
      "origin",
      `${fixture.trunkSha}:refs/heads/exec/story`,
    );
  const workerPoll = `data:text/javascript,${encodeURIComponent(`
    import timers from 'node:timers/promises';
    import { syncBuiltinESMExports } from 'node:module';
    if (process.argv[2] === 'worker') {
      const pause = timers.setTimeout;
      timers.setTimeout = (ms, ...args) => pause(Math.min(ms, 50), ...args);
      syncBuiltinESMExports();
    }
  `)}`;
  const env = {
    ...fixture.env,
    CLAUDE_CODE_SESSION_ID: "background-owner",
    NODE_OPTIONS: [fixture.env.NODE_OPTIONS, `--import=${workerPoll}`]
      .filter(Boolean)
      .join(" "),
  };
  const { delivered, code } = await deliverThroughCli(fixture, {
    base: fixture.trunkSha,
    mode,
    targetRef:
      mode === "story-branch" ? "refs/heads/exec/story" : "refs/heads/main",
    env,
  });
  assert.equal(code, 0);
  assert.equal(delivered.publication, "accepted");
  const directory = delivered.observation.directory;
  const sha = delivered.receipt.sha;
  assert.equal(
    (
      await git(
        fixture.execution,
        "ls-remote",
        "origin",
        delivered.receipt.target,
      )
    ).stdout
      .trim()
      .split(/\s+/)[0],
    sha,
  );
  const host = spawn(process.execPath, ["-e", hostSource], {
    cwd: fixture.execution,
    env: { ...env, HOST_TITLE: title },
    stdio: ["ignore", "ignore", "ignore", "ipc"],
  });
  await once(host, "message");
  t.after(async () => {
    if (host.exitCode !== null || host.signalCode !== null) return;
    const exit = once(host, "exit");
    host.kill();
    await exit;
  });
  const handoff = join(fixture.skill, "scripts/ci-background-handoff.mjs");
  const run = async (
    command,
    requested = sha,
    session = "background-owner",
  ) => {
    const args = [
      handoff,
      command,
      directory,
      ...(command === "handoff" ? [requested] : []),
      "--session-json",
      JSON.stringify({ session_id: session }),
    ];
    if (host.exitCode !== null || host.signalCode !== null) {
      const result = await exec(process.execPath, args, { env }).catch(
        (error) => error,
      );
      return { ...result, code: result.code ?? 0 };
    }
    const result = once(host, "message");
    host.send({ args, env });
    return (await result)[0];
  };
  const receipt = (result) =>
    JSON.parse(result.stdout.slice("CI_BACKGROUND_HANDOFF ".length));
  const hook = ({
    agent_id,
    session_id = "background-owner",
    preload,
    brokenStderr = false,
  } = {}) => {
    const child = spawn(
      process.execPath,
      [
        ...(preload ? ["--import", preload] : []),
        join(fixture.skill, "scripts/ci-background-hook.mjs"),
      ],
      { cwd: fixture.execution, env, stdio: ["pipe", "pipe", "pipe"] },
    );
    let stdout = "",
      stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data;
    });
    if (brokenStderr) child.stderr.destroy();
    else
      child.stderr.on("data", (data) => {
        stderr += data;
      });
    child.stdin.end(
      JSON.stringify({ session_id, agent_id, hook_event_name: "Stop" }),
    );
    const finished = once(child, "exit").then(([code]) => ({
      code,
      stdout,
      stderr,
    }));
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill();
        await finished;
      }
    });
    return { child, finished, output: () => ({ stdout, stderr }) };
  };
  const legacy = async (hook_event_name = "PostToolUse") => {
    const result = exec(
      process.execPath,
      [join(fixture.skill, "scripts/ci-host-hook.mjs"), "claude"],
      { env },
    );
    result.child.stdin.end(
      JSON.stringify(claudeHookInput("background-owner", { hook_event_name })),
    );
    return JSON.parse((await result).stdout);
  };
  const releasePending = () =>
    writeFileSync(
      join(fixture.fixture, "release.json"),
      JSON.stringify({
        attempts: [
          {
            runId: "pending-provider",
            attemptId: "first",
            sha,
            outcome: "pending",
          },
        ],
      }),
    );
  return {
    ...fixture,
    env,
    directory,
    sha,
    host,
    run,
    receipt,
    hook,
    legacy,
    releasePending,
    state: () =>
      JSON.parse(readFileSync(join(directory, "background.json"), "utf8")),
  };
}
export async function waitUntil(predicate) {
  const deadline = Date.now() + 5000;
  while (!predicate()) {
    assert.ok(
      Date.now() < deadline,
      "observable process signal before deadline",
    );
    await pause(10);
  }
}
export const attempted = (fixture) =>
  existsSync(join(fixture.directory, "background-attempt.json"));
