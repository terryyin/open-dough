// A Board target observation can discover a delivery for an already-Done launch.
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  branchPinOwner,
  branchResultAtDone,
} from "../src/sessionBranchResult.ts";
import { sessionKey } from "../src/sessionReference.ts";
import type { RecordsDroppedByRetention } from "./launchRecordDocument.ts";
import {
  changeSessionRecord,
  keptRecords,
  keptSession,
} from "./launchRecordStore.ts";
import {
  inspectManualLanding,
  keepManualLanding,
  releaseManualLanding,
} from "./manualSessionLanding.ts";
import {
  observedSessionDeliveries,
  type ObservedDelivery,
  type ObservedSource,
} from "./observedSessionDeliveries.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";

// A fresh adapter starts as a restarted Dashboard would. Records its writes
// drop by retention go to `droppedByRetention` (`replaceRecords`).
export function sessionLandingObservations(
  inspect: typeof inspectManualLanding = inspectManualLanding,
  droppedByRetention?: RecordsDroppedByRetention,
) {
  const deliveries = observedSessionDeliveries({ inspect });
  return {
    async observe(source: ObservedSource, revision: string): Promise<void> {
      await deliveries.run(
        source,
        revision,
        () => keptRecords(source.id),
        (delivery) =>
          keepObservedDelivery(source.id, delivery, droppedByRetention),
      );
    },
  };
}

const liveObservations = sessionLandingObservations();

// Board reads and revision checks answer without waiting for the pass.
export function observeProjectRevision(
  pinned: PinnedTexts,
  source: PublishedSource,
  revision: string,
): void {
  pinned.namedByRef(source, revision);
  void liveObservations.observe(source, revision);
}

async function keepObservedDelivery(
  sourceId: string,
  { record, result, pair }: ObservedDelivery,
  droppedByRetention: RecordsDroppedByRetention | undefined,
) {
  let landing: LaunchRecord["landing"];
  try {
    await changeSessionRecord(
      sourceId,
      record.session,
      async (current) => {
        const live = branchResultAtDone(current);
        if (
          current.launchedAt !== record.launchedAt ||
          sessionKey(branchPinOwner(current)) !==
            sessionKey(branchPinOwner(record)) ||
          live?.doneAt !== result.doneAt ||
          live.repository !== result.repository ||
          live.base !== result.base ||
          live.revision !== result.revision ||
          live.committedTip !== result.committedTip
        )
          return current;
        landing = await keepManualLanding(current, pair);
        return landing === undefined ? current : { ...current, landing };
      },
      droppedByRetention,
    );
  } catch {
    if (
      landing !== undefined &&
      (await keptSession(sourceId, record.session))?.landing?.delivery !==
        landing.delivery
    )
      await releaseManualLanding(landing);
  }
}
