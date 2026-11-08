import { execFile } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  executionOwnsInstall,
  git,
  integritySnapshot,
  integrityUnchanged,
  lockedNodeProject,
  npmEnv,
  originInstallMarker,
  readTraces,
} from "./execution-worktree-preparation-project.mjs";

const exec = promisify(execFile);

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
