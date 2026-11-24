// One ordered collection pass of the landed CI history
// (`./landedCiCollection.ts` schedules it and owns its stop). For each
// project it walks the landings onto the project's configured ref, newest
// first, until the history holds `measuredWindow` measured builds for it
// (`./landedCiMeasuredBuilds.ts`), and resolves each landing whose resolution
// is not final yet over the project's CI read for the pass
// (`./landedCiResolution.ts`, `./landedCiCollectionLanding.ts`). The pass
// takes the projects, their launch records, the Git landing order, the CI
// read, the proof read, the clock bounding a landing's wait for its own run,
// the machine whose history it keeps and the follow-up collection it uses as
// inputs; production binds them to this machine's
// configuration, records, checkouts and providers.

import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { readWaitLimitMs } from "../src/authenticatedReadRules.ts";
import {
  keepLandedCiOrder,
  keptLandedCiHistory,
  keptLandingReferences,
  type LandingReference,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import { collectLandingResolution } from "./landedCiCollectionLanding.ts";
import type { ProofRead } from "./landedCiCollectedProof.ts";
import {
  measuredWindow,
  newestFirst,
  mostCompleteLandingOrder,
} from "./landedCiMeasuredBuilds.ts";
import type { passRead } from "./landedCiResolution.ts";

export type LandedCiPassInputs = {
  projects: readonly PublishedSource[];
  records: ReadonlyMap<string, readonly LaunchRecord[]>;
  // The trunk order of the candidates' revisions the project's local
  // checkouts know.
  landingOrder: (
    source: PublishedSource,
    candidates: readonly LandingReference[],
    stopped: AbortSignal,
  ) => Promise<readonly string[] | undefined>;
  read: typeof passRead;
  readProof: ProofRead;
  // The clock bounding a landing's wait for its own run.
  now: () => number;
  // The machine home whose landed CI history the pass reads and keeps.
  home: string;
  followUps: (
    source: PublishedSource,
    history: ProjectHistory,
    signal: AbortSignal,
  ) => Promise<void>;
  stopped: AbortSignal;
};

function proofSignal(stopped: AbortSignal): AbortSignal {
  return AbortSignal.any([stopped, AbortSignal.timeout(readWaitLimitMs)]);
}

// The landings onto the project's configured ref that its records name, with
// those the history keeps, each once by receipt. Local and retained ancestry
// order them before collection can select or prune measurements.
function trunkLandings(
  source: PublishedSource,
  records: readonly LaunchRecord[],
  history: ProjectHistory,
): LandingReference[] {
  const target = `refs/heads/${source.ref}`;
  const byReceipt = new Map<string, LandingReference>();
  for (const landing of keptLandingReferences(history))
    byReceipt.set(landing.receipt, landing);
  for (const { landing } of records)
    if (landing?.target === target) byReceipt.set(landing.receipt, landing);
  return [...byReceipt.values()];
}

export async function collectLandedCiPass(
  inputs: LandedCiPassInputs,
): Promise<void> {
  for (const source of inputs.projects) {
    if (inputs.stopped.aborted) return;
    await collectProject(inputs, source);
  }
}

async function collectProject(
  inputs: LandedCiPassInputs,
  source: PublishedSource,
): Promise<void> {
  const { stopped, home, readProof } = inputs;
  const ended = () => stopped.aborted;
  let history = await keptLandedCiHistory(source.id, home);
  const candidates = trunkLandings(
    source,
    inputs.records.get(source.id) ?? [],
    history,
  );
  const localOrder = await inputs.landingOrder(source, candidates, stopped);
  const order = mostCompleteLandingOrder(candidates, [
    history.trunkOrder,
    localOrder,
  ]);
  const landings = candidates.sort(newestFirst(order));
  const read = inputs.read(source, stopped);
  const measured = new Set<string>();
  for (const landing of landings) {
    if (ended()) return;
    if (measured.size >= measuredWindow) break;
    const outcome = await collectLandingResolution({
      source,
      landing,
      history,
      order,
      read,
      proofSignal: proofSignal(stopped),
      ended,
      home,
      readProof,
      now: inputs.now,
    });
    history = outcome.history;
    if (outcome.kind === "ended") return;
    if (outcome.kind === "stop-project") break;
    if (outcome.measuredBuild !== undefined)
      measured.add(outcome.measuredBuild);
  }
  if (order !== undefined) await keepLandedCiOrder(source.id, order, home);
  if (!ended())
    await inputs.followUps(
      source,
      await keptLandedCiHistory(source.id, home),
      proofSignal(stopped),
    );
}
