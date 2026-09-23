import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { git } from "./publication-test-fixtures.mjs";

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

export async function holdFirstPush(trunk, name = "a") {
  const hooks = join(trunk.fixture, "hooks");
  const arrived = join(trunk.fixture, "push-arrived");
  const released = join(trunk.fixture, "push-released");
  mkdirSync(hooks);
  writeFileSync(
    join(hooks, "pre-push"),
    `#!/bin/sh\nif [ "$(git branch --show-current)" = exec/${name} ]; then\n  touch '${arrived}'\n  while [ ! -e '${released}' ]; do sleep 0.05; done\nfi\n`,
    { mode: 0o755 },
  );
  await git(trunk.integration, "config", "core.hooksPath", hooks);
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
