// The native preparation journey's non-bare originating checkout has no
// remote. Its one described revision commits the generated locked Node project
// and lockfile; dependency installation and the sibling worktree stay harness
// operations. Native proof preserves that topology and its command traces.
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
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import {
  git,
  integritySnapshot,
  lockedNodeProject,
  npmEnv,
  originInstallMarker,
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
  await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withCheckoutIdentity({
        name: "Origin Checkout",
        email: "origin@example.test",
      })
      .withRevision("locked fixture", {
        backlog: null,
        files: lockedNodeProject({ failingInstall }),
      })
      .please(),
    { at: origin },
  );
  await exec("npm", ["install", "--ignore-scripts"], {
    cwd: origin,
    env,
    timeout: 60_000,
  });
  // The generated lock and npm's executable mode belong to this one private
  // starting revision, before any execution worktree or marker exists.
  await git(origin, "add", ".");
  await git(origin, "commit", "--amend", "--no-edit");
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
