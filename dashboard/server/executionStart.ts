// The start an execution launch runs before its session: the project's own
// installed `execution-start.mjs start` (`.claude/skills/dough-execute-plan`),
// which fetches trunk, creates the workspace, and publishes the Take, run as a
// subprocess and never reimplemented here. This module is the only place its
// argument array is spelled (its one-line JSON result is read in
// `./startResult.ts`).
// It also owns whether a project can be started at all: the installed skill
// must ship the start command and the formatter (`established-start.mjs`) that
// hands an established start to the session, and the project's `origin` must
// be the catalog repository, since the Take is published there. A project
// whose skill cannot continue from a start is launched as before, with no
// claim and no workspace.
// The workspace is chosen by the host's convention (`./claudeWorkspace.ts`).
// A running start is never aborted: only a script that finishes reports
// what it published. A start is kept (`./startStore.ts`) from before its script
// runs until a session launches from it, and a start whose claim may be
// published is resumed by the next launch of the story: same publisher,
// workspace, and branch, so the script answers `existing` or `resumed`.

import { stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type EstablishedStart,
  type StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  claudeWorkspace,
  shownWorkspace,
  type WorkspaceChoice,
} from "./claudeWorkspace.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import { lostStartArguments, ownerOf, takenSlugs } from "./startGit.ts";
import {
  gatedStart,
  isFile,
  publisherId,
  runStartCommand,
  type PlannedStart,
  type StartAttempt,
} from "./startLaunch.ts";
import { establishedStart, record, recordStop } from "./startRecording.ts";
import { readStartResult, refusal, type StartResult } from "./startResult.ts";
import {
  keepStart,
  keptStart,
  resumeArguments,
  updateStart,
  type StartRecord,
} from "./startStore.ts";

const skillScripts = path.join(
  ".claude",
  "skills",
  "dough-execute-plan",
  "scripts",
);
const startScript = "execution-start.mjs";
const formatterScript = "established-start.mjs";
const workflow = "execution";

async function runScript(
  args: readonly string[],
  project: ProjectFolder,
): Promise<StartResult> {
  const stdout = await runStartCommand(
    path.join(project.path, skillScripts, startScript),
    args,
    project,
  );
  // A command that could not run leaves no result to read.
  return stdout === undefined
    ? { kind: "unreadable" }
    : readStartResult(stdout);
}

// Whether the project's installed skill can continue from a start: it ships
// the start command and the formatter. The one check both a launch and the
// machine's answer to the page read.
export async function establishesStart(
  project: ProjectFolder,
): Promise<boolean> {
  const scripts = path.join(project.path, skillScripts);
  return (
    (await isFile(path.join(scripts, startScript))) &&
    (await isFile(path.join(scripts, formatterScript)))
  );
}

// The workspace a kept start was made in, shown as this host's workspaces are.
function keptChoice(
  project: ProjectFolder,
  kept: StartRecord,
): WorkspaceChoice {
  return {
    workspace: {
      path: kept.workspace,
      shown: shownWorkspace(project, path.basename(kept.workspace)),
    },
    branch: kept.branch,
  };
}

// Runs the start for one execution launch, or says why not. The start is in
// `progress` from before its script runs: `preparing` while it runs, then
// `launching` once it established the start, for the launch to end; a start
// that stops leaves `progress` when its record is written. A story whose
// start `progress` already holds is refused, starting nothing. A kept start
// with no result that `progress` does not hold was lost with the server that
// ran it.
export async function beginStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
): Promise<PlannedStart> {
  if (!(await establishesStart(project))) {
    return { kind: "not-applicable" };
  }
  return gatedStart(source, request, project, progress, "Take", () =>
    runningStart(source, request, project, progress),
  );
}

// The start of a story registered in `progress`: keeps it, then runs its
// script.
async function runningStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: ProjectFolder,
  progress: WorkflowProgress,
): Promise<PlannedStart> {
  // A start kept from an earlier launch of the story is resumed as it was.
  const kept = await keptStart(source.id, request.identity, workflow);
  const { workspace, branch } =
    kept === undefined
      ? claudeWorkspace(project, request.title, await takenSlugs(project))
      : keptChoice(project, kept);
  const model = kept === undefined ? request.model : kept.model;
  const facts = {
    identity: request.identity,
    publisherId: kept?.publisherId ?? publisherId(source),
    workspace: workspace.path,
    branch,
    mode: "story-branch",
    remote: "origin",
    target: source.ref,
  } as const;
  const resume =
    kept === undefined
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
      identity: facts.identity,
      publisherId: facts.publisherId,
      workspace: facts.workspace,
      branch: facts.branch,
      ...(model === undefined ? {} : { model }),
      startedAt: new Date().toISOString(),
    },
    workflow,
  );
  const attempt = runScript(
    [
      "--integration",
      project.path,
      "--workspace",
      facts.workspace,
      "--branch",
      facts.branch,
      "--identity",
      facts.identity,
      "--publisher-id",
      facts.publisherId,
      "--mode",
      facts.mode,
      "--remote",
      facts.remote,
      "--target",
      facts.target,
      "--push-authorized",
      "--workspace-authorized",
      "--host",
      "claude",
      ...(model === undefined ? [] : ["--model", model]),
      ...resume,
    ],
    project,
  ).then(async (result): Promise<StartAttempt> => {
    // The record follows the script's result even when the launch stopped
    // waiting for it.
    if (result.kind === "accepted") {
      progress.set(source.id, request.identity, "launching");
      const start = establishedStart(facts, result, kept?.start);
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
        explanation: refusal(result, owner, {
          workspace: workspace.shown,
          branch,
        }),
      };
    } finally {
      progress.clear(source.id, request.identity);
    }
  });
  return { kind: "running", workspace, branch, attempt };
}

// The established start as the session's instruction carries it, written by
// the formatter the project's installed skill ships beside its start
// command, so the skill reads what its own version wrote.
export async function formattedStart(
  project: ProjectFolder,
  start: EstablishedStart,
): Promise<string> {
  const file = path.join(project.path, skillScripts, formatterScript);
  // Keyed by its modification time, so a skill updated while the server runs
  // is read anew.
  const url = `${pathToFileURL(file).href}?modified=${String((await stat(file)).mtimeMs)}`;
  const formatter = (await import(/* @vite-ignore */ url)) as {
    formatEstablishedStart: (start: EstablishedStart) => string;
  };
  return formatter.formatEstablishedStart(start);
}
