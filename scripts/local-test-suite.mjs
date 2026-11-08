// One full local verification per repository, shared by its linked worktrees.
// Git's compare-and-swap ref update supplies atomic admission and stale-owner
// transfer. Ownership lives outside branches, is never pushed by normal Git
// publication, and needs neither a lock-file reaper race nor platform flock.
import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { constants } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import {
  ancestors,
  living,
  processIdentity,
  retire,
  signal,
  tokenVariable,
} from "./local-test-processes.mjs";

const admissionRef = "refs/dough/local-test-suite";
const ownershipVariable = "DOUGH_LOCAL_SUITE_OWNERS";
// OPEN_DOUGH_TEST_ADMISSION_GATE names a file this call writes once, whole,
// with the owner's record id, when a live owner outside its ancestry blocks
// admission. The call then waits as it always does. It belongs to this call
// alone: the call removes it from the environment so nothing it starts
// inherits it.
const admissionGateVariable = "OPEN_DOUGH_TEST_ADMISSION_GATE";
const held = new Map();

function git(directory, args, input) {
  return spawnSync("git", ["-C", directory, ...args], {
    input,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });
}

function ownerRoot(directory) {
  const result = git(directory, [
    "rev-parse",
    "--path-format=absolute",
    "--git-common-dir",
  ]);
  // Disposable runner fixtures also work outside Git. They have no linked
  // worktrees to coordinate; never borrow the invoking checkout's identity.
  return result.status === 0 ? realpathSync(result.stdout.trim()) : undefined;
}

function readOwner(directory) {
  const ref = git(directory, [
    "rev-parse",
    "--verify",
    "--quiet",
    admissionRef,
  ]);
  if (ref.status !== 0) return undefined;
  const oid = ref.stdout.trim();
  const blob = git(directory, ["cat-file", "blob", oid]);
  if (blob.status !== 0) throw new Error("Cannot read local test-suite owner.");
  const owner = JSON.parse(blob.stdout);
  if (
    !Number.isSafeInteger(owner.pid) ||
    typeof owner.started !== "string" ||
    !Array.isArray(owner.tokens) ||
    owner.tokens.some(
      (token) => typeof token !== "string" || !/^[a-f0-9-]{36}$/.test(token),
    )
  )
    throw new Error(
      "Invalid local test-suite owner; admission was left intact.",
    );
  return { ...owner, oid };
}

function replaceOwner(directory, owner, previous) {
  const object = git(
    directory,
    ["hash-object", "-w", "--stdin"],
    JSON.stringify(owner),
  );
  if (object.status !== 0)
    throw new Error("Cannot write local test-suite owner.");
  const oid = object.stdout.trim();
  const update = git(directory, [
    "update-ref",
    admissionRef,
    oid,
    previous ?? "0".repeat(oid.length),
  ]);
  if (update.status !== 0) {
    // Only a changed owner is a competing admission. Permissions, hooks and
    // other Git failures are errors, not a reason to wait forever.
    if (
      readOwner(directory)?.oid !== previous ||
      /reference already exists|but expected|File exists/.test(update.stderr)
    )
      return undefined;
    throw new Error(
      `Cannot update local test-suite admission: ${update.stderr.trim()}`,
    );
  }
  return oid;
}

function inheritedOwners() {
  try {
    return JSON.parse(
      Buffer.from(process.env[ownershipVariable] ?? "", "base64url").toString(),
    );
  } catch {
    return {};
  }
}

export async function acquireLocalSuite(directory, { signal: aborted } = {}) {
  let admissionGate = process.env[admissionGateVariable];
  delete process.env[admissionGateVariable];
  if (process.env["CI"]) return async () => {};
  const root = ownerRoot(directory);
  if (root === undefined || held.has(root)) return async () => {};
  const inherited = inheritedOwners();
  const lineage = ancestors();
  const token = randomUUID();
  const mine = {
    pid: process.pid,
    started: processIdentity(process.pid),
    tokens: [token],
  };
  let oid;
  for (;;) {
    aborted?.throwIfAborted();
    const previous = readOwner(directory);
    if (
      previous &&
      inherited[root] === previous.tokens[0] &&
      living(previous) &&
      lineage.has(previous.pid)
    )
      return async () => {};
    if (!previous || !living(previous)) {
      // The new live owner first inherits every predecessor token. If it dies
      // during retirement, its successor can finish the same cleanup.
      const retiring = {
        ...mine,
        tokens: [token, ...(previous?.tokens ?? [])],
      };
      oid = replaceOwner(directory, retiring, previous?.oid);
      if (oid !== undefined) {
        await retire(previous?.tokens ?? []);
        oid = replaceOwner(directory, mine, oid);
        if (oid === undefined)
          throw new Error(
            "Local test-suite ownership changed during admission.",
          );
        break;
      }
    } else if (admissionGate) {
      writeFileSync(`${admissionGate}.partial`, previous.oid);
      renameSync(`${admissionGate}.partial`, admissionGate);
      admissionGate = undefined;
    }
    await delay(250, undefined, { signal: aborted });
  }
  process.env[ownershipVariable] = Buffer.from(
    JSON.stringify({ ...inherited, [root]: token }),
  ).toString("base64url");
  process.env[tokenVariable] = [
    ...new Set([...(process.env[tokenVariable]?.split(",") ?? []), token]),
  ].join(",");
  const release = async () => {
    if (!held.has(root)) return;
    await retire([token]);
    const result = git(directory, ["update-ref", "-d", admissionRef, oid]);
    if (result.status !== 0)
      throw new Error("Could not release local test-suite admission.");
    held.delete(root);
  };
  held.set(root, release);
  return release;
}

export async function releaseLocalSuites() {
  for (const release of held.values()) await release();
}

async function repositorySuite([directory, cwd, command, ...args]) {
  const stop = new AbortController();
  let child, interrupted;
  const handlers = new Map(
    ["SIGINT", "SIGTERM"].map((name) => [
      name,
      () => {
        interrupted ??= name;
        if (child?.pid) signal(child.pid, name);
        else stop.abort();
      },
    ]),
  );
  for (const [name, handler] of handlers) process.on(name, handler);
  let release;
  try {
    release = await acquireLocalSuite(directory, { signal: stop.signal });
    stop.signal.throwIfAborted();
    child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        DOUGH_LOCAL_SUITE_RUNNER_PID: String(process.pid),
      },
    });
    const result = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", (code, endedBy) => resolve({ code, endedBy }));
    });
    process.exitCode = result.code ?? 128 + constants.signals[result.endedBy];
  } catch (error) {
    if (!interrupted) throw error;
  } finally {
    await release?.();
    for (const [name, handler] of handlers) process.off(name, handler);
    if (interrupted) process.exitCode = interrupted === "SIGINT" ? 130 : 143;
  }
}

if (
  process.argv[1] &&
  existsSync(process.argv[1]) &&
  realpathSync(path.resolve(process.argv[1])) === fileURLToPath(import.meta.url)
) {
  const [mode, ...args] = process.argv.slice(2);
  if (mode !== "repository")
    throw new Error("Expected local test-suite repository command.");
  await repositorySuite(args);
}
