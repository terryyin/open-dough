// A Board target observation can discover a delivery for an already-Done launch.
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  branchPinOwner,
  branchResultAtDone,
} from "../src/sessionBranchResult.ts";
import { sessionKey } from "../src/sessionReference.ts";
import {
  changeSessionRecord,
  keptRecords,
  sessionRecord,
} from "./launchRecordStore.ts";
import {
  keepManualLanding,
  releaseManualLanding,
} from "./manualSessionLanding.ts";
import {
  observedSessionDeliveries,
  type DeliveryInspection,
  type ObservedDelivery,
  type ObservedSource,
} from "./observedSessionDeliveries.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";

export type ObservedLandingStore = {
  keptRecords: typeof keptRecords;
  changeSessionRecord: typeof changeSessionRecord;
};

// A fresh adapter rediscovers deliveries from the store's currently kept
// records, as a restarted Dashboard would.
export function sessionLandingObservations({
  store = { keptRecords, changeSessionRecord },
  ...inspection
}: DeliveryInspection & { store?: ObservedLandingStore } = {}) {
  const deliveries = observedSessionDeliveries(inspection);
  return {
    async observe(source: ObservedSource, revision: string): Promise<void> {
      await deliveries.run(
        source,
        revision,
        () => store.keptRecords(source.id),
        (delivery) => keepObservedDelivery(store, source.id, delivery),
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
  store: ObservedLandingStore,
  sourceId: string,
  { record, result, pair }: ObservedDelivery,
) {
  let landing: LaunchRecord["landing"];
  let saved: LaunchRecord | undefined;
  try {
    saved = await store.changeSessionRecord(
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
          live.committedTip !== result.committedTip
        )
          return current;
        landing = await keepManualLanding(current, pair);
        return landing === undefined ? current : { ...current, landing };
      },
    );
  } catch {
    // A write can throw after the record was saved.
  }
  if (landing === undefined || saved?.landing?.delivery === landing.delivery)
    return;
  const kept = sessionRecord(await store.keptRecords(sourceId), record.session);
  if (kept?.landing?.delivery !== landing.delivery)
    await releaseManualLanding(landing);
}
