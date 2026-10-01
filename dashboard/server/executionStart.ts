// Execution start uses the selected installed skill's script and formatter;
// the dashboard owns arguments, while the script owns publication/recovery.

import { stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import {
  type EstablishedStart,
  type StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import { continuedStart, policyArguments } from "./startPolicy.ts";
import { lostStartArguments, ownerOf } from "./startGit.ts";
import {
  gatedStart,
  isFile,
  startChoice,
  publisherId,
  runStartCommand,
  type PlannedStart,
  type StartAttempt,
} from "./startLaunch.ts";
import {
  establishedOneShot,
  establishedStart,
  record,
  recordStop,
} from "./startRecording.ts";
import {
  keepsStart,
  readStartResult,
  refusal,
  type StartResult,
} from "./startResult.ts";
import {
  keepStart,
  keptStart,
  resumeArguments,
  updateStart,
} from "./startStore.ts";

const executePlanSkill = "dough-execute-plan";
const startScript = "execution-start.mjs";
const formatterScript = "established-start.mjs";
const workflow = "execution";

async function runScript(
  args: readonly string[],
  project: ProjectFolder,
  host: StoryLaunchRequest["host"],
): Promise<StartResult> {
  const stdout = await runStartCommand(
    installedSkillPath(host, project, executePlanSkill, "scripts", startScript),
    args,
    project,
  );
  // A command that could not run leaves no result to read.
  return stdout === undefined
    ? { kind: "unreadable" }
    : readStartResult(stdout);
}

// Whether the project's installed skill can continue from a start: it ships
// the start command and formatter, shared by admission and machine reads.
export async function establishesStart(
  project: ProjectFolder,
  host: StoryLaunchRequest["host"],
): Promise<boolean> {
  const script = (name: string) =>
    installedSkillPath(host, project, executePlanSkill, "scripts", name);
  return (
    (await isFile(script(startScript))) &&
    (await isFile(script(formatterScript)))
  );
}

// Runs one start, registered in progress before the script starts.
export async function beginStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
): Promise<PlannedStart> {
  if (!(await establishesStart(project, request.host))) {
    return { kind: "not-applicable" };
  }
  return gatedStart(source, request, project, progress, "Take", () =>
    runningStart(source, request, project, progress),
  );
}

// The start of a story registered in `progress`: keeps it, then runs its
// script. A one-shot start publishes no claim: it names no publisher, takes
// publication authority only for an automatic landing, and never resumes a
// claim; one kept with its established context goes on from it as it is.
async function runningStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
): Promise<PlannedStart> {
  // A start kept from an earlier launch of the story is resumed as it was.
  const kept = await keptStart(source.id, request.identity, workflow);
  const { workspace, branch, model, policy } = await startChoice(
    project,
    request,
    kept,
    source.ref,
  );
  const oneShot = policy.tracking === "one-shot";
  if (oneShot && kept?.start !== undefined) {
    progress.set(source.id, request.identity, "launching");
    return continuedStart({ workspace, branch, policy }, { start: kept.start });
  }
  const where = {
    identity: request.identity,
    workspace: workspace.path,
    branch,
    mode: "story-branch",
    remote: "origin",
    target: source.ref,
  } as const;
  const facts = {
    ...where,
    publisherId: kept?.publisherId ?? publisherId(source),
  } as const;
  const resume =
    kept === undefined || oneShot
      ? []
      : resumeArguments(kept).length > 0 || kept.start !== undefined
        ? resumeArguments(kept)
        : await lostStartArguments(kept.workspace, kept.branch);
  // Written ahead of the script, so a start whose result is lost is still
  // known.
  await keepStart(
    source.id,
    {
      ...kept,
      host: request.host,
      identity: facts.identity,
      ...(oneShot ? { policy } : { publisherId: facts.publisherId }),
      workspace: facts.workspace,
      branch: facts.branch,
      ...(model === undefined ? {} : { model }),
      startedAt: new Date().toISOString(),
    },
    workflow,
  );
  const attempt = runScript(
    [
      ...policyArguments(policy, project),
      "--workspace",
      facts.workspace,
      "--branch",
      facts.branch,
      "--identity",
      facts.identity,
      ...(oneShot ? [] : ["--publisher-id", facts.publisherId]),
      "--mode",
      facts.mode,
      "--remote",
      facts.remote,
      "--target",
      facts.target,
      "--workspace-authorized",
      "--host",
      request.host,
      ...(model === undefined ? [] : ["--model", model]),
      ...resume,
    ],
    project,
    request.host,
  ).then(async (result): Promise<StartAttempt> => {
    // The record follows the script's result even when the launch stopped
    // waiting for it.
    if (result.kind === "accepted" || result.kind === "prepared") {
      progress.set(source.id, request.identity, "launching");
      const start =
        result.kind === "accepted"
          ? establishedStart(facts, result, kept?.start)
          : establishedOneShot(where, result, policy);
      await record(() =>
        updateStart(source.id, request.identity, { start }, workflow),
      );
      return { kind: "established", start };
    }
    try {
      await record(() =>
        recordStop(workflow, source.id, request.identity, result),
      );
      const owner =
        result.kind === "stopped" && result.status === "conflict"
          ? await ownerOf(project, `origin/${source.ref}`, request.identity)
          : undefined;
      return {
        kind: "refused",
        explanation: refusal(
          result,
          owner,
          { workspace: workspace.shown, branch },
          oneShot,
        ),
        ...(keepsStart(result) ? {} : { publishedNothing: true }),
      };
    } finally {
      progress.clear(source.id, request.identity);
    }
  });
  return { kind: "running", workspace, branch, policy, attempt };
}

// The handoff is written by the selected installation's own formatter.
export async function formattedStart(
  project: ProjectFolder,
  start: EstablishedStart,
  host: StoryLaunchRequest["host"],
): Promise<string> {
  const file = installedSkillPath(
    host,
    project,
    executePlanSkill,
    "scripts",
    formatterScript,
  );
  // Keyed by its modification time, so a skill updated while the server runs
  // is read anew.
  const url = `${pathToFileURL(file).href}?modified=${String((await stat(file)).mtimeMs)}`;
  const formatter = (await import(/* @vite-ignore */ url)) as {
    formatEstablishedStart: (start: EstablishedStart) => string;
  };
  return formatter.formatEstablishedStart(start);
}
