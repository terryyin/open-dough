#!/usr/bin/env node
// Merge Open Dough CI host hook fragments into project settings.
// Identifies managed entries by native event and exact command from the
// authoritative fragments. Empty/absent maps and exact managed maps are
// accepted; other nonempty maps refuse with unsupported-existing-hooks.
import {
  readFileSync,
  writeFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

const HOSTS = [
  {
    id: "cursor",
    relativePath: ".cursor/hooks.json",
    fragmentName: "cursor-hooks.json",
  },
  {
    id: "claude",
    relativePath: ".claude/settings.json",
    fragmentName: "claude-hooks.json",
  },
];

function usage() {
  console.error(
    "Usage: open-dough-register-hooks.mjs <preflight|apply> <target> <source-dir>",
  );
  process.exit(1);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function readJsonFile(path) {
  const text = readFileSync(path, "utf8");
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error(
      `malformed-hooks-settings: ${path} is not valid JSON.`,
    );
    error.code = "malformed-hooks-settings";
    throw error;
  }
}

function loadFragment(sourceDir, fragmentName) {
  const path = join(
    sourceDir,
    "src/skills/dough-execute-plan/assets",
    fragmentName,
  );
  if (!existsSync(path)) {
    throw new Error(`Client payload is incomplete: missing ${fragmentName}`);
  }
  return readJsonFile(path);
}

function isSafePath(targetRoot, relativePath) {
  const parts = relativePath.split("/");
  let current = targetRoot;
  for (let index = 0; index < parts.length; index += 1) {
    current = join(current, parts[index]);
    if (!existsSync(current)) {
      continue;
    }
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      return {
        ok: false,
        message: `unsafe-hooks-destination: ${relativePath} uses a symlink at ${current}.`,
      };
    }
    const isLast = index === parts.length - 1;
    if (isLast) {
      if (!stat.isFile()) {
        return {
          ok: false,
          message: `unsafe-hooks-destination: expected a regular file at ${current}.`,
        };
      }
    } else if (!stat.isDirectory()) {
      return {
        ok: false,
        message: `unsafe-hooks-destination: expected a directory at ${current}.`,
      };
    }
  }
  return { ok: true };
}

function handlerCount(hooks) {
  if (hooks === null || hooks === undefined) {
    return 0;
  }
  if (typeof hooks !== "object" || Array.isArray(hooks)) {
    return -1;
  }
  let count = 0;
  for (const value of Object.values(hooks)) {
    if (!Array.isArray(value)) {
      return -1;
    }
    count += value.length;
  }
  return count;
}

function classifyHooks(existingDoc, fragment) {
  if (existingDoc === null || existingDoc === undefined) {
    return "empty";
  }
  if (typeof existingDoc !== "object" || Array.isArray(existingDoc)) {
    return "unsupported";
  }
  const existingHooks = existingDoc.hooks;
  if (existingHooks === undefined) {
    return "empty";
  }
  const count = handlerCount(existingHooks);
  if (count < 0) {
    return "unsupported";
  }
  if (count === 0) {
    return "empty";
  }
  if (deepEqual(existingHooks, fragment.hooks)) {
    return "exact";
  }
  return "unsupported";
}

function mergeDocument(existingDoc, fragment, hostId) {
  const base =
    existingDoc &&
    typeof existingDoc === "object" &&
    !Array.isArray(existingDoc)
      ? { ...existingDoc }
      : {};
  base.hooks = structuredClone(fragment.hooks);
  if (
    hostId === "cursor" &&
    fragment.version !== undefined &&
    base.version === undefined
  ) {
    base.version = fragment.version;
  }
  return base;
}

function planHost(targetRoot, sourceDir, host) {
  const absolutePath = join(targetRoot, host.relativePath);
  const safety = isSafePath(targetRoot, host.relativePath);
  if (!safety.ok) {
    return { host, error: safety.message, code: "unsafe-hooks-destination" };
  }
  const fragment = loadFragment(sourceDir, host.fragmentName);
  let existingDoc = null;
  if (existsSync(absolutePath)) {
    existingDoc = readJsonFile(absolutePath);
  }
  const classification = classifyHooks(existingDoc, fragment);
  if (classification === "unsupported") {
    return {
      host,
      error: `unsupported-existing-hooks: ${host.relativePath} already has hook entries; automatic merge of nonempty maps is not supported yet.`,
      code: "unsupported-existing-hooks",
    };
  }
  if (classification === "exact") {
    return {
      host,
      absolutePath,
      action: "skip",
      nextDoc: existingDoc,
    };
  }
  const nextDoc = mergeDocument(existingDoc, fragment, host.id);
  const previousText = existsSync(absolutePath)
    ? readFileSync(absolutePath, "utf8")
    : null;
  const nextText = `${JSON.stringify(nextDoc, null, 2)}\n`;
  if (previousText === nextText) {
    return { host, absolutePath, action: "skip", nextDoc };
  }
  return {
    host,
    absolutePath,
    action: "write",
    nextDoc,
    nextText,
  };
}

function planAll(targetRoot, sourceDir) {
  const plans = [];
  for (const host of HOSTS) {
    try {
      const plan = planHost(targetRoot, sourceDir, host);
      if (plan.error) {
        return { error: plan.error, code: plan.code };
      }
      plans.push(plan);
    } catch (error) {
      return {
        error: error.message,
        code: error.code || "hooks-registration-error",
      };
    }
  }
  return { plans };
}

function preflight(targetRoot, sourceDir) {
  const result = planAll(targetRoot, sourceDir);
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
}

function apply(targetRoot, sourceDir) {
  const result = planAll(targetRoot, sourceDir);
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  const written = [];
  for (const plan of result.plans) {
    if (plan.action === "skip") {
      continue;
    }
    try {
      mkdirSync(dirname(plan.absolutePath), { recursive: true });
      writeFileSync(plan.absolutePath, plan.nextText, "utf8");
    } catch (error) {
      console.error(
        `hooks-registration-failed: could not write ${plan.host.relativePath}: ${error.message}`,
      );
      if (written.length > 0) {
        console.error(
          "Installed files may be incomplete. Hook registration did not finish.",
        );
      }
      process.exit(1);
    }
    written.push(plan.host.relativePath);
    console.log(
      `hooks: registered Open Dough entries in ${plan.host.relativePath}.`,
    );
  }
  if (written.length === 0) {
    console.log(
      "hooks: both host registrations already current; left unwritten.",
    );
  }
}

const command = process.argv[2];
const targetArg = process.argv[3];
const sourceArg = process.argv[4];
if (!command || !targetArg || !sourceArg) {
  usage();
}
if (command !== "preflight" && command !== "apply") {
  usage();
}

const targetRoot = resolve(targetArg);
const sourceDir = resolve(sourceArg);

if (command === "preflight") {
  preflight(targetRoot, sourceDir);
} else {
  apply(targetRoot, sourceDir);
}
