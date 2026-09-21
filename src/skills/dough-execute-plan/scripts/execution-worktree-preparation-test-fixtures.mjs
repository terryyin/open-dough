import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

const originInstallMarker = ".origin-install-marker";
export const prepTraceRel = ".prep-trace.jsonl";
export const setupCountRel = ".setup-count";

export async function git(cwd, ...args) {
  return exec("git", args, { cwd });
}

function digestFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function npmEnv(tracePath) {
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

function writeFixtureProject(origin, { failingInstall }) {
  mkdirSync(join(origin, "packages", "fixture-cli"), { recursive: true });
  mkdirSync(join(origin, "scripts"));
  writeFileSync(
    join(origin, ".gitignore"),
    `node_modules/\n${prepTraceRel}\n${setupCountRel}\n`,
  );
  writeFileSync(
    join(origin, "CONTRIBUTING.md"),
    ["Locked setup: `npm ci`", "Applicable command: `npm run prove`", ""].join(
      "\n",
    ),
  );
  writeFileSync(
    join(origin, "package.json"),
    `${JSON.stringify(
      {
        name: "execution-worktree-prep-fixture",
        private: true,
        type: "module",
        dependencies: { "fixture-cli": "file:packages/fixture-cli" },
        scripts: {
          postinstall: "node scripts/trace.mjs setup",
          prove: "node scripts/trace.mjs command && fixture-cli",
        },
      },
      null,
      2,
    )}\n`,
  );
  const localPackage = {
    name: "fixture-cli",
    version: "1.0.0",
    type: "module",
    bin: { "fixture-cli": "./cli.mjs" },
  };
  if (failingInstall) {
    localPackage.scripts = {
      preinstall: 'node -e "process.exit(1)"',
    };
  }
  writeFileSync(
    join(origin, "packages/fixture-cli/package.json"),
    `${JSON.stringify(localPackage, null, 2)}\n`,
  );
  writeFileSync(
    join(origin, "packages/fixture-cli/cli.mjs"),
    '#!/usr/bin/env node\nprocess.stdout.write("fixture-cli-ok\\n");\n',
  );
  writeFileSync(
    join(origin, "scripts/trace.mjs"),
    `import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

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
  );
}

// Disposable locked Node fixture: a Git repository plus a separately located
// execution worktree, a locked local-file dependency whose executable is
// unavailable before `npm ci`, install and command traces, an
// originating-checkout marker, lockfile digests, and a failing-install variant.
export async function createLockedNodeFixture({
  failingInstall = false,
  directory,
} = {}) {
  const fixture = realpathSync(
    directory ?? mkdtempSync(join(tmpdir(), "execution-worktree-prep-")),
  );
  const origin = join(fixture, "origin");
  const execution = join(fixture, "execution");
  const tracePath = join(fixture, "prep-trace.jsonl");
  const env = npmEnv(tracePath);

  mkdirSync(origin);
  await git(origin, "init", "-b", "main");
  await git(origin, "config", "user.name", "Origin Checkout");
  await git(origin, "config", "user.email", "origin@example.test");
  writeFixtureProject(origin, { failingInstall });
  await exec("npm", ["install", "--ignore-scripts"], {
    cwd: origin,
    env,
    timeout: 60_000,
  });
  await git(origin, "add", ".");
  await git(origin, "commit", "-m", "locked fixture");
  writeFileSync(join(origin, "node_modules", originInstallMarker), "origin\n");
  writeFileSync(join(origin, "origin-marker"), `${fixture}\n`);
  await git(origin, "branch", "exec/story");
  await git(origin, "worktree", "add", execution, "exec/story");

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
