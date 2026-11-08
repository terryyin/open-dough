// The worktree-preparation native journey's wrapper-driven repository, built
// exactly as before the shared repository description: a non-bare originating
// checkout with no remote, whose one commit holds the wrapper project, and a
// sibling execution worktree. Native evidence depends on this layout, so this
// builder keeps its own Git setup; non-native tests use the described builder
// in the shared wrapper preparation fixtures.
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  git,
  prepTraceRel,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-test-fixtures.mjs";
import {
  artifactName,
  artifactPath,
  digestFile,
  originOnly,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-wrapper-test-fixtures.mjs";

function writeWrapper(origin, artifactCache) {
  writeFileSync(
    join(origin, "wrapper"),
    `#!/bin/sh
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
`,
  );
  chmodSync(join(origin, "wrapper"), 0o755);
}

function writeCheckedInConvention(origin) {
  writeFileSync(join(origin, ".gitignore"), `target/\n${prepTraceRel}\n`);
  writeFileSync(
    join(origin, "CONTRIBUTING.md"),
    [
      "Locked setup: `./wrapper prepare`",
      "Applicable command: `./wrapper prove`",
      "",
    ].join("\n"),
  );
}

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
  writeWrapper(origin, artifactCache);
  if (missingConvention) {
    writeFileSync(
      join(origin, "pom.xml"),
      "<project><!-- decoy; not a recognizer input --></project>\n",
    );
  } else {
    writeCheckedInConvention(origin);
  }
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
