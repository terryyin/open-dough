// One project's ordered collection pass of the landed CI history
// (`./landedCiCollection.ts` schedules it, owns its stop, reads the launch
// store and binds the CI providers). It walks the landings onto the
// project's configured ref, newest first, until the history holds
// `measuredWindow` measured builds for it (`./landedCiMeasuredBuilds.ts`),
// and resolves each landing whose resolution is not final yet over the
// project's CI read for the pass (`./landedCiResolution.ts`,
// `./landedCiCollectionLanding.ts`). The trunk order comes from Git in the
// project's checkout and the landings' own, unless the caller answers it;
// the clock bounding a landing's wait for its own run and the machine home
// whose history the pass keeps default to this machine's.
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
import { observationNow } from "./observationClock.ts";

// The trunk order of the candidates' revisions the project's local
// checkouts know.
export type LandingOrderRead = (
  candidates: readonly LandingReference[],
  stopped: AbortSignal,
) => Promise<readonly string[] | undefined>;

export type LandedCiPassInputs = {
  source: PublishedSource;
  receipts: readonly LaunchLanding[];
  history: ProjectHistory;
  stopped: AbortSignal;
  // The clock bounding a landing's wait for its own run.
  now?: () => number;
  // The machine home whose landed CI history the pass keeps.
  home?: string;
} & ({ repository: string } | { landingOrder: LandingOrderRead }) &
  Pick<Parameters<typeof collectLandingResolution>[0], "read" | "readProof">;

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

// Git's order in the project's checkout and each landing's own.
function gitLandingOrder(repository: string): LandingOrderRead {
  return (candidates, stopped) =>
    readLandingOrder(
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
}

export async function collectLandedCiPass(
  args: LandedCiPassInputs,
): Promise<void> {
  const { source, receipts, stopped, read, readProof, home } = args;
  let { history } = args;
  const candidates = trunkLandings(source, receipts, history);
  const landingOrder =
    "landingOrder" in args
      ? args.landingOrder
      : gitLandingOrder(args.repository);
  const localOrder = await landingOrder(candidates, stopped);
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
      ...(home === undefined ? {} : { home }),
      now: args.now ?? observationNow,
    });
    history = outcome.history;
    if (outcome.kind === "ended") return;
    if (outcome.kind === "stop-project") break;
    if (outcome.measuredBuild !== undefined)
      measured.add(outcome.measuredBuild);
  }
  if (order !== undefined) await keepLandedCiOrder(source.id, order, home);
}
