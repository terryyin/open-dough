// What a start writes to its store once its script has answered.

import type { EstablishedStart } from "../src/agentLaunch.ts";
import { keepsStart, type StartResult } from "./startResult.ts";
import { removeStart, updateStart, type StartsWorkflow } from "./startStore.ts";

// The established start an accepted result makes: the facts the script ran
// with, what it reported, and, for a rerun (`existing`) that omits claim
// facts, the ones already retained for this same start.
export function establishedStart(
  facts: Omit<EstablishedStart, "publishedSha">,
  result: Extract<StartResult, { kind: "accepted" }>,
  earlier: EstablishedStart | undefined,
): EstablishedStart {
  const agent = result.agent ?? earlier?.agent;
  const plan = result.plan ?? earlier?.plan;
  const startingRevision = result.startingRevision ?? earlier?.startingRevision;
  const candidateSha = result.candidateSha ?? earlier?.candidateSha;
  return {
    ...facts,
    publishedSha: result.publishedSha,
    ...(agent === undefined ? {} : { agent }),
    ...(plan === undefined ? {} : { plan }),
    ...(startingRevision === undefined ? {} : { startingRevision }),
    ...(candidateSha === undefined ? {} : { candidateSha }),
  };
}

// A store that cannot be written never fails a script that already ran.
export async function record(write: () => Promise<void>): Promise<void> {
  try {
    await write();
  } catch {
    // The launch's answer stands; the next start is chosen afresh.
  }
}

// Keeps what a stop that may have published a claim carries for a resume, and
// removes the start of any other stop, which left nothing to resume.
export async function recordStop(
  workflow: StartsWorkflow,
  sourceId: string,
  identity: string,
  result: Exclude<StartResult, { kind: "accepted" }>,
): Promise<void> {
  if (!keepsStart(result)) {
    await removeStart(sourceId, identity, workflow);
    return;
  }
  const recovery = result.kind === "stopped" ? result.recovery : undefined;
  if (recovery?.startingRevision && recovery.candidateSha) {
    await updateStart(
      sourceId,
      identity,
      {
        startingRevision: recovery.startingRevision,
        candidateSha: recovery.candidateSha,
      },
      workflow,
    );
  }
}
