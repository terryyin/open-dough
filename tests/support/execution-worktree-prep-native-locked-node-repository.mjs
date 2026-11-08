// The worktree-preparation native journey's locked Node repository, built
// exactly as before the shared repository description: a non-bare originating
// checkout with no remote, whose one commit holds the shared locked Node
// project and its lockfile, and a sibling execution worktree. Native evidence
// depends on this layout and on loading no MakeMe, so this builder keeps its
// own Git setup.
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
  lockedNodeProject,
  npmEnv,
  originInstallMarker,
  writeProject,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-project.mjs";

const exec = promisify(execFile);

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
  writeProject(origin, lockedNodeProject({ failingInstall }));
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
