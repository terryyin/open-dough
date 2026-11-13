// One packed, path-free origin per installation layout and repository
// description, materialized through the shared repository harness with this
// run's working-tree skills installed. Only copies reach a test: Git never
// hardlinks objects or reads alternates, and each checkout names its own bare
// origin.

import { execFile } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../tests/support/repository-fixture.mjs";
import type {
  GitPerson,
  RepositoryDescription,
} from "../../../tests/support/repositoryTestData.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { repoRoot } from "./repositoryRoot.ts";
import { requestRunArtifact } from "./runArtifacts.ts";

const exec = promisify(execFile);
export const startOriginPreparationVariable =
  "OPEN_DOUGH_START_ORIGIN_PREPARATION";
const startOriginLayouts = ["claude", "codex"] as const;
export type StartOriginLayout = (typeof startOriginLayouts)[number];

export type StartRepository = RepositoryDescription<string>;

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

export const installedStartSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
  "dough-land",
  "dough-story-wrap-up",
] as const;

export function createStartOriginPreparationDirectory(): string {
  return mkdtempSync(path.join(tmpdir(), "dough-start-preparation-"));
}

export function startOriginArtifacts() {
  return startOriginLayouts.flatMap((layout) =>
    runWideNames.map(
      (repository) =>
        [
          startOriginArtifactKey(layout, repository),
          {
            create: createStartOriginPreparationDirectory,
            prepare: (directory: string) =>
              prepareStartOrigin(
                directory,
                layout,
                runWideRepositories[repository],
              ),
          },
        ] as const,
    ),
  );
}

// The first commit's committer and author, and the project checkout's identity.
export const dashboardDeveloper: GitPerson = {
  name: "Dashboard Developer",
  email: "developer@example.test",
};

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { recursive: true, encoding: "utf8" }).filter(
    (file) => statSync(path.join(directory, file)).isFile(),
  );
}

// The harness layer: `.gitignore` and the installed skills, read from source
// now, join the description's first commit instead of a commit of their own.
// The project's developer commits each revision that names no committer, as
// the project checkout itself would.
function withInstallation(
  repository: StartRepository,
  layout: StartOriginLayout,
  source: string,
): StartRepository {
  const files: Record<string, string> = { ".gitignore": ".worktrees/\n" };
  const executables: string[] = [];
  const project = { path: "", shown: "" };
  for (const skill of installedStartSkills) {
    const installed = installedSkillPath(layout, project, skill);
    const skillSource = path.join(source, skill);
    for (const file of sourceFiles(skillSource)) {
      const from = path.join(skillSource, file);
      const to = path.join(installed, file);
      files[to] = readFileSync(from, "utf8");
      if (statSync(from).mode & 0o100) executables.push(to);
    }
  }
  const [first, ...later] = repository.revisions;
  return {
    revisions: [
      {
        committer: dashboardDeveloper,
        ...first,
        files: { ...files, ...first.files },
        executables: [...executables, ...(first.executables ?? [])],
      },
      ...later.map((revision) => ({
        committer: dashboardDeveloper,
        ...revision,
      })),
    ],
  };
}

export async function prepareStartOrigin(
  directory: string,
  layout: StartOriginLayout,
  repository: StartRepository,
  source = path.join(repoRoot, "src", "skills"),
): Promise<void> {
  try {
    const built = await materializeRepository(
      withInstallation(repository, layout, source),
      { parent: directory },
    );
    try {
      const origin = path.join(directory, layout);
      // The transport produces one pack instead of copying loose objects.
      await exec("git", [
        "clone",
        "--bare",
        "--no-local",
        built.origin,
        origin,
      ]);
      await exec("git", ["-C", origin, "remote", "remove", "origin"]);
      await exec("git", ["-C", origin, "config", "maintenance.auto", "false"]);
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

// Keeps a copy of `origin`, the bare origin a start of `description` left, as
// that description's prepared origin in this process: a later start of it is
// a copy that already holds every revision. A worker does so before its tests
// start (./pageTest.ts).
export function keepStartedOrigin(
  layout: StartOriginLayout,
  description: StartRepository,
  origin: string,
) {
  const directory = createStartOriginPreparationDirectory();
  privateDirectories.push(directory);
  cpSync(origin, path.join(directory, layout), { recursive: true });
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
    process.env[startOriginPreparationVariable] ??
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
