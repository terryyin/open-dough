// One packed, path-free origin per installation layout and repository
// description, materialized through the shared repository harness with this
// run's working-tree skills installed. Only copies reach a test: Git never
// hardlinks objects or reads alternates, and each checkout names its own bare
// origin.

import { execFile } from "node:child_process";
import {
  cpSync,
  mkdirSync,
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
import type { RepositoryDescription } from "../../../tests/support/repositoryTestData.mjs";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { repoRoot } from "./repositoryRoot.ts";
import { requestRunArtifact } from "./runArtifacts.ts";

const exec = promisify(execFile);
export const startOriginPreparationVariable =
  "OPEN_DOUGH_START_ORIGIN_PREPARATION";
const startOriginLayouts = ["claude", "codex"] as const;
type StartOriginLayout = (typeof startOriginLayouts)[number];

export type StartRepository = RepositoryDescription<string>;

// The shared descriptions global setup prepares once per layout per run. Any
// other description is materialized privately on top of the same installation.
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
const dashboardDeveloper = {
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
function withInstallation(
  repository: StartRepository,
  layout: StartOriginLayout,
  source: string,
): StartRepository {
  const files: Record<string, string> = { ".gitignore": ".worktrees/\n" };
  const executable: string[] = [];
  const project = { path: "", shown: "" };
  for (const skill of installedStartSkills) {
    const installed = installedSkillPath(layout, project, skill);
    const skillSource = path.join(source, skill);
    for (const file of sourceFiles(skillSource)) {
      const from = path.join(skillSource, file);
      const to = path.join(installed, file);
      files[to] = readFileSync(from, "utf8");
      if (statSync(from).mode & 0o100) executable.push(to);
    }
  }
  const [first, ...later] = repository.revisions;
  return {
    revisions: [
      {
        committer: dashboardDeveloper,
        ...first,
        files: { ...files, ...first.files },
        executable: [...executable, ...(first.executable ?? [])],
      },
      ...later,
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

export async function initializeStartOrigin(
  origin: string,
  project: string,
  repository: string,
  host: "claude" | "codex" | "cursor",
  description: StartRepository,
): Promise<void> {
  const layout = host === "claude" ? "claude" : "codex";
  const runWide = runWideKeys.get(JSON.stringify(description));
  // An explicit fixture override still takes precedence over the run owner.
  const prepared =
    process.env[startOriginPreparationVariable] ??
    (runWide === undefined
      ? undefined
      : await requestRunArtifact(startOriginArtifactKey(layout, runWide)));
  const directory = prepared ?? createStartOriginPreparationDirectory();
  try {
    // A configuration with no inherited owner, or a description the run does
    // not prepare, gets a private copy.
    if (prepared === undefined)
      await prepareStartOrigin(directory, layout, description);
    cpSync(path.join(directory, layout), origin, {
      recursive: true,
    });
    mkdirSync(path.dirname(project), { recursive: true });
    const spelled = `https://github.com/${repository}.git`;
    await exec("git", [
      "clone",
      "--no-hardlinks",
      "-c",
      `user.name=${dashboardDeveloper.name}`,
      "-c",
      `user.email=${dashboardDeveloper.email}`,
      "-c",
      "maintenance.auto=false",
      "-c",
      `url.${origin}.insteadOf=${spelled}`,
      spelled,
      project,
    ]);
    // The original init + explicit push fixture had no upstream branch.
    await exec("git", [
      "-C",
      project,
      "config",
      "--remove-section",
      "branch.main",
    ]);
    await exec("git", [
      "-C",
      project,
      "symbolic-ref",
      "--delete",
      "refs/remotes/origin/HEAD",
    ]);
  } finally {
    if (prepared === undefined)
      rmSync(directory, { recursive: true, force: true });
  }
}
