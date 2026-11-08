// The worktree-preparation native journey's locked Node repository, built
// exactly as before the shared repository description: a non-bare originating
// checkout with no remote, whose one commit holds the project and its
// lockfile, and a sibling execution worktree. Native evidence depends on this
// layout, so this builder keeps its own Git setup; non-native tests use the
// described builder in the shared preparation fixtures.
import { execFile } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import {
  git,
  integritySnapshot,
  npmEnv,
  originInstallMarker,
  prepTraceRel,
  setupCountRel,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-test-fixtures.mjs";

const exec = promisify(execFile);

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
