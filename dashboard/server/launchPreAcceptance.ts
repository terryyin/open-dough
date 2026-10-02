// What a launch, or a kept attempt's continuation, is answered before it is
// accepted (`./agentLaunches.ts`), with nothing started: a missing project
// folder, a host's creation awaiting reconciliation (`./launchCreation.ts`),
// or the start's own pre-launch answer (`./launchStart.ts`).

import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { recordedRequest } from "./hostLaunch.ts";
import type { Unaccepted } from "./launchAttemptConflicts.ts";
import { creationProblem } from "./launchCreation.ts";
import { launchHost } from "./launchHosts.ts";
import { creationOf, pendingInputOf } from "./launchRecordStore.ts";
import { unconfirmedStart } from "./launchStart.ts";
import { folderExists, projectFolder } from "./projectFolders.ts";

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
