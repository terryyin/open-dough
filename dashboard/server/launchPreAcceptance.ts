// What a launch, or a kept attempt's continuation, is answered before it is
// accepted (`./agentLaunches.ts`), with nothing started: a missing project
// folder, a host's creation awaiting reconciliation (`./launchCreation.ts`),
// or the start's own pre-launch answer (`./launchStart.ts`).

import {
  policyOf,
  recordedWorkspace,
  unattachedPolicyOf,
  type AgentLaunchRequest,
} from "../src/agentLaunch.ts";
import type { StopUnconfirmedFound } from "../src/sessionStop.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { recordedRequest } from "./hostLaunch.ts";
import {
  startStillRunning,
  type Unaccepted,
} from "./launchAttemptConflicts.ts";
import { runsSessionStart } from "./unattachedStartScript.ts";
import type { StartProgress } from "./startProgress.ts";
import { creationProblem } from "./launchCreation.ts";
import { launchHost } from "./launchHosts.ts";
import {
  creationOf,
  keptRecords,
  pendingInputOf,
} from "./launchRecordStore.ts";
import { unconfirmedStart } from "./launchStart.ts";
import {
  folderExists,
  localFolder,
  projectFolder,
  type ProjectFolder,
} from "./projectFolders.ts";
import { keptStart } from "./startStore.ts";
import { startOf } from "./startWorkflows.ts";

// The workspace a new launch would write in, where that is known before
// acceptance: the project's default checkout, or a kept start's workspace
// it resumes. A fresh isolated workspace is new, so it names none here.
async function replacementWorkspace(
  source: PublishedSource,
  request: AgentLaunchRequest,
  folder: ProjectFolder,
): Promise<string | undefined> {
  if (request.workflow === "ad-hoc") {
    return unattachedPolicyOf(request).workspace === "default-checkout"
      ? folder.path
      : undefined;
  }
  const kept =
    startOf(request.workflow) === undefined
      ? undefined
      : await keptStart(source.id, request.identity, request.workflow);
  if (kept !== undefined) return localFolder(kept.workspace).path;
  return policyOf(request).workspace === "default-checkout"
    ? folder.path
    : undefined;
}

// A replacement-writer block: while a kept record for this project carries
// an unconfirmed stop, starting a replacement session for the same
// workspace is refused, naming the competing-writer risk, unless the
// request explicitly overrides it. A confirmed stop (or none) blocks
// nothing. This runs on the launch accept path only; continuations of
// kept attempts keep their existing admission.
export async function replacementWriterBlock(
  source: PublishedSource,
  request: AgentLaunchRequest,
): Promise<StopUnconfirmedFound | undefined> {
  if (request.overrideStopUnconfirmed === true) return undefined;
  const folder = projectFolder(source);
  const workspace = await replacementWorkspace(source, request, folder);
  if (workspace === undefined) return undefined;
  const blocked = (await keptRecords(source.id)).find((record) => {
    const recordWorkspace = recordedWorkspace(record);
    return (
      record.stopUnconfirmed !== undefined &&
      record.doneAt === undefined &&
      recordWorkspace !== undefined &&
      localFolder(recordWorkspace).path === workspace
    );
  });
  if (blocked?.stopUnconfirmed === undefined) return undefined;
  return {
    kind: "stop-unconfirmed",
    explanation: `A replacement session was not started for this workspace. ${blocked.stopUnconfirmed} Starting another session here risks a competing writer in the same workspace.`,
    workspace,
  };
}

export async function preAcceptanceAnswer(
  source: PublishedSource,
  request: AgentLaunchRequest,
): Promise<Unaccepted | undefined> {
  const folder = projectFolder(source);
  if (!(await folderExists(folder))) {
    return {
      kind: "failed",
      reason: "folder-not-found",
      explanation: `The project folder ${folder.shown} was not found on this machine. Nothing was launched.`,
    };
  }
  const boundary = launchHost(request.host);
  const creation = creationProblem(
    boundary,
    boundary?.creationEvidence === undefined
      ? undefined
      : await creationOf(recordedRequest(request, new Date())),
  );
  if (creation !== undefined)
    return {
      kind: "uncertain",
      reason: "unconfirmed",
      explanation: creation,
    };
  return (await pendingInputOf(source.id, request)) === undefined
    ? unconfirmedStart(source, request, folder)
    : undefined;
}

// A continuation first protects the retained start still running on this server.
export function preContinuationAnswer(
  source: PublishedSource,
  id: string,
  request: AgentLaunchRequest,
  progress: StartProgress,
): Promise<Unaccepted | undefined> {
  const session = request.workflow === "ad-hoc";
  const running = session
    ? runsSessionStart(id)
    : progress.for(request.workflow).running(source.id, request.identity);
  return running
    ? Promise.resolve(startStillRunning(session ? "session" : "story"))
    : preAcceptanceAnswer(source, request);
}
