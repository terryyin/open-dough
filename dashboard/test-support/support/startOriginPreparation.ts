// One packed, path-free origin per installation layout and repository
// description, materialized through the shared repository harness with this
// run's working-tree skills installed. Only copies reach a test: Git never
// hardlinks objects or reads alternates, and each checkout names its own bare
// origin.

import { execFile } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { repoRoot } from "./repositoryRoot.ts";
import { requestRunArtifact } from "./runArtifacts.ts";
import {
  nativeStartLayouts,
  type StartOriginLayout,
  type StartRepository,
  withInstallation,
} from "./startOriginInstallation.ts";

export {
  dashboardDeveloper,
  installedStartSkills,
} from "./startOriginInstallation.ts";
export type { StartOriginLayout, StartRepository };

const exec = promisify(execFile);
export const startOriginPreparationVariable =
  "OPEN_DOUGH_START_ORIGIN_PREPARATION";

// The commit each revision name of a prepared origin's description became:
// harness metadata kept beside the bare origin, never a ref in it.
export type StartRevisions = Readonly<Record<string, string>>;
const revisionsFile = "revisions.json";

function keepRevisions(directory: string, revisions: StartRevisions) {
  writeFileSync(path.join(directory, revisionsFile), JSON.stringify(revisions));
}

export function preparedRevisions(directory: string): StartRevisions {
  return JSON.parse(
    readFileSync(path.join(directory, revisionsFile), "utf8"),
  ) as StartRevisions;
}

// The shared descriptions global setup prepares once per layout per run. Any
// description that starts from one of their first revisions adds its later
// revisions to that prepared origin; any other description is materialized
// privately on top of the same installation, once per process.
const runWideRepositories = {
  default: makeMe.aRepository.please(),
  queued: queuedReadyRepository().please(),
} as const satisfies Record<string, StartRepository>;
type RunWideRepository = keyof typeof runWideRepositories;
const runWideNames = Object.keys(runWideRepositories) as RunWideRepository[];
const runWideKeys = new Map(
  runWideNames.map((name) => [JSON.stringify(runWideRepositories[name]), name]),
);

export function startOriginArtifactKey(
  layout: StartOriginLayout,
  repository: RunWideRepository = "default",
): string {
  return repository === "default"
    ? `start-origin-${layout}`
    : `start-origin-${layout}-${repository}`;
}

export function createStartOriginPreparationDirectory(): string {
  return mkdtempSync(path.join(tmpdir(), "dough-start-preparation-"));
}

export function startOriginArtifacts() {
  return [
    ...nativeStartLayouts.flatMap((layout) =>
      runWideNames.map((repository) => startOriginArtifact(layout, repository)),
    ),
    startOriginArtifact("catalog", "queued"),
  ];
}

function startOriginArtifact(
  layout: StartOriginLayout,
  repository: RunWideRepository,
) {
  return [
    startOriginArtifactKey(layout, repository),
    {
      create: createStartOriginPreparationDirectory,
      prepare: (directory: string) =>
        prepareStartOrigin(directory, layout, runWideRepositories[repository]),
    },
  ] as const;
}

export async function prepareStartOrigin(
  directory: string,
  layout: StartOriginLayout,
  repository: StartRepository,
  source = path.join(repoRoot, "Distribution", "src", "skills"),
): Promise<void> {
  try {
    const built = await materializeLocalCheckout(
      undefined,
      withInstallation(repository, layout, source),
      { at: mkdtempSync(path.join(directory, "source-")), gitTemplates: true },
    );
    try {
      const origin = path.join(directory, layout);
      // The transport produces one pack instead of copying loose objects.
      await exec("git", [
        "clone",
        "--bare",
        "--no-local",
        built.integration,
        origin,
      ]);
      await exec("git", ["-C", origin, "remote", "remove", "origin"]);
      await exec("git", ["-C", origin, "config", "maintenance.auto", "false"]);
      keepRevisions(directory, built.revisions);
    } finally {
      await built.cleanup();
    }
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

// The origins this process holds, by layout and description: each description
// the run does not prepare, prepared once on top of the same installation, and
// each a worker keeps whole. All are removed when the process ends.
const privatelyPrepared = new Map<string, Promise<string>>();
const privateDirectories: string[] = [];
process.once("exit", () => {
  for (const directory of privateDirectories)
    rmSync(directory, { recursive: true, force: true });
});
const privateKey = (layout: StartOriginLayout, description: StartRepository) =>
  `${layout}\n${JSON.stringify(description)}`;

// Keeps a copy of `started.origin`, the bare origin a start of `description`
// left, with its named revisions, as that description's prepared origin in
// this process: a later start of it is a copy that already holds every
// revision. A worker does so before its tests start (./pageTest.ts).
export function keepStartedOrigin(
  layout: StartOriginLayout,
  description: StartRepository,
  started: { readonly origin: string; readonly revisions: StartRevisions },
) {
  const directory = createStartOriginPreparationDirectory();
  privateDirectories.push(directory);
  cpSync(started.origin, path.join(directory, layout), { recursive: true });
  keepRevisions(directory, started.revisions);
  const key = privateKey(layout, description);
  privatelyPrepared.set(key, Promise.resolve(directory));
}

function preparedPrivately(
  layout: StartOriginLayout,
  description: StartRepository,
): Promise<string> {
  const key = privateKey(layout, description);
  const directory = createStartOriginPreparationDirectory();
  privateDirectories.push(directory);
  const prepared = prepareStartOrigin(directory, layout, description).then(
    () => directory,
    (error: unknown) => {
      privatelyPrepared.delete(key);
      throw error;
    },
  );
  privatelyPrepared.set(key, prepared);
  return prepared;
}

// The prepared origin a description starts from. One this process holds for it
// is that. Otherwise an explicit fixture override, or the run-wide origin
// whose first revision the description shares, is `shared`: its copy still
// needs the description's later revisions. Any other description is prepared
// privately, once per process. A run-wide description with no inherited run
// owner has no prepared origin.
export async function preparedStartOrigin(
  layout: StartOriginLayout,
  description: StartRepository,
): Promise<{ readonly directory?: string; readonly shared: boolean }> {
  const held = privatelyPrepared.get(privateKey(layout, description));
  if (held !== undefined) return { directory: await held, shared: false };
  const [first] = description.revisions;
  const runWide = runWideKeys.get(JSON.stringify({ revisions: [first] }));
  // An explicit fixture override still takes precedence over the run owner.
  const shared =
    (layout === "catalog"
      ? undefined
      : process.env[startOriginPreparationVariable]) ??
    (runWide === undefined
      ? undefined
      : await requestRunArtifact(startOriginArtifactKey(layout, runWide)));
  if (shared !== undefined) return { directory: shared, shared: true };
  if (runWide !== undefined) return { shared: false };
  return {
    directory: await preparedPrivately(layout, description),
    shared: false,
  };
}
