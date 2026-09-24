import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { git } from "./publication-test-fixtures.mjs";
import {
  agentIdentity,
  agentProfileDirectory,
  renderAgentProfile,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const startCli = fileURLToPath(
  new URL("./execution-start.mjs", import.meta.url),
);

export function startProcess(
  trunk,
  name,
  identity,
  extra = [],
  env = process.env,
) {
  const workspace = join(trunk.fixture, `real-${name}`);
  const args = [
    startCli,
    "start",
    "--integration",
    trunk.integration,
    "--workspace",
    workspace,
    "--branch",
    `exec/${name}`,
    "--identity",
    identity,
    "--publisher-id",
    `publisher-${name}`,
    "--mode",
    name === "b" ? "story-branch" : "trunk",
    "--remote",
    "origin",
    "--target",
    "main",
    "--push-authorized",
    "--workspace-authorized",
    ...extra,
  ];
  const child = spawn(process.execPath, args, { env });
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (data) => {
    stdout += data;
  });
  child.stderr.on("data", (data) => {
    stderr += data;
  });
  const result = new Promise((resolve) =>
    child.on("close", (code) => {
      resolve({
        code,
        receipt: stdout ? JSON.parse(stdout) : null,
        stderr,
        workspace,
      });
    }),
  );
  return { child, result, workspace };
}

export async function awaitFile(path) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (existsSync(path)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`timed out waiting for ${path}`);
}

// Runs `script` before every push from the trunk's integration checkout.
async function installPrePush(trunk, script) {
  const hooks = join(trunk.fixture, "hooks");
  mkdirSync(hooks);
  writeFileSync(join(hooks, "pre-push"), `#!/bin/sh\n${script}`, {
    mode: 0o755,
  });
  await git(trunk.integration, "config", "core.hooksPath", hooks);
}

// The first push attempt fails before reaching the remote; later ones pass.
export async function interruptFirstPush(trunk) {
  const marker = join(trunk.fixture, "push-blocked");
  await installPrePush(
    trunk,
    `if [ ! -e '${marker}' ]; then touch '${marker}'; echo 'transport interrupted' >&2; exit 1; fi\n`,
  );
}

export async function holdFirstPush(trunk, name = "a") {
  const arrived = join(trunk.fixture, "push-arrived");
  const released = join(trunk.fixture, "push-released");
  await installPrePush(
    trunk,
    `if [ "$(git branch --show-current)" = exec/${name} ]; then\n  touch '${arrived}'\n  while [ ! -e '${released}' ]; do sleep 0.05; done\nfi\n`,
  );
  return {
    arrived,
    release: () => {
      if (existsSync(trunk.fixture)) writeFileSync(released, "go\n");
    },
  };
}

export async function advanceRemote(trunk, file, text = "advance\n") {
  writeFileSync(join(trunk.integration, file), text);
  await git(trunk.integration, "add", file);
  await git(trunk.integration, "commit", "-m", `advance ${file}`);
  await git(trunk.integration, "push", "origin", "HEAD:refs/heads/main");
}

// Flags that resume a retained claim from its recorded start.
export function resumeArgs({ startingRevision, candidateSha }) {
  return [
    "--starting-revision",
    startingRevision,
    "--candidate-sha",
    candidateSha,
  ];
}

// Trunk directory of the queued trunk's backlog, and of the agent profiles
// published beside it.
const planningDirectory = ".planning";
export const profileDirectory = `${planningDirectory}/${agentProfileDirectory}`;

// Agent profile paths published on the workspace's remote trunk.
export async function remoteProfiles(workspace) {
  const listed = await git(
    workspace,
    "ls-tree",
    "--name-only",
    "origin/main",
    "--",
    `${profileDirectory}/`,
  );
  return listed.stdout.trim().split("\n");
}

// Trunk path of the named rotation agent's profile.
export function profilePath(name) {
  return `${planningDirectory}/${agentIdentity(name).path}`;
}

// Publishes one trunk commit per named profile, added in the order given, each
// holding `identity`.
export async function publishProfiles(trunk, names, identity) {
  mkdirSync(join(trunk.integration, profileDirectory), { recursive: true });
  for (const name of names) {
    writeFileSync(
      join(trunk.integration, profilePath(name)),
      renderAgentProfile({
        name,
        identity,
        mode: "trunk",
        branch: "origin/main",
      }),
    );
    await git(trunk.integration, "add", profilePath(name));
    await git(trunk.integration, "commit", "--quiet", "-m", `hold ${name}`);
    await git(trunk.integration, "push", "--quiet", "origin", "HEAD:main");
  }
}

// Remote trunk holds the named agent's profile for `identity`, and the commit
// that added it is authored by that agent.
export async function assertPublishedAgent(workspace, name, identity) {
  const { agent, email } = agentIdentity(name);
  const path = profilePath(name);
  const profile = JSON.parse(
    (await git(workspace, "show", `origin/main:${path}`)).stdout,
  );
  assert.equal(profile.agent, agent);
  assert.equal(profile.identity, identity);
  const log = await git(
    workspace,
    "log",
    "--format=%an <%ae>",
    "origin/main",
    "--",
    path,
  );
  assert.equal(log.stdout.trim(), `${agent} <${email}>`);
}
