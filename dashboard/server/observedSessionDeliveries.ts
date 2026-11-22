import type { LaunchRecord } from "../src/launchRecord.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import {
  branchResultAtDone,
  type SessionBranchResult,
} from "../src/sessionBranchResult.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { defaultGitOutputLimit } from "./gitRunner.ts";
import {
  inspectManualLanding,
  manualLandingTrunk,
  type ManualLanding,
} from "./manualSessionLanding.ts";
import {
  branchTrunk,
  readBranchTrunkRevision,
} from "./sessionBranchAttribution.ts";

export type ObservedDelivery = {
  record: LaunchRecord;
  result: SessionBranchResult;
  pair: ManualLanding;
};

export type DeliveryInspection = {
  readTrunkHead?: typeof readBranchTrunkRevision;
  inspect?: typeof inspectManualLanding;
};

// Inspecting one record can yield before the next inspection. The store
// adapter can keep that delivery while the rest of the pass is still pending.
export async function* decideObservedDeliveries(
  records: readonly LaunchRecord[],
  ref: string,
  revision: string,
  {
    checked = new Set<string>(),
    readTrunkHead = readBranchTrunkRevision,
    inspect = inspectManualLanding,
  }: DeliveryInspection & { checked?: Set<string> } = {},
): AsyncGenerator<ObservedDelivery> {
  const heads = new Map<string, string | undefined>();
  for (const record of records) {
    const result = branchResultAtDone(record);
    const trunk = manualLandingTrunk(record);
    if (
      record.landing !== undefined ||
      result?.manualDeliveryChecked !== true ||
      trunk?.revision === undefined ||
      trunk.target !== branchTrunk(trunk.remote, ref).target ||
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
    if (!heads.has(target)) {
      try {
        heads.set(target, await readTrunkHead(trunk, call));
      } catch {
        heads.set(target, undefined);
      }
    }
    const authorizedHead = heads.get(target);
    if (authorizedHead === undefined) continue;

    let pair: ManualLanding | undefined;
    try {
      // The Board revision triggers the read. The saved launch's remote
      // target and committed tip establish its delivered pair.
      pair = await inspect(
        result.repository,
        result.committedTip,
        trunk,
        authorizedHead,
        call,
      );
    } catch {
      continue;
    }
    if (pair === undefined) checked.add(witness);
    else yield { record, result, pair };
  }
}

export type ObservedSource = Pick<PublishedSource, "id" | "ref">;

type ProjectObservation = {
  readonly revision: string;
  readonly checked: Set<string>;
  pass?: Promise<ObservedDelivery[]>;
};

// Each project's checked witnesses live for the last observed revision.
// Coalescing includes the records read and each delivery applied by a caller.
export function observedSessionDeliveries(inspection: DeliveryInspection = {}) {
  const observations = new Map<string, ProjectObservation>();

  function run(
    source: ObservedSource,
    revision: string,
    readRecords: () =>
      readonly LaunchRecord[] | Promise<readonly LaunchRecord[]>,
    apply?: (delivery: ObservedDelivery) => Promise<void>,
  ): Promise<ObservedDelivery[]> {
    let current = observations.get(source.id);
    if (current?.revision !== revision) {
      current = { revision, checked: new Set() };
      observations.set(source.id, current);
    }
    if (current.pass !== undefined) return current.pass;

    const observation = current;
    const deliveries: ObservedDelivery[] = [];
    observation.pass = Promise.resolve()
      .then(async () => {
        const records = await readRecords();
        for await (const delivery of decideObservedDeliveries(
          records,
          source.ref,
          revision,
          { ...inspection, checked: observation.checked },
        )) {
          if (apply !== undefined) await apply(delivery);
          deliveries.push(delivery);
        }
      })
      .then(
        () => deliveries,
        () => deliveries,
      )
      .finally(() => {
        delete observation.pass;
      });
    return observation.pass;
  }

  return {
    observe(
      source: ObservedSource,
      revision: string,
      records: readonly LaunchRecord[],
    ) {
      return run(source, revision, () => records);
    },
    run,
  };
}
