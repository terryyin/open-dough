import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createLockedNodeFixture,
  setupTraceCount,
} from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-test-fixtures.mjs";
import { hostPrepareCheckout } from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-reuse-test-fixtures.mjs";
import { createWrapperDrivenFixture } from "../../src/skills/dough-execute-plan/scripts/execution-worktree-preparation-wrapper-test-fixtures.mjs";

function writeDiscovery(origin) {
  writeFileSync(
    join(origin, "AGENTS.md"),
    "This project uses Open Dough. Follow installed skills under .agents/skills/.\n",
  );
  writeFileSync(
    join(origin, "CLAUDE.md"),
    "@AGENTS.md\nFollow installed skills under .claude/skills/.\n",
  );
}

async function createNativeFixture(kind, directory) {
  if (kind === "wrapper") {
    const fixture = await createWrapperDrivenFixture({ directory });
    writeDiscovery(fixture.origin);
    return {
      kind,
      fixture: fixture.fixture,
      origin: fixture.origin,
      execution: fixture.execution,
      tracePath: fixture.tracePath,
      artifactCache: fixture.artifactCache,
      setupCount: 0,
      wrapperDriven: true,
      originMarkerDigest: fixture.originMarkerDigest,
      cacheDigest: fixture.cacheDigest,
      before: {
        originMarker: fixture.originMarkerDigest,
        originLock: null,
        executionLock: null,
      },
    };
  }

  const fixture = await createLockedNodeFixture({
    failingInstall: kind === "failed-prep",
    directory,
  });
  if (kind === "reuse") {
    await hostPrepareCheckout(fixture.execution, fixture.env);
  }
  writeDiscovery(fixture.origin);
  return {
    kind,
    fixture: fixture.fixture,
    origin: fixture.origin,
    execution: fixture.execution,
    tracePath: fixture.tracePath,
    artifactCache: null,
    setupCount: setupTraceCount(fixture.tracePath),
    wrapperDriven: false,
    before: fixture.before,
  };
}

async function main() {
  const kind = process.argv[2];
  const directory = process.argv[3];
  if (
    kind !== "fresh-node" &&
    kind !== "failed-prep" &&
    kind !== "reuse" &&
    kind !== "wrapper"
  ) {
    throw new Error(`unknown native fixture kind: ${kind}`);
  }
  const created = await createNativeFixture(kind, directory);
  process.stdout.write(`${JSON.stringify(created)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
