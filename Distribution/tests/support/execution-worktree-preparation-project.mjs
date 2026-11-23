// The worktree-preparation projects and their observation helpers, shared by
// the described preparation fixtures and the native journey's own
// repositories. Node built-ins only: the native evidence identity hashes this
// module's import closure.
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { join, sep } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

export const originInstallMarker = ".origin-install-marker";
export const prepTraceRel = ".prep-trace.jsonl";
export const setupCountRel = ".setup-count";
export const originOnly = "origin-only";
const artifactName = "immutable-lib.jar";

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

export function digestFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function npmEnv(tracePath) {
  return {
    ...process.env,
    PREP_TRACE: tracePath,
    npm_config_audit: "false",
    npm_config_fund: "false",
    npm_config_update_notifier: "false",
  };
}

export function isInside(parent, child) {
  const root = realpathSync(parent);
  const path = realpathSync(child);
  return path === root || path.startsWith(root + sep);
}

export function lockfileDigest(checkout) {
  return digestFile(join(checkout, "package-lock.json"));
}

export function readTraces(tracePath) {
  if (!existsSync(tracePath)) return [];
  return readFileSync(tracePath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

export function setupTraceCount(tracePath) {
  return readTraces(tracePath).filter((entry) => entry.type === "setup").length;
}

export function executionOwnsInstall(origin, execution) {
  const installed = join(execution, "node_modules");
  if (!existsSync(installed)) return false;
  if (!isInside(execution, installed)) return false;
  if (existsSync(join(installed, originInstallMarker))) return false;
  const originInstalled = join(origin, "node_modules");
  if (existsSync(originInstalled)) {
    try {
      if (realpathSync(installed) === realpathSync(originInstalled)) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}

export function integritySnapshot(origin, execution) {
  return {
    originMarker: digestFile(join(origin, "origin-marker")),
    originLock: lockfileDigest(origin),
    executionLock: lockfileDigest(execution),
  };
}

export function integrityUnchanged(before, after) {
  return {
    originMarkerUnchanged: before.originMarker === after.originMarker,
    originLockUnchanged: before.originLock === after.originLock,
    executionLockUnchanged: before.executionLock === after.executionLock,
  };
}

// Whether a recorded command runs npm or nix, which a wrapper-driven project
// must not need.
export function usesNpmOrNix(command) {
  return /(?:^|[\s/\\])(?:npm|nix)(?:\s|$)/i.test(command ?? "");
}

export function artifactPath(cacheDir) {
  return join(cacheDir, "repository", artifactName);
}

// The locked Node project's own files, byte for byte: a CONTRIBUTING.md naming
// `npm ci` and `npm run prove`, and a local-file dependency whose executable
// is unavailable before setup. `failingInstall` makes that dependency's
// install fail.
export function lockedNodeProject({ failingInstall }) {
  const localPackage = {
    name: "fixture-cli",
    version: "1.0.0",
    type: "module",
    bin: { "fixture-cli": "./cli.mjs" },
    ...(failingInstall && {
      scripts: { preinstall: 'node -e "process.exit(1)"' },
    }),
  };
  const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
  return {
    ".gitignore": `node_modules/\n${prepTraceRel}\n${setupCountRel}\n`,
    "CONTRIBUTING.md": [
      "Locked setup: `npm ci`",
      "Applicable command: `npm run prove`",
      "",
    ].join("\n"),
    "package.json": json({
      name: "execution-worktree-prep-fixture",
      private: true,
      type: "module",
      dependencies: { "fixture-cli": "file:packages/fixture-cli" },
      scripts: {
        postinstall: "node scripts/trace.mjs setup",
        prove: "node scripts/trace.mjs command && fixture-cli",
      },
    }),
    "packages/fixture-cli/package.json": json(localPackage),
    "packages/fixture-cli/cli.mjs":
      '#!/usr/bin/env node\nprocess.stdout.write("fixture-cli-ok\\n");\n',
    "scripts/trace.mjs": `import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const stream = process.env.PREP_TRACE ?? ${JSON.stringify(prepTraceRel)};
appendFileSync(
  stream,
  \`\${JSON.stringify({ type: process.argv[2], cwd: process.cwd() })}\\n\`,
);
if (process.argv[2] === "setup") {
  const countPath = ${JSON.stringify(setupCountRel)};
  const current = existsSync(countPath)
    ? Number(readFileSync(countPath, "utf8")) || 0
    : 0;
  writeFileSync(countPath, \`\${current + 1}\\n\`);
}
`,
  };
}

// The wrapper project's own files, byte for byte: an executable `wrapper`
// whose baked artifact cache default is `artifactCache`, and either the
// checked-in convention naming it or, with `missingConvention`, only a decoy
// build file.
export function wrapperProject(artifactCache, { missingConvention }) {
  const wrapper = `#!/bin/sh
set -eu
# Setup: ./wrapper prepare
# Command: ./wrapper prove
# Immutable artifacts: ARTIFACT_CACHE (machine-level; baked default)
# Generated output: ./target/ (worktree-local)
PREP_TRACE=\${PREP_TRACE:-${prepTraceRel}}
ARTIFACT_CACHE=\${ARTIFACT_CACHE:-${artifactCache}}
trace() {
  printf '%s\\n' "{\\"type\\":\\"$1\\",\\"cwd\\":\\"$(pwd)\\",\\"cache\\":\\"$ARTIFACT_CACHE\\"}" >> "$PREP_TRACE"
}
artifact="$ARTIFACT_CACHE/repository/${artifactName}"
case "\${1:-}" in
  prepare)
    trace setup
    if [ ! -f "$artifact" ]; then
      echo "missing machine artifact cache" >&2
      exit 1
    fi
    echo "cache-reuse $artifact"
    ;;
  prove)
    trace command
    mkdir -p target
    printf '%s\\n' "built $(cat "$artifact")" > target/built
    echo "wrapper-prove-ok"
    ;;
  *)
    echo "usage: ./wrapper prepare|prove" >&2
    exit 1
    ;;
esac
`;
  if (missingConvention)
    return {
      wrapper,
      "pom.xml": "<project><!-- decoy; not a recognizer input --></project>\n",
    };
  return {
    wrapper,
    ".gitignore": `target/\n${prepTraceRel}\n`,
    "CONTRIBUTING.md": [
      "Locked setup: `./wrapper prepare`",
      "Applicable command: `./wrapper prove`",
      "",
    ].join("\n"),
  };
}
