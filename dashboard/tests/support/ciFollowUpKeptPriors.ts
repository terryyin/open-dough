// The prior landings a machine keeps measured before a landing whose repeat a
// case observes (./ciFollowUpKeptLanding.ts): each recorded for a story's
// execution in the launch records, measured by its own passed build with that
// build's CI proof in the landed CI history, and, having been recorded before
// the machine enabled follow-up, held by the follow-up ledger with no
// eligibility. Their revisions are ones no repository holds: the history's
// kept trunk order alone places them.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  answeredLanding,
  landedRecord,
  minutesAgo,
} from "./landedCiHistory.ts";
import { passedFrom } from "./landedCiTrunk.ts";

// The CI proof the history keeps of the build of `revision` by `runId`.
export const keptProofOf = (revision: string, runId: number) =>
  makeMe.aCiProof
    .forRun({ revision, runId })
    .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
    .please();

// `count` prior landings onto `target`, oldest first, recorded one a minute
// up to two minutes ago, each measured by run 1, 2, … whose first attempt
// passed in `seconds`.
export function keptPriors(count: number, seconds: number, target: string) {
  const priors = Array.from(Array(count).keys(), (index) => {
    const id = index + 1;
    const landing = {
      title: `prior-${String(id)}`,
      revision: id.toString(16).padStart(40, "0"),
      receipt: `bbbbbbbb-0000-4000-8000-${String(id).padStart(12, "0")}`,
      at: minutesAgo(count + 2 - id),
    };
    const built = passedFrom(
      `2026-11-10T0${String(index)}:00:00.000Z`,
      seconds * 1000,
    );
    return { id, landing, built };
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
  };
}
