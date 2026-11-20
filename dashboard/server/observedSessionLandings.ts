// A Board target observation can discover a delivery for an already-Done launch.
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  branchPinOwner,
  branchResultAtDone,
} from "../src/sessionBranchResult.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { defaultGitOutputLimit } from "./gitRunner.ts";
import {
  changeSessionRecord,
  keptRecords,
  keptSession,
} from "./launchRecordStore.ts";
import {
  inspectManualLanding,
  keepManualLanding,
  manualLandingTrunk,
  releaseManualLanding,
} from "./manualSessionLanding.ts";
import type { PinnedTexts } from "./pinnedTexts.ts";
import {
  branchTrunk,
  readBranchTrunkRevision,
} from "./sessionBranchAttribution.ts";

type ObservedSource = Pick<PublishedSource, "id" | "ref">;

type ProjectObservation = {
  readonly revision: string;
  readonly checked: Set<string>;
  pass: Promise<void> | undefined;
};

// The process-lifetime owner of observed deliveries: it holds each project's
// checked witnesses and in-flight pass for the revision it last observed.
// A fresh owner starts as a restarted Dashboard would.
export function sessionLandingObservations(
  inspect: typeof inspectManualLanding = inspectManualLanding,
) {
  const observations = new Map<string, ProjectObservation>();
  return {
    observe(source: ObservedSource, revision: string): Promise<void> {
      let observation = observations.get(source.id);
      if (observation?.revision !== revision) {
        observation = { revision, checked: new Set(), pass: undefined };
        observations.set(source.id, observation);
      }
      if (observation.pass !== undefined) return observation.pass;
      const current = observation;
      const settle = () => {
        current.pass = undefined;
      };
      current.pass = captureObservedLandings(source, current, inspect).then(
        settle,
        settle,
      );
      return current.pass;
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

async function captureObservedLandings(
  source: ObservedSource,
  { revision, checked }: ProjectObservation,
  inspect: typeof inspectManualLanding,
) {
  const heads = new Map<string, string | undefined>();
  for (const record of await keptRecords(source.id)) {
    const result = branchResultAtDone(record);
    const trunk = manualLandingTrunk(record);
    if (
      record.landing !== undefined ||
      result?.manualDeliveryChecked !== true ||
      trunk?.revision === undefined ||
      trunk.target !== branchTrunk(trunk.remote, source.ref).target ||
      trunk.revision === revision
    )
      continue;
    const target = JSON.stringify([
      result.repository,
      trunk.remote,
      trunk.target,
    ]);
    const witness = JSON.stringify([
      target,
      trunk.revision,
      sessionKey(record.session),
      record.launchedAt,
      result.doneAt,
      result.base,
      result.revision,
      result.committedTip,
    ]);
    if (checked.has(witness)) continue;

    const call = {
      cwd: result.repository,
      signal: AbortSignal.timeout(30_000),
      maxBuffer: defaultGitOutputLimit,
    };
    if (!heads.has(target))
      heads.set(target, await readBranchTrunkRevision(trunk, call));
    const authorizedHead = heads.get(target);
    if (authorizedHead === undefined) continue;
    let landing: LaunchRecord["landing"];
    try {
      // The Board revision triggers the read. The saved launch's remote
      // target and committed tip establish its delivered pair.
      const pair = await inspect(
        result.repository,
        result.committedTip,
        trunk,
        authorizedHead,
        call,
      );
      if (pair === undefined) {
        checked.add(witness);
        continue;
      }

      await changeSessionRecord(source.id, record.session, async (current) => {
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
      });
    } catch {
      if (
        landing !== undefined &&
        (await keptSession(source.id, record.session))?.landing?.delivery !==
          landing.delivery
      )
        await releaseManualLanding(landing);
    }
  }
}
