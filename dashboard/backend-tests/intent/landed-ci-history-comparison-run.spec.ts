// One landing's CI read through both typed readers over the same Git and CI
// evidence: the collection pass's kept history (../../server/landedCiPass.ts,
// ../../server/intentCiHistoryRead.ts) and the comparison's Landed endpoint
// (../../server/intentCiComparisonRead.ts), with no page. Both wait while no
// run or a queued run exists and agree on the completed exact build, which
// repeated delivery keeps once. Receipt-hour matching for the comparison:
// ./ci-comparison-finality-receipts.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { capturedComparisonLanding } from "../../test-support/support/capturedComparisonLanding.ts";
import {
  answer,
  baseline,
  comparisonProject,
  landing,
} from "../support/comparisonRead.ts";
import {
  finalityComparisonFacts,
  finalityIdentity,
  finalityRun,
} from "../support/finalityComparisonFacts.ts";
import { historyEntries, landedCiPass } from "../support/landedCiPassInputs.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";

test("history and comparison wait for no run and a queued run, then agree on the completed exact run, kept once through repeated delivery", async () => {
  const receivedAt = "2026-11-05T13:59:00.000Z";
  const now = () => Date.parse(receivedAt) + 60_000;
  const captured = capturedComparisonLanding(
    { identity: finalityIdentity, baseline, landingMerge: landing },
    receivedAt,
  );
  const record = makeMe.aLaunchRecord
    .executing({
      source: comparisonProject.id,
      identity: finalityIdentity,
      title: "Comparison",
    })
    .withCapturedLanding(captured)
    .please();
  const facts = finalityComparisonFacts("code");
  const evidence = storyCiComparisonEvidence({
    ...facts,
    now,
    receipts: {
      launchesByProject: new Map([[comparisonProject.id, [record]]]),
      retained: { kind: "document", document: {} },
    },
  });
  // The same landing delivered twice.
  const pass = landedCiPass({
    builds: evidence.builds,
    trunk: [landing],
    records: () => [record, record],
    project: comparisonProject,
    trunkHead: evidence.source.trunkHead,
    now,
  });
  const readers = async () => {
    await pass.collect();
    const history = await historyEntries(pass.home, comparisonProject);
    const comparison = await answer(evidence);
    if (comparison.kind !== "comparison") throw new Error("No comparison");
    return { history, landed: comparison.landed };
  };

  expect(await readers()).toMatchObject({
    history: [{ kind: "gap", reason: "pending", waitsFor: "run" }],
    landed: { kind: "none", requestedStatus: { kind: "no-build" } },
  });

  facts.runs[2] = makeMe.aRevisionCiRun
    .with({ ...finalityRun(landing, 103), status: "queued", conclusion: null })
    .please();
  expect(await readers()).toMatchObject({
    history: [
      { kind: "gap", reason: "pending", waitsFor: "build", runId: 103 },
    ],
    landed: { kind: "running", revision: landing, runId: 103 },
  });

  facts.runs[2] = finalityRun(landing, 103);
  const exact = {
    revision: landing,
    runId: 103,
    runAttempt: 1,
    startedAt: "2026-11-05T14:00:00Z",
    completedAt: "2026-11-05T14:04:00.000Z",
  };
  expect(await readers()).toMatchObject({
    history: [
      {
        kind: "point",
        ...exact,
        landings: [{ revision: landing, receivedAt, provenance: "exact" }],
      },
    ],
    landed: { kind: "build", selection: "exact", ...exact },
  });
  await pass.collect();
  const kept = await keptLandedCiHistory(comparisonProject.id, pass.home);
  expect(Object.keys(kept.landings)).toEqual([captured.receipt]);
  expect(Object.keys(kept.builds)).toEqual(["run/103/1"]);
});
