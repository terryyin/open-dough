// Orchestrates one refinement's mechanical start before its native session.
// The installed command owns publication/ownership; this module spells its
// arguments and keeps the machine-local start until launch or verified absence.
// Retrying preserves the selected workspace, branch, and announcement evidence.

import { realpath } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  EstablishedPreparation,
  StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { beforeStart, removeCreatedWorkspace } from "./preparationCleanup.ts";
import {
  keepsPreparation,
  preparationRefusal,
  continuationRefusal,
} from "./preparationResult.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import {
  gatedStart,
  startChoice,
  type PlannedStart,
  type StartAttempt,
} from "./startLaunch.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import { record } from "./startRecording.ts";
import {
  keepStart,
  keptStart,
  removeStart,
  updateStart,
} from "./startStore.ts";

import {
  establishesPreparation,
  runPreparationCommand,
} from "./preparationCommand.ts";
export {
  establishesPreparation,
  formattedPreparation,
} from "./preparationCommand.ts";

const workflow = "refinement";

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
    const kept = await keptStart(source.id, request.identity, workflow);
    if (kept !== undefined) {
      const { workspace, branch } = await startChoice(project, request, kept);
      return continuationRefusal(
        "The installed preparation command or formatter is unavailable.",
        kept.preparation?.agent,
        workspace.shown,
        branch,
      );
    }
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
  // the same workspace and branch, so the script answers `continued`.
  const kept = await keptStart(source.id, request.identity, workflow);
  const { workspace, branch, model } = await startChoice(
    project,
    request,
    kept,
  );
  if (kept?.preparation !== undefined) {
    const preparation = kept.preparation;
    const paths = await Promise.all(
      [workspace.path, preparation.workspace].map((file) =>
        realpath(file).catch(() => resolve(file)),
      ),
    );
    if (
      paths[0] !== paths[1] ||
      preparation.branch !== branch ||
      preparation.identity !== request.identity ||
      preparation.remote !== "origin" ||
      preparation.target !== source.ref
    ) {
      progress.clear(source.id, request.identity);
      return continuationRefusal(
        "The saved start and established preparation disagree.",
        preparation.agent,
        workspace.shown,
        branch,
      );
    }
  }
  const before = await beforeStart(project, workspace.path, branch);
  // Written ahead of the script, so a start whose result is lost is still
  // known.
  if (kept === undefined)
    await keepStart(
      source.id,
      {
        host: request.host,
        identity: request.identity,
        workspace: workspace.path,
        branch,
        ...(model === undefined ? {} : { model }),
        startedAt: new Date().toISOString(),
      },
      workflow,
    );
  // An old/no-result start is uncertain. Only the script's explicit verified
  // nonacceptance permits another announcement; an established start never does.
  const continuing =
    kept !== undefined &&
    (kept.preparation !== undefined || kept.preparationUnannounced !== true);
  if (kept !== undefined && !continuing) {
    // The earlier refusal proves nothing about this attempt. Clear its
    // disposition durably before a new command can publish or lose its result.
    await record(() =>
      updateStart(
        source.id,
        request.identity,
        { preparationUnannounced: false },
        workflow,
      ),
    );
  }
  const attempt = runPreparationCommand(
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
      request.host,
      ...(model === undefined ? [] : ["--model", model]),
      ...(continuing && kept.preparation !== undefined
        ? [
            ...(kept.preparation.agent === undefined
              ? []
              : ["--expected-agent", kept.preparation.agent]),
            ...(kept.preparation.publishedSha === undefined
              ? []
              : ["--expected-allocation", kept.preparation.publishedSha]),
          ]
        : []),
    ],
    project,
    request.host,
    continuing ? "continue" : "start",
  ).then(async (result): Promise<StartAttempt> => {
    if (result.kind === "established") {
      progress.set(source.id, request.identity, "launching");
      const preparation: EstablishedPreparation = {
        ...kept?.preparation,
        identity: request.identity,
        workspace: workspace.path,
        branch,
        remote: "origin",
        target: source.ref,
        agent: result.agent,
        ...(result.publishedSha === undefined
          ? {}
          : { publishedSha: result.publishedSha }),
      };
      await record(() =>
        updateStart(
          source.id,
          request.identity,
          { preparation, preparationUnannounced: false },
          workflow,
        ),
      );
      return { kind: "established", preparation };
    }
    progress.clear(source.id, request.identity);
    if (continuing) {
      const agent = kept.preparation?.agent;
      const detail =
        result.kind === "stopped" && result.error
          ? `${result.error.replace(/[.]$/, "")}.`
          : "The installed command could not verify continuation.";
      return continuationRefusal(detail, agent, workspace.shown, branch);
    }
    if (keepsPreparation(result)) {
      if (result.kind === "stopped" && result.unannounced === true) {
        await record(() =>
          updateStart(
            source.id,
            request.identity,
            { preparationUnannounced: true },
            workflow,
          ),
        );
      }
      return {
        kind: "refused",
        explanation: preparationRefusal(result, "", {
          workspace: workspace.shown,
          branch,
        }),
      };
    }
    // A stop that made no assignment leaves nothing to resume and removes the
    // workspace and branch this launch created.
    await record(() => removeStart(source.id, request.identity, workflow));
    return {
      kind: "refused",
      explanation: preparationRefusal(
        result,
        await removeCreatedWorkspace(project, workspace.path, branch, before),
      ),
    };
  });
  return { kind: "running", workspace, branch, attempt };
}
