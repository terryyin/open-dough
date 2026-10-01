// The start a refinement launch runs before its session: the project's own
// installed `preparation-assignment.mjs start`
// in the selected host's skill installation, which fetches trunk, creates the
// workspace, and publishes the Preparing announcement, run as a subprocess and
// never reimplemented here. This module is the only place its argument array
// is spelled (its one-line JSON result is read in `./preparationResult.ts`).
// A project establishes it only when its installed skill ships the start
// command and the formatter (`established-preparation.mjs`) that hands the
// preparation to the session; any other project launches as before. The
// workspace follows the shared collision rule (`./launchWorkspace.ts`). A
// start is kept (`./startStore.ts`) from before its script runs until a
// session launches from it or it stops with nothing assigned; the next launch
// of the story reruns the script in the kept workspace and branch. A one-shot
// policy runs `start --one-shot`, in the default checkout when selected, and
// publishes nothing; its kept established context is reused as it is.

import { stat } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type {
  EstablishedPreparation,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { installedSkillPath } from "./launchHosts.ts";
import { beforeStart, removeCreatedWorkspace } from "./preparationCleanup.ts";
import {
  keepsPreparation,
  preparationRefusal,
  readPreparationResult,
  type PreparationResult,
} from "./preparationResult.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import {
  gatedStart,
  isFile,
  startChoice,
  runStartCommand,
  type PlannedStart,
  type StartAttempt,
} from "./startLaunch.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import { continuedStart, policyArguments } from "./startPolicy.ts";
import { establishedOneShot, record } from "./startRecording.ts";
import {
  keepStart,
  keptStart,
  removeStart,
  updateStart,
} from "./startStore.ts";

const refinementSkill = "dough-story-refinement";
const startScript = "preparation-assignment.mjs";
const formatterScript = "established-preparation.mjs";
const workflow = "refinement";

async function runScript(
  args: readonly string[],
  project: ProjectFolder,
  host: StoryLaunchRequest["host"],
): Promise<PreparationResult> {
  const stdout = await runStartCommand(
    installedSkillPath(host, project, refinementSkill, "scripts", startScript),
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
  host: StoryLaunchRequest["host"] = "claude",
): Promise<boolean> {
  const script = (name: string) =>
    installedSkillPath(host, project, refinementSkill, "scripts", name);
  return (
    (await isFile(script(startScript))) &&
    (await isFile(script(formatterScript)))
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
  if (!(await establishesPreparation(project, request.host))) {
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
  // A start kept from an earlier launch of the story is resumed as it was:
  // the same workspace, branch and policy, so the script answers `continued`.
  const kept = await keptStart(source.id, request.identity, workflow);
  const { workspace, branch, model, policy } = await startChoice(
    project,
    request,
    kept,
    source.ref,
  );
  const oneShot = policy.tracking === "one-shot";
  // A kept one-shot preparation that established its context goes on from it
  // as it is: its workspace may already hold the result.
  if (oneShot && kept?.preparation !== undefined) {
    progress.set(source.id, request.identity, "launching");
    return continuedStart(
      { workspace, branch, policy },
      { preparation: kept.preparation },
    );
  }
  const before = await beforeStart(project, workspace.path, branch);
  // Written ahead of the script, so a start whose result is lost is still
  // known.
  await keepStart(
    source.id,
    {
      ...kept,
      host: request.host,
      identity: request.identity,
      workspace: workspace.path,
      branch,
      ...(model === undefined ? {} : { model }),
      ...(oneShot ? { policy } : {}),
      startedAt: new Date().toISOString(),
    },
    workflow,
  );
  const facts = {
    identity: request.identity,
    workspace: workspace.path,
    branch,
    remote: "origin",
    target: source.ref,
  };
  const attempt = runScript(
    [
      ...policyArguments(policy, project),
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
      "--host",
      request.host,
      ...(model === undefined ? [] : ["--model", model]),
    ],
    project,
    request.host,
  ).then(async (result): Promise<StartAttempt> => {
    if (result.kind === "established" || result.kind === "prepared") {
      progress.set(source.id, request.identity, "launching");
      const preparation: EstablishedPreparation =
        result.kind === "prepared"
          ? establishedOneShot(facts, result, policy)
          : {
              ...(kept?.preparation !== undefined &&
              !("tracking" in kept.preparation)
                ? kept.preparation
                : {}),
              ...facts,
              agent: result.agent,
              ...(result.publishedSha === undefined
                ? {}
                : { publishedSha: result.publishedSha }),
            };
      await record(() =>
        updateStart(source.id, request.identity, { preparation }, workflow),
      );
      return { kind: "established", preparation };
    }
    progress.clear(source.id, request.identity);
    if (keepsPreparation(result)) {
      return {
        kind: "refused",
        explanation: preparationRefusal(result, "", {
          workspace: workspace.shown,
          branch,
        }),
      };
    }
    // A stop that made no assignment leaves nothing to resume and removes the
    // workspace and branch this launch created; the default checkout existed
    // before, so it stays.
    await record(() => removeStart(source.id, request.identity, workflow));
    return {
      kind: "refused",
      explanation: preparationRefusal(
        result,
        await removeCreatedWorkspace(project, workspace.path, branch, before),
      ),
    };
  });
  return { kind: "running", workspace, branch, policy, attempt };
}

// The established preparation as the session's instruction carries it,
// written by the formatter the installed skill ships beside its start
// command.
export async function formattedPreparation(
  project: ProjectFolder,
  preparation: EstablishedPreparation,
  host: StoryLaunchRequest["host"] = "claude",
): Promise<string> {
  const file = installedSkillPath(
    host,
    project,
    refinementSkill,
    "scripts",
    formatterScript,
  );
  const url = `${pathToFileURL(file).href}?modified=${String((await stat(file)).mtimeMs)}`;
  const formatter = (await import(/* @vite-ignore */ url)) as {
    formatEstablishedPreparation: (preparation: object) => string;
  };
  return formatter.formatEstablishedPreparation({
    ...preparation,
    integration: project.path,
  });
}
