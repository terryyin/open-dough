// The prior landings a machine keeps measured before a landing whose repeat a
// case observes (./ciFollowUpKeptLanding.ts): each recorded for a story's
// execution in the launch records, measured by its own passed build with that
// build's CI proof in the landed CI history, and, having been recorded before
// the machine enabled follow-up, held by the follow-up ledger with no
// eligibility. They stand at revisions no repository holds, where the
// history's kept trunk order alone places them, or, for a receipt the product
// itself orders on trunk, at the landings a case published and recorded there.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { PriorBuildReference } from "../../src/ciPriorBuildReference.ts";
import { machineHome } from "../machineLaunchRecords.ts";
import {
  answeredLanding,
  keepLandedCiHistory,
  landedRecord,
  minutesAgo,
} from "./landedCiHistory.ts";
import { passedFrom } from "./landedCiTrunk.ts";
import { keptLaunchRecords } from "./launchStore.ts";
import type { StartOrigin } from "./startOrigin.ts";

// A landing as the machine's launch records hold it.
type RecordedLanding = Parameters<typeof landedRecord>[0];

// The CI proof the history keeps of the build of `revision` by `runId`.
export const keptProofOf = (revision: string, runId: number) =>
  makeMe.aCiProof
    .forRun({ revision, runId })
    .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
    .please();

// `count` landings at revisions no repository holds, oldest first, recorded
// one a minute up to two minutes ago.
export const landingsNoRepositoryHolds = (count: number): RecordedLanding[] =>
  Array.from(Array(count).keys(), (index) => ({
    title: `prior-${String(index + 1)}`,
    revision: (index + 1).toString(16).padStart(40, "0"),
    receipt: `bbbbbbbb-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    at: minutesAgo(count + 1 - index),
  }));

// `landings` onto `target` as prior landings, oldest first, each measured by
// run 1, 2, … whose first attempt passed in `seconds`.
export function keptPriors(
  landings: readonly RecordedLanding[],
  seconds: number,
  target: string,
) {
  const priors = landings.map((landing, index) => {
    const built = passedFrom(
      `2026-11-10T0${String(index)}:00:00.000Z`,
      seconds * 1000,
    );
    return { id: index + 1, landing, built };
  });
  return {
    // Their revisions, in trunk order.
    revisions: priors.map(({ landing }) => landing.revision),
    // `history` with each of them measured.
    measuredIn(history: typeof makeMe.aLandedCiHistory) {
      let measured = history;
      for (const { id, landing, built } of priors)
        measured = measured
          .measuredLanding({
            ...answeredLanding(landing),
            receipt: landing.receipt,
            repository: "open-dough",
            target,
            runId: id,
            startedAt: built.startedAt,
            completedAt: built.completedAt,
          })
          .proofFor(`run/${String(id)}/1`, keptProofOf(landing.revision, id));
      return measured;
    },
    // Their launch records.
    records: priors.map(({ landing }) => landedRecord(landing)),
    // Their ledger entries: a receipt that predates enabling never gains
    // eligibility.
    ledgerEntries: priors.map(({ landing }) =>
      makeMe.aCiFollowUpEntry
        .with({
          project: "open-dough",
          revision: landing.revision,
          target,
          receipts: [landing.receipt],
          eligible: false,
        })
        .please(),
    ),
    // The reference a request freezes for the landing at `endpoint` whose
    // build `selected` started at `date` and took `ms`, compared with them.
    referenceFor(
      endpoint: string,
      selected: { readonly key: string; readonly date: string; ms: number },
    ): PriorBuildReference {
      const dates = priors.map(({ built }) => built.startedAt);
      return {
        endpoint,
        selected,
        evidence: [
          ...priors.map(({ id, built }) => ({
            key: `run/${String(id)}/1`,
            date: built.startedAt,
            ms: seconds * 1000,
            status: "included" as const,
          })),
          { ...selected, status: "selected" },
        ],
        sampleCount: priors.length,
        medianMs: seconds * 1000,
        averageMs: seconds * 1000,
        ...(dates.length === 0 ? {} : { from: dates[0], to: dates.at(-1) }),
      };
    },
  };
}

// The landings the origin's machine recorded at `revisions`, in that order,
// kept as its history holds them once each is measured by run 1, 2, … whose
// first attempt passed in `seconds`: prior builds a collecting dashboard has
// no more to ask the provider about.
export async function keepRecordedPriorsMeasured(
  origin: StartOrigin,
  revisions: readonly string[],
  seconds: number,
): Promise<void> {
  const home = machineHome(origin.machine);
  const records = keptLaunchRecords(home);
  const landings = revisions.map((revision) => {
    const record = records.find(
      (each) => "landing" in each && each.landing?.revision === revision,
    );
    if (record === undefined || !("landing" in record) || !record.landing)
      throw new Error(`The machine recorded no landing at ${revision}.`);
    return {
      title: record.request.title,
      revision,
      receipt: record.landing.receipt,
      at: record.landing.receivedAt,
    };
  });
  const priors = keptPriors(landings, seconds, "refs/heads/main");
  await keepLandedCiHistory(
    home,
    priors
      .measuredIn(makeMe.aLandedCiHistory)
      .inTrunkOrder(priors.revisions)
      .please(),
  );
}
