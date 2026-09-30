// What every workflow's start shares, whatever its installed skill's command:
// the answer a start gives a launch (`PlannedStart`), the gate a start passes
// before its script runs (`gatedStart`), the one stable publisher, and the
// subprocess that runs the command (`runStartCommand`). The argument array and
// the result reader stay with each workflow (`./executionStart.ts`,
// `./preparationStart.ts`).

import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { hostname } from "node:os";
import type {
  EstablishedPreparation,
  EstablishedStart,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { git, repositoryOf } from "./startGit.ts";
import type { WorkflowProgress } from "./startProgress.ts";

// What a workflow's start established: an execution's start or a refinement's
// preparation, under the key its launch record keeps it by.
export type Established =
  | { readonly start: EstablishedStart }
  | { readonly preparation: EstablishedPreparation };

// The facts every established start or preparation shares.
export function establishedFacts(
  established: Established,
): EstablishedPreparation {
  return "start" in established ? established.start : established.preparation;
}

export type StartAttempt =
  | ({ readonly kind: "established" } & Established)
  | { readonly kind: "refused"; readonly explanation: string };

export type PlannedStart =
  // The installed skill cannot continue from a start: launch as before.
  | { readonly kind: "not-applicable" }
  | {
      readonly kind: "refused";
      readonly explanation: string;
      // Set when the refusal is not the start's own stop.
      readonly reason?: "already-starting";
    }
  // The script is running in `workspace` on `branch`; `attempt` settles when
  // it ends, however long that takes.
  | {
      readonly kind: "running";
      readonly workspace: ProjectFolder;
      readonly branch: string;
      readonly attempt: Promise<StartAttempt>;
    };

const alreadyStarting =
  "This story is already starting on this machine, so a second start was not made. Wait for the running start to end; its card shows its progress. Nothing was launched.";

export async function isFile(file: string): Promise<boolean> {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

// One stable publisher per machine and project: the same start asked again is
// this publisher's own claim, never another agent's.
export function publisherId(source: PublishedSource): string {
  return `dashboard-${hostname()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")}-${source.id}`;
}

// The command's stdout once it ends, or undefined for one that could not run.
export function runStartCommand(
  script: string,
  args: readonly string[],
  project: ProjectFolder,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script, "start", ...args], {
      cwd: project.path,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let stdout = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.on("error", () => {
      resolve(undefined);
    });
    child.on("close", () => {
      resolve(stdout);
    });
  });
}

// Runs `start` for a story only if its project's `origin` is the catalog
// repository, where `published` (what the start announces) would be
// published, and no start of the story is in `progress`. The story is in
// `progress` as `preparing` from before `start` runs, and leaves it if
// `start` throws.
export async function gatedStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
  published: string,
  start: () => Promise<PlannedStart>,
): Promise<PlannedStart> {
  const origin = await git(project, ["config", "--get", "remote.origin.url"]);
  if (repositoryOf(origin) !== source.repository.toLowerCase()) {
    return {
      kind: "refused",
      explanation: `The origin of ${project.shown} is not ${source.repository}, where the ${published} would be published. Nothing was started or launched.`,
    };
  }
  // Registered in the same synchronous step that checks it, before any await,
  // so of two launches of one story in this server exactly one goes on.
  if (progress.running(source.id, request.identity)) {
    return {
      kind: "refused",
      reason: "already-starting",
      explanation: alreadyStarting,
    };
  }
  progress.set(source.id, request.identity, "preparing");
  try {
    return await start();
  } catch (error) {
    progress.clear(source.id, request.identity);
    throw error;
  }
}
