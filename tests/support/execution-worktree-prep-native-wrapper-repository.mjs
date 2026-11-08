// The worktree-preparation native journey's wrapper-driven repository, built
// exactly as before the shared repository description: a non-bare originating
// checkout with no remote, whose one commit holds the shared wrapper project,
// and a sibling execution worktree. Native evidence depends on this layout and
// on loading no MakeMe, so this builder keeps its own Git setup.
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  artifactPath,
  digestFile,
  git,
  originOnly,
  wrapperProject,
  writeProject,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-project.mjs";

// Disposable wrapper-driven fixture: sibling worktree, CONTRIBUTING names
// `./wrapper prepare` / `./wrapper prove`, machine-level artifact cache
// outside origin and execution, generated output under target/.
export async function createWrapperDrivenFixture({
  missingConvention = false,
  directory,
} = {}) {
  const fixture = realpathSync(
    directory ?? mkdtempSync(join(tmpdir(), "execution-worktree-wrapper-")),
  );
  const origin = join(fixture, "origin");
  const execution = join(fixture, "execution");
  const artifactCache = join(fixture, "artifact-cache");
  const tracePath = join(fixture, "prep-trace.jsonl");
  const env = {
    ...process.env,
    PREP_TRACE: tracePath,
    ARTIFACT_CACHE: artifactCache,
  };

  mkdirSync(origin);
  mkdirSync(join(artifactCache, "repository"), { recursive: true });
  writeFileSync(artifactPath(artifactCache), "seeded-artifact-v1\n");
  const cacheDigest = digestFile(artifactPath(artifactCache));

  await git(origin, "init", "-b", "main");
  await git(origin, "config", "user.name", "Origin Checkout");
  await git(origin, "config", "user.email", "origin@example.test");
  writeProject(origin, wrapperProject(artifactCache, { missingConvention }), [
    "wrapper",
  ]);
  await git(origin, "add", ".");
  await git(origin, "commit", "-m", "wrapper fixture");
  writeFileSync(join(origin, "origin-marker"), `${fixture}\n`);
  mkdirSync(join(origin, "target"), { recursive: true });
  writeFileSync(join(origin, "target", originOnly), "origin-generated\n");
  await git(origin, "branch", "exec/story");
  await git(origin, "worktree", "add", execution, "exec/story");

  return {
    fixture,
    origin,
    execution,
    artifactCache,
    tracePath,
    env,
    cacheDigest,
    originMarkerDigest: digestFile(join(origin, "origin-marker")),
    cleanup: () => rmSync(fixture, { recursive: true, force: true }),
  };
}
