// Retain a trunk-ordered series of measured landings for prior-build and
// measure-history journeys: each value is one build's kept time without
// runner waits (via the history builder's wall-interval default).
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepLandedCiHistory } from "./landedCiHistory.ts";

export async function keepLandedCiMeasurements(
  home: string,
  values: readonly number[],
  selectedProof = true,
) {
  const history = makeMe.aLandedCiHistory;
  const order = Array.from(values.keys(), (index) =>
    (index + 1).toString(16).padStart(40, "0"),
  );
  for (const [index, ms] of values.entries()) {
    const revision = order[index];
    if (revision === undefined)
      throw new Error("Measurement revision is missing");
    const startedAt = `2026-11-0${index + 1}T10:00:00Z`;
    history.measuredLanding({
      receipt: String(index),
      revision,
      receivedAt: startedAt,
      runId: index + 1,
      startedAt,
      completedAt: new Date(Date.parse(startedAt) + ms).toISOString(),
    });
    if (selectedProof || index < values.length - 1)
      history.proofFor(
        `run/${index + 1}/1`,
        makeMe.aCiProof
          .forRun({ revision, runId: index + 1 })
          .entries([makeMe.aCiProofEntry.at("tests").counting(1).please()])
          .please(),
      );
  }
  await keepLandedCiHistory(home, history.inTrunkOrder(order).please());
}
