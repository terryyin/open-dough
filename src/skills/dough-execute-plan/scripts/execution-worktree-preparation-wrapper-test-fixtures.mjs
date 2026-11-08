import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import {
  artifactPath,
  digestFile,
  git,
  isInside,
  originOnly,
  readTraces,
  usesNpmOrNix,
  wrapperProject,
} from "./execution-worktree-preparation-project.mjs";

export function observeWrapperPreparation(fixture, result) {
  const generated = join(fixture.execution, "target", "built");
  const copied = existsSync(join(fixture.execution, "target", originOnly));
  const cacheFile = artifactPath(fixture.artifactCache);
  return {
    ok: result.ok,
    reused: result.reused === true,
    wrapperDriven: true,
    executionCheckout: fixture.execution,
    convention: result.convention,
    traces: readTraces(fixture.tracePath),
    invocations: result.invocations,
    report: result.report,
    generatedOutputInWorktree:
      existsSync(generated) && isInside(fixture.execution, generated),
    sharedArtifactCacheOutsideWorktree:
      existsSync(fixture.artifactCache) &&
      !isInside(fixture.execution, fixture.artifactCache) &&
      !isInside(fixture.origin, fixture.artifactCache),
    copiedOriginArtifacts: copied,
    usedNpmOrNix: (result.invocations ?? []).some((entry) =>
      usesNpmOrNix(entry.command),
    ),
    originMarkerUnchanged:
      existsSync(join(fixture.origin, "origin-marker")) &&
      digestFile(join(fixture.origin, "origin-marker")) ===
        fixture.originMarkerDigest,
    cacheDigestUnchanged:
      existsSync(cacheFile) && digestFile(cacheFile) === fixture.cacheDigest,
  };
}

// Disposable wrapper-driven fixture: the declared project's integration
// checkout as the originating checkout, a sibling worktree, CONTRIBUTING names
// `./wrapper prepare` / `./wrapper prove`, machine-level artifact cache
// outside origin and execution, generated output under target/.
export async function createWrapperDrivenFixture({
  missingConvention = false,
  directory,
} = {}) {
  const fixture = realpathSync(
    directory ?? mkdtempSync(join(tmpdir(), "execution-worktree-wrapper-")),
  );
  const execution = join(fixture, "execution");
  const artifactCache = join(fixture, "artifact-cache");
  const tracePath = join(fixture, "prep-trace.jsonl");
  const env = {
    ...process.env,
    PREP_TRACE: tracePath,
    ARTIFACT_CACHE: artifactCache,
  };

  mkdirSync(join(artifactCache, "repository"), { recursive: true });
  writeFileSync(artifactPath(artifactCache), "seeded-artifact-v1\n");
  const cacheDigest = digestFile(artifactPath(artifactCache));

  const { integration: origin } = await materializeRepository(
    makeMe.aRepository
      .withRevision("project", {
        backlog: undefined,
        message: "wrapper fixture",
        files: wrapperProject(artifactCache, { missingConvention }),
        executables: ["wrapper"],
      })
      .please(),
    { parent: fixture },
  );
  writeFileSync(join(origin, "origin-marker"), `${fixture}\n`);
  mkdirSync(join(origin, "target"), { recursive: true });
  writeFileSync(join(origin, "target", originOnly), "origin-generated\n");
  await git(origin, "worktree", "add", "-b", "exec/story", execution);

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
