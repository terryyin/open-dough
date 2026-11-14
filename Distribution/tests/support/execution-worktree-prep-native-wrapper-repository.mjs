// The native preparation journey's non-bare originating checkout has no remote.
// Its one described revision holds the generated executable wrapper project.
// The sibling worktree, origin-only output and external artifact cache remain
// harness operations, observed through the actual preparation commands.
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import {
  artifactPath,
  digestFile,
  git,
  originOnly,
  wrapperProject,
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

  await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withCheckoutIdentity({
        name: "Origin Checkout",
        email: "origin@example.test",
      })
      .withRevision("wrapper fixture", {
        backlog: null,
        files: wrapperProject(artifactCache, { missingConvention }),
        executables: ["wrapper"],
      })
      .please(),
    { at: origin },
  );
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
