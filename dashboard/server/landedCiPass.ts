// One project's ordered collection pass. The caller owns scheduling,
// launch-store reads, and the CI providers used for this pass.
import type { LaunchLanding } from "../src/launchLanding.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  keepLandedCiOrder,
  keptLandingReferences,
  type LandingReference,
  type ProjectHistory,
} from "./landedCiHistoryStore.ts";
import { collectLandingResolution } from "./landedCiCollectionLanding.ts";
import {
  measuredWindow,
  mostCompleteLandingOrder,
  newestFirst,
} from "./landedCiMeasuredBuilds.ts";
import { readLandingOrder } from "./launchLandingGit.ts";
import { landedCiReadSignal } from "./landedCiPassRead.ts";

function trunkLandings(
  source: PublishedSource,
  receipts: readonly LaunchLanding[],
  history: ProjectHistory,
): LandingReference[] {
  const target = `refs/heads/${source.ref}`;
  const byReceipt = new Map<string, LandingReference>();
  for (const landing of keptLandingReferences(history))
    byReceipt.set(landing.receipt, landing);
  for (const landing of receipts)
    if (landing.target === target) byReceipt.set(landing.receipt, landing);
  return [...byReceipt.values()];
}

export async function collectLandedCiPass(
  args: {
    source: PublishedSource;
    receipts: readonly LaunchLanding[];
    history: ProjectHistory;
    repository: string;
    stopped: AbortSignal;
  } & Pick<
    Parameters<typeof collectLandingResolution>[0],
    "read" | "readProof"
  >,
): Promise<void> {
  const { source, receipts, repository, stopped, read, readProof } = args;
  let { history } = args;
  const candidates = trunkLandings(source, receipts, history);
  const localOrder = await readLandingOrder(
    [
      ...candidates.flatMap((landing) =>
        landing.repository === undefined ? [] : [landing.repository],
      ),
      repository,
    ],
    candidates.map((landing) => landing.revision),
    undefined,
    stopped,
  );
  const order = mostCompleteLandingOrder(candidates, [
    history.trunkOrder,
    localOrder,
  ]);
  const landings = candidates.sort(newestFirst(order));
  const measured = new Set<string>();
  for (const landing of landings) {
    if (stopped.aborted) return;
    if (measured.size >= measuredWindow) break;
    const outcome = await collectLandingResolution({
      source,
      landing,
      history,
      order,
      read,
      readProof,
      proofSignal: landedCiReadSignal(stopped),
      ended: () => stopped.aborted,
    });
    history = outcome.history;
    if (outcome.kind === "ended") return;
    if (outcome.kind === "stop-project") break;
    if (outcome.measuredBuild !== undefined)
      measured.add(outcome.measuredBuild);
  }
  if (order !== undefined) await keepLandedCiOrder(source.id, order);
}
