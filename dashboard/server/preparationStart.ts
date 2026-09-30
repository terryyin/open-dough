// The start a refinement launch runs before its session: the project's own
// installed `preparation-assignment.mjs start`
// (`.claude/skills/dough-story-refinement`), which fetches trunk, creates the
// workspace, and publishes the Preparing announcement, run as a subprocess and
// never reimplemented here. This module is the only place its argument array
// is spelled (its one-line JSON result is read in `./preparationResult.ts`).
// A project establishes it only when its installed skill ships the start
// command and the formatter (`established-preparation.mjs`) that hands the
// preparation to the session; any other project launches as before. The
// workspace is chosen by the host's convention (`./claudeWorkspace.ts`).

import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type {
  EstablishedPreparation,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { claudeWorkspace } from "./claudeWorkspace.ts";
import {
  preparationRefusal,
  readPreparationResult,
  type PreparationResult,
} from "./preparationResult.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { takenSlugs } from "./startGit.ts";
import {
  gatedStart,
  isFile,
  runStartCommand,
  type PlannedStart,
  type StartAttempt,
} from "./startLaunch.ts";
import type { WorkflowProgress } from "./startProgress.ts";

const skillScripts = path.join(
  ".claude",
  "skills",
  "dough-story-refinement",
  "scripts",
);
const startScript = "preparation-assignment.mjs";
const formatterScript = "established-preparation.mjs";

async function runScript(
  args: readonly string[],
  project: ProjectFolder,
): Promise<PreparationResult> {
  const stdout = await runStartCommand(
    path.join(project.path, skillScripts, startScript),
    args,
    project,
  );
  return stdout === undefined
    ? { kind: "unreadable" }
    : readPreparationResult(stdout);
}

// Whether the project's installed skill can establish a preparation: it ships
// the start command and the formatter.
export async function establishesPreparation(
  project: ProjectFolder,
): Promise<boolean> {
  const scripts = path.join(project.path, skillScripts);
  return (
    (await isFile(path.join(scripts, startScript))) &&
    (await isFile(path.join(scripts, formatterScript)))
  );
}

// Runs the start for one refinement launch, or says why not. The story is in
// `progress` from before its script runs: `preparing` while it runs, then
// `launching` once it established the preparation, for the launch to end.
export async function beginPreparation(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
): Promise<PlannedStart> {
  if (!(await establishesPreparation(project))) {
    return { kind: "not-applicable" };
  }
  return gatedStart(
    source,
    request,
    project,
    progress,
    "Preparing announcement",
    () => runningPreparation(source, request, project, progress),
  );
}

async function runningPreparation(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
): Promise<PlannedStart> {
  const { workspace, branch } = claudeWorkspace(
    project,
    request.title,
    await takenSlugs(project),
  );
  const attempt = runScript(
    [
      "--integration",
      project.path,
      "--workspace",
      workspace.path,
      "--branch",
      branch,
      "--identity",
      request.identity,
      "--remote",
      "origin",
      "--target",
      source.ref,
      "--push-authorized",
      "--host",
      "claude",
      ...(request.model === undefined ? [] : ["--model", request.model]),
    ],
    project,
  ).then((result): StartAttempt => {
    if (result.kind === "established" && result.publishedSha !== undefined) {
      progress.set(source.id, request.identity, "launching");
      return {
        kind: "established",
        preparation: {
          identity: request.identity,
          workspace: workspace.path,
          branch,
          remote: "origin",
          target: source.ref,
          publishedSha: result.publishedSha,
          agent: result.agent,
        },
      };
    }
    progress.clear(source.id, request.identity);
    return {
      kind: "refused",
      explanation: preparationRefusal(
        result.kind === "established"
          ? {
              kind: "stopped",
              status: "continued",
              error: "the workspace already held this assignment",
            }
          : result,
      ),
    };
  });
  return { kind: "running", workspace, branch, attempt };
}

// The established preparation as the session's instruction carries it,
// written by the formatter the installed skill ships beside its start
// command.
export async function formattedPreparation(
  project: ProjectFolder,
  preparation: EstablishedPreparation,
): Promise<string> {
  const file = path.join(project.path, skillScripts, formatterScript);
  const url = `${pathToFileURL(file).href}?modified=${String((await stat(file)).mtimeMs)}`;
  const formatter = (await import(/* @vite-ignore */ url)) as {
    formatEstablishedPreparation: (preparation: object) => string;
  };
  return formatter.formatEstablishedPreparation({
    ...preparation,
    integration: project.path,
  });
}
