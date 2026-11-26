// Execution start uses the selected installed skill's script and formatter;
// the dashboard owns arguments, while the script owns publication/recovery.

import type { StoryLaunchRequest } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { launchHost } from "./launchHosts.ts";
import { establishesStart, runStartScript } from "./executionStartCommands.ts";
import type { LocalFolder } from "./localFolder.ts";
import type { WorkflowProgress } from "./startProgress.ts";
import { continuedStart, policyArguments } from "./startPolicy.ts";
import { lostStartArguments, ownerOf } from "./startGit.ts";
import {
  gatedStart,
  startChoice,
  publisherId,
  type PlannedStart,
  type StartAttempt,
  type StoryStartRuntime,
} from "./startLaunch.ts";
import {
  establishedOneShot,
  establishedStart,
  record,
  recordStop,
} from "./startRecording.ts";
import { keepsStart, refusal } from "./startResult.ts";
import { resumeArguments } from "./startStore.ts";

// Runs one start, registered in progress before the script starts.
export async function beginStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: LocalFolder,
  progress: WorkflowProgress,
  runtime: StoryStartRuntime,
): Promise<PlannedStart> {
  if (!(await establishesStart(project, request.host))) {
    return { kind: "not-applicable" };
  }
  return gatedStart(source, request, project, progress, "Take", () =>
    runningStart(source, request, project, progress, runtime),
  );
}

// The start of a story registered in `progress`: keeps it, then runs its
// script. A one-shot start publishes no claim: it names no publisher, takes
// publication authority only for an automatic landing, and never resumes a
// claim; one kept with its established context goes on from it as it is.
async function runningStart(
  source: PublishedSource,
  request: StoryLaunchRequest,
  project: LocalFolder,
  progress: WorkflowProgress,
  { store, env, noteWorker }: StoryStartRuntime,
): Promise<PlannedStart> {
  // A start kept from an earlier launch of the story is resumed as it was.
  const kept = await store.kept(source.id, request.identity);
  const { workspace, branch, model, effort, policy } = await startChoice(
    project,
    request,
    kept,
    source.ref,
  );
  const oneShot = policy.tracking === "one-shot";
  if (!oneShot && kept?.start === undefined) {
    const explanation = await launchHost(request.host)?.executionStartRefusal?.(
      workspace,
      env,
    );
    if (explanation !== undefined) {
      progress.clear(source.id, request.identity);
      return { kind: "refused", explanation };
    }
  }
  if (oneShot && kept?.start !== undefined) {
    progress.set(source.id, request.identity, {
      phase: "launching",
      host: request.host,
    });
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
  await store.keep(source.id, {
    ...kept,
    host: request.host,
    identity: facts.identity,
    ...(oneShot ? { policy } : { publisherId: facts.publisherId }),
    workspace: facts.workspace,
    branch: facts.branch,
    ...(model === undefined ? {} : { model }),
    ...(effort === undefined ? {} : { effort }),
    startedAt: new Date().toISOString(),
  });
  const attempt = runStartScript(
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
    noteWorker,
    env,
  ).then(async (result): Promise<StartAttempt> => {
    // The record follows the script's result even when the launch stopped
    // waiting for it.
    if (result.kind === "accepted" || result.kind === "prepared") {
      progress.set(source.id, request.identity, {
        phase: "launching",
        host: request.host,
      });
      const start =
        result.kind === "accepted"
          ? establishedStart(facts, result, kept?.start)
          : establishedOneShot(where, result, policy);
      await record(() => store.update(source.id, request.identity, { start }));
      return { kind: "established", start };
    }
    try {
      await record(() =>
        recordStop(store, source.id, request.identity, result),
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
