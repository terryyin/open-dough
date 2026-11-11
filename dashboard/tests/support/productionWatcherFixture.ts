import { mkdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { ciWorkflowPath } from "../../server/productionQualification.mjs";
import { projectConfigurationFile } from "./projectConfiguration.ts";
import { localPublishedMainFixture } from "./publishedMainFixture.ts";
import { repoRoot } from "./repositoryRoot.ts";

const watcherSource = [
  "scripts/watch-dashboard.mjs",
  "dashboard/server/chosenPort.mjs",
  "dashboard/server/production*.mjs",
  "src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.mjs",
];
const watchScript = "node scripts/watch-dashboard.mjs";

export function unpublishedWatcherFixture() {
  return watcherFixture({
    "package.json": JSON.stringify({
      scripts: { "watch:dashboard": watchScript },
    }),
  });
}

export async function productionFailureFixture() {
  const vite = shellArgument(
    path.join(repoRoot, "node_modules/vite/bin/vite.js"),
  );
  const config = shellArgument(
    path.join(repoRoot, "dashboard/tests/support/productionWatcherVite.mts"),
  );
  const viteOptions = `dashboard --configLoader runner --config ${config}`;
  const name = "watcher-deployment-fixture";
  const fixture = await watcherFixture({
    [ciWorkflowPath]: "on:\n  push:\n",
    "dashboard/index.html": "<!doctype html><title>Initial</title>",
    "package.json": JSON.stringify({
      name,
      scripts: {
        "watch:dashboard": watchScript,
        "build:dashboard": `node ${vite} build ${viteOptions}`,
        "preview:dashboard": `node ${vite} preview ${viteOptions}`,
      },
    }),
    "package-lock.json": JSON.stringify({
      name,
      lockfileVersion: 3,
      packages: { "": { name } },
    }),
  });
  try {
    const configuration = projectConfigurationFile(fixture.home, "production");
    await mkdir(path.dirname(configuration), { recursive: true });
    await writeFile(configuration, "[]");
    // Use the installed runtime for the watcher-owned runner. Each deployment
    // still builds and serves its own published source in an isolated checkout.
    const runner = "dashboard/server/hosts/cursor/runnerProcess.ts";
    const runnerEntry = path.join(fixture.development, runner);
    await mkdir(path.dirname(runnerEntry), { recursive: true });
    await symlink(path.join(repoRoot, runner), runnerEntry);
    await symlink(
      path.join(repoRoot, "node_modules"),
      path.join(fixture.development, "node_modules"),
    );
    return fixture;
  } catch (error) {
    await fixture.cleanup();
    throw error;
  }
}

async function watcherFixture(files: Record<string, string>) {
  const starting = makeMe.aRepository
    .withRevision("Watcher source", { backlog: null, files })
    .please().revisions[0];
  const fixture = await localPublishedMainFixture(watcherSource);
  try {
    await fixture.commit(starting.files ?? {}, starting.name);
    return fixture;
  } catch (error) {
    await fixture.cleanup();
    throw error;
  }
}

function shellArgument(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
