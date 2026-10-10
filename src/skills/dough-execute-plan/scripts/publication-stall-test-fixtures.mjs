// Makes a fixture's Git transport stall at a chosen point. The workspace's
// `origin` becomes `ssh://localhost<remote.git>`, and `core.sshCommand` names a
// stand-in that serves each upload-pack or receive-pack locally, delays first
// when asked, or sleeps instead when the mode selects that call. Remote hooks
// stall a push before acceptance (`pre-receive`) or after it (`post-receive`).
// Every stand-in and hook records its PID; `cleanup` ends any still running.
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { git } from "./publication-git.mjs";

const standInSource = `
import { spawn } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const [state, , request] = process.argv.slice(2);
const match = /^git-(upload-pack|receive-pack) '(.*)'$/.exec(request ?? "");
if (!match) {
  process.stderr.write("stall stand-in: unexpected request " + request + "\\n");
  process.exit(128);
}
const [, service, path] = match;
const log = join(state, "calls.jsonl");
const previous = existsSync(log)
  ? readFileSync(log, "utf8").split("\\n").filter(Boolean).map(JSON.parse)
  : [];
const call = previous.filter((entry) => entry.service === service).length + 1;
const mode = JSON.parse(readFileSync(join(state, "mode.json"), "utf8"));
const stalls =
  mode.stall &&
  (mode.stall.service ?? service) === service &&
  (mode.stall.call ?? call) === call;
appendFileSync(
  log,
  JSON.stringify({ pid: process.pid, service, call, stalled: Boolean(stalls) }) + "\\n",
);
// A fixture removed under a sleeping stand-in ends it.
setInterval(() => existsSync(state) || process.exit(0), 50).unref();
if (stalls) {
  setInterval(() => {}, 60_000);
} else {
  setTimeout(() => {
    const child = spawn("git", [service, path], { stdio: "inherit" });
    child.on("exit", (code, signal) => process.exit(signal ? 128 : code));
  }, mode.delayMs ?? 0);
}
`;

const sleepingHook = (pids) => `#!/bin/sh
echo $$ >> '${pids}'
exec sleep 600
`;

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// Installs the stalling transport on `workspace`'s `remoteName`, served from
// the bare repository `origin`, keeping its state under `fixture`. Calls are
// counted per service from installation, including those any other checkout
// sharing this repository's configuration makes through the remote.
export async function installTransportStall({
  fixture,
  workspace,
  origin,
  remoteName = "origin",
}) {
  const state = join(fixture, "transport-stall");
  mkdirSync(state, { recursive: true });
  const standIn = join(state, "ssh-stand-in.mjs");
  writeFileSync(standIn, standInSource);
  const modePath = join(state, "mode.json");
  const callsPath = join(state, "calls.jsonl");
  const hookPidsPath = join(state, "hook-pids");
  const setMode = (mode) => writeFileSync(modePath, JSON.stringify(mode));
  setMode({});
  const url = `ssh://localhost${origin}`;
  await git(workspace, "remote", "set-url", remoteName, url);
  await git(workspace, "config", "ssh.variant", "simple");
  await git(
    workspace,
    "config",
    "core.sshCommand",
    `'${process.execPath}' '${standIn}' '${state}'`,
  );
  const hookPath = (name) => join(origin, "hooks", name);
  const calls = () =>
    existsSync(callsPath)
      ? readFileSync(callsPath, "utf8")
          .split("\n")
          .filter(Boolean)
          .map((line) => JSON.parse(line))
      : [];
  const hookPids = () =>
    existsSync(hookPidsPath)
      ? readFileSync(hookPidsPath, "utf8")
          .split("\n")
          .filter(Boolean)
          .map(Number)
      : [];
  const installHook = (name) => {
    writeFileSync(hookPath(name), sleepingHook(hookPidsPath));
    chmodSync(hookPath(name), 0o755);
  };
  return {
    // Every transport call answers, each after `delayMs`.
    pass({ delayMs = 0 } = {}) {
      setMode({ delayMs });
    },
    // The selected call sleeps instead of answering: `service`
    // ("upload-pack" or "receive-pack") and its 1-based `call` count, each
    // matching any when omitted. Other calls answer.
    stall({ service, call } = {}) {
      setMode({ stall: { service, call } });
    },
    // A push reaches the remote but stalls before acceptance.
    stallBeforeAcceptance() {
      installHook("pre-receive");
    },
    // A push is accepted, then its answer is lost.
    stallAfterAcceptance() {
      installHook("post-receive");
    },
    removeHooks() {
      rmSync(hookPath("pre-receive"), { force: true });
      rmSync(hookPath("post-receive"), { force: true });
    },
    // Each stand-in invocation: { pid, service, call, stalled }.
    calls,
    hookPids,
    alive,
    async cleanup() {
      for (const pid of [...calls().map((entry) => entry.pid), ...hookPids()]) {
        if (alive(pid)) {
          try {
            process.kill(pid, "SIGKILL");
          } catch {
            // Already gone.
          }
        }
      }
    },
  };
}
