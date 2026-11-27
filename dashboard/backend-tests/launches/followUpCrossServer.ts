// The forked attempt owner for a follow-up that is still running.
// The spec forks itself and states the uncertain answer.
import assert from "node:assert/strict";
import { once } from "node:events";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { z } from "zod";
import { acceptLaunchRequest } from "../../server/agentLaunchAccept.ts";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import type { FollowUpContextInput } from "../../server/followUpAdmission.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import type { OwnedAttempt } from "../../server/ownedAttempts.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import {
  configuredProjects,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { preContinuationAnswer } from "../../server/launchPreAcceptance.ts";
import { StartProgress } from "../../server/startProgress.ts";
import {
  acceptanceSchema,
  type Acceptance,
  type AgentLaunchRequest,
} from "../../src/agentLaunch.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { sessionContextInput } from "./followUpAttemptIdentity.ts";

export const childMode = "--follow-up-cross-server-child";
export const storyIdentity = "SEED-A#running";
export const runningExplanation =
  "This start is already running on this machine. Wait for its result; nothing new was started.";
export const childAnswer = z.object({
  answer: acceptanceSchema,
  effects: z.number(),
});
export const attemptsFile = () => machineDashboardPath("launch-attempts.json");

export const waitForClose = ({ controller }: OwnedAttempt) =>
  once(controller.signal, "abort").then(() => ({
    kind: "failed" as const,
    reason: "refused" as const,
    explanation: "The test closed the attempt owner.",
  }));

function followUpReads(projectId: string): FollowUpContextInput {
  return {
    ...sessionContextInput(projectId, [], storyIdentity),
    keptSession,
  };
}

export function acceptFollowUp(
  owner: LaunchAttemptOwner,
  project: PublishedSource,
  request: AgentLaunchRequest,
  run: AttemptRun,
): Promise<Acceptance> {
  const progress = new StartProgress();
  return acceptLaunchRequest(
    owner,
    project,
    admittedLaunchRequest(request),
    run,
    (id) =>
      owner.continueAttempt(
        project.id,
        id,
        (kept) => preContinuationAnswer(project, id, kept, progress),
        run,
      ),
    followUpReads(project.id),
  );
}

// Signal only after a real acquisition found this machine's lock held.
function reportFirstLockWait(report: () => void): void {
  const lock = `${attemptsFile()}.lock`;
  const mkdirSync = fs.mkdirSync;
  fs.mkdirSync = (directory, options) => {
    try {
      return mkdirSync(directory, options);
    } catch (error) {
      if (
        directory === lock &&
        (error as NodeJS.ErrnoException).code === "EEXIST"
      ) {
        fs.mkdirSync = mkdirSync;
        syncBuiltinESMExports();
        report();
      }
      throw error;
    }
  };
  syncBuiltinESMExports();
}

export async function acceptInChild(watchLock: boolean): Promise<void> {
  const send = process.send?.bind(process);
  assert(send, "The independent attempt owner requires IPC.");
  if (watchLock) reportFirstLockWait(() => send("waiting-for-lock"));

  const owner = new LaunchAttemptOwner();
  const closed = once(process, "disconnect").then(() => {
    owner.close();
  });
  const requested = once(process, "message").then(
    (messages): unknown => messages[0],
  );
  send("ready");
  const message = await Promise.race([requested, closed]);
  if (message === undefined) return;

  // The parent configures the project before it sends this request.
  mountProjectConfiguration("development");
  const [project] = configuredProjects();
  assert(project, "The follow-up project is not configured.");

  let effects = 0;
  const run: AttemptRun = (own) => {
    effects += 1;
    return waitForClose(own);
  };
  const request = admittedLaunchRequest(message);
  const answer = await acceptFollowUp(owner, project, request, run);
  send({ answer, effects } satisfies z.input<typeof childAnswer>);
  await closed;
  await owner.drain();
}
