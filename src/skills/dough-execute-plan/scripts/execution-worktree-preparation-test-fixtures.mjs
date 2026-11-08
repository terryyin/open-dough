import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

const exec = promisify(execFile);

export const originInstallMarker = ".origin-install-marker";
export const prepTraceRel = ".prep-trace.jsonl";
export const setupCountRel = ".setup-count";

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

function digestFile(path) {
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

function isInside(parent, child) {
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

export function observePreparation(fixture, result) {
  const after = integritySnapshot(fixture.origin, fixture.execution);
  return {
    ok: result.ok,
    reused: result.reused === true,
    executionCheckout: fixture.execution,
    convention: result.convention,
    traces: readTraces(fixture.tracePath),
    invocations: result.invocations,
    report: result.report,
    executionOwnsInstall: executionOwnsInstall(
      fixture.origin,
      fixture.execution,
    ),
    ...integrityUnchanged(fixture.before, after),
  };
}

export function setupTraceCount(tracePath) {
  return readTraces(tracePath).filter((entry) => entry.type === "setup").length;
}

// The locked Node project's own files, byte for byte: a CONTRIBUTING.md naming
// `npm ci` and `npm run prove`, and a local-file dependency whose executable
// is unavailable before setup. `failingInstall` makes that dependency's
// install fail.
function lockedNodeProject({ failingInstall }) {
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

// Disposable locked Node fixture: the declared project's integration
// checkout as the originating checkout, plus a separately located execution
// worktree, a locked local-file dependency whose executable is unavailable
// before `npm ci`, install and command traces, an originating-checkout marker,
// lockfile digests, and a failing-install variant. The lockfile is generated
// install output: the harness commits it after the declared project.
export async function createLockedNodeFixture({
  failingInstall = false,
  directory,
} = {}) {
  const fixture = realpathSync(
    directory ?? mkdtempSync(join(tmpdir(), "execution-worktree-prep-")),
  );
  const { integration: origin } = await materializeRepository(
    makeMe.aRepository
      .withRevision("project", {
        backlog: undefined,
        message: "locked fixture",
        files: lockedNodeProject({ failingInstall }),
      })
      .please(),
    { parent: fixture },
  );
  const execution = join(fixture, "execution");
  const tracePath = join(fixture, "prep-trace.jsonl");
  const env = npmEnv(tracePath);

  await exec("npm", ["install", "--ignore-scripts"], {
    cwd: origin,
    env,
    timeout: 60_000,
  });
  await git(origin, "add", "package-lock.json");
  await git(origin, "commit", "-m", "lock fixture dependencies");
  writeFileSync(join(origin, "node_modules", originInstallMarker), "origin\n");
  writeFileSync(join(origin, "origin-marker"), `${fixture}\n`);
  await git(origin, "worktree", "add", "-b", "exec/story", execution);

  return {
    fixture,
    origin,
    execution,
    tracePath,
    env,
    before: integritySnapshot(origin, execution),
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}
