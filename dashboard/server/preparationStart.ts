// Orchestrates one refinement's mechanical start before its native session.
// The installed command owns publication/ownership (its arguments are spelled
// in `./preparationCommand.ts`); this module keeps the machine-local start
// until launch or verified absence.
// Retrying preserves the selected workspace, branch, policy, and announcement
// evidence. A one-shot policy runs `start --one-shot`, in the execution checkout
// when selected, and publishes nothing; its kept established context is reused
// as it is.

import {
  assignedAgent,
  isEstablishedOneShot,
  type EstablishedPreparation,
  type StoryLaunchRequest,
} from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { beforeStart, removeCreatedWorkspace } from "./preparationCleanup.ts";
import { matchesPreparation } from "./preparationContext.ts";
import {
  keepsPreparation,
  preparationRefusal,
  continuationDetail,
  continuationRefusal,
} from "./preparationResult.ts";
import type { LocalFolder } from "./localFolder.ts";
import {
  gatedStart,
  startChoice,
  type PlannedStart,
  type StartAttempt,
  type StoryStartRuntime,
} from "./startLaunch.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import { continuedStart } from "./startPolicy.ts";
import { establishedOneShot, record } from "./startRecording.ts";
import type { StartRecord } from "./startStore.ts";

import {
  establishesPreparation,
  runPreparationCommand,
} from "./preparationCommand.ts";
export {
  establishesPreparation,
  formattedPreparation,
} from "./preparationCommand.ts";

// Runs the start for one refinement launch, or says why not. The story is in
// `progress` from before its script runs: `preparing` while it runs, then
// `launching` once it established the preparation, for the launch to end.
export async function beginPreparation(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: LocalFolder,
  progress: WorkflowProgress,
  runtime: StoryStartRuntime,
): Promise<PlannedStart> {
  if (!(await establishesPreparation(project, request.host))) {
    const kept = await runtime.store.kept(source.id, request.identity);
    if (kept !== undefined) {
      const { workspace, branch } = await startChoice(
        project,
        request,
        kept,
        source.ref,
      );
      return continuationRefusal(
        "The installed preparation command or formatter is unavailable.",
        kept.preparation === undefined
          ? undefined
          : assignedAgent(kept.preparation),
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
    () => runningPreparation(source, request, project, progress, runtime),
  );
}

async function runningPreparation(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: LocalFolder,
  progress: WorkflowProgress,
  { store, env, noteWorker }: StoryStartRuntime,
): Promise<PlannedStart> {
  // A start kept from an earlier launch of the story is resumed as it was:
  // the same workspace, branch and policy, so the script answers `continued`.
  const kept = await store.kept(source.id, request.identity);
  const { workspace, branch, model, effort, policy } = await startChoice(
    project,
    request,
    kept,
    source.ref,
  );
  const facts = {
    identity: request.identity,
    workspace: workspace.path,
    branch,
    remote: "origin",
    target: source.ref,
  };
  const oneShot = policy.tracking === "one-shot";
  // A kept one-shot preparation that established its context goes on from it
  // as it is: its workspace may already hold the result.
  if (oneShot && kept?.preparation !== undefined) {
    progress.set(source.id, request.identity, {
      phase: "launching",
      host: request.host,
    });
    return continuedStart(
      { workspace, branch, policy },
      { preparation: kept.preparation },
    );
  }
  if (
    kept?.preparation !== undefined &&
    !(await matchesPreparation(kept.preparation, facts))
  ) {
    progress.clear(source.id, request.identity);
    return continuationRefusal(
      "The saved start and established preparation disagree.",
      assignedAgent(kept.preparation),
      workspace.shown,
      branch,
    );
  }
  // The assignment an earlier attempt established and published, if any.
  const assigned =
    kept?.preparation !== undefined && !isEstablishedOneShot(kept.preparation)
      ? kept.preparation
      : undefined;
  const before = await beforeStart(project, workspace.path, branch);
  const updateKept = (change: Partial<StartRecord>) =>
    record(() => store.update(source.id, request.identity, change));
  // Written ahead of the script, so a start whose result is lost is still
  // known.
  if (kept === undefined)
    await store.keep(source.id, {
      host: request.host,
      identity: request.identity,
      workspace: workspace.path,
      branch,
      ...(model === undefined ? {} : { model }),
      ...(effort === undefined ? {} : { effort }),
      ...(oneShot ? { policy } : {}),
      startedAt: new Date().toISOString(),
    });
  // An old/no-result start is uncertain. Only the script's explicit verified
  // nonacceptance permits another announcement; an established start never does.
  // A one-shot start announces nothing, so it reruns its start instead.
  const continuing =
    !oneShot &&
    kept !== undefined &&
    (kept.preparation !== undefined || kept.preparationUnannounced !== true);
  if (kept !== undefined && !oneShot && !continuing) {
    // The earlier refusal proves nothing about this attempt. Clear its
    // disposition durably before a new command can publish or lose its result.
    await updateKept({ preparationUnannounced: false });
  }
  const attempt = runPreparationCommand(
    {
      ...facts,
      policy,
      host: request.host,
      model,
      assigned: continuing ? assigned : undefined,
    },
    project,
    continuing ? "continue" : "start",
    env,
    noteWorker,
  ).then(async (result): Promise<StartAttempt> => {
    if (result.kind === "established" || result.kind === "prepared") {
      progress.set(source.id, request.identity, {
        phase: "launching",
        host: request.host,
      });
      const preparation: EstablishedPreparation =
        result.kind === "prepared"
          ? establishedOneShot(facts, result, policy)
          : {
              ...assigned,
              ...facts,
              agent: result.agent,
              ...(result.publishedSha === undefined
                ? {}
                : { publishedSha: result.publishedSha }),
            };
      await updateKept({ preparation, preparationUnannounced: false });
      return { kind: "established", preparation };
    }
    progress.clear(source.id, request.identity);
    if (continuing) {
      return {
        ...continuationRefusal(
          continuationDetail(result),
          assigned?.agent,
          workspace.shown,
          branch,
        ),
        publishedNothing: true,
      };
    }
    if (keepsPreparation(result)) {
      if (result.kind === "stopped" && result.unannounced === true) {
        await updateKept({ preparationUnannounced: true });
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
    // workspace and branch this launch created; the execution checkout existed
    // before, so it stays.
    await record(() => store.remove(source.id, request.identity));
    return {
      kind: "refused",
      publishedNothing: true,
      explanation: preparationRefusal(
        result,
        await removeCreatedWorkspace(project, workspace.path, branch, before),
      ),
    };
  });
  return { kind: "running", workspace, branch, policy, attempt };
}
