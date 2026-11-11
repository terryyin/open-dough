import assert from "node:assert/strict";
import test from "node:test";
import { makeMe } from "./makeMe.mjs";
import {
  repeatDecisionOf,
  fullRepeatJobs,
  completedJobs,
} from "../../dashboard/server/ciFollowUpDecision.ts";

function cohort({
  seconds = 105,
  samples = 5,
  baseline = 100,
  selection = "exact",
  state = "pass",
  proof = true,
  timingBasis = "attempt-start",
} = {}) {
  const builder = makeMe.aLandedCiHistory;
  const revisions = [];
  for (let index = 0; index <= samples; index++) {
    const revision = String(index + 1).padStart(40, "0");
    revisions.push(revision);
    const runId = index + 1;
    const startedAt = `2026-11-10T0${index}:00:00.000Z`;
    const completedAt = new Date(
      Date.parse(startedAt) + (index === samples ? seconds : baseline) * 1000,
    ).toISOString();
    const landing = makeMe.aLaunchLanding
      .comparing({ base: "a".repeat(40), revision })
      .deliveredAs({
        receipt: `00000000-0000-4000-8000-${String(runId).padStart(12, "0")}`,
      })
      .please();
    builder.recording(
      landing,
      `run/${runId}/1`,
      makeMe.aKeptBuild
        .with({
          revision,
          runId,
          runAttempt: 1,
          startedAt,
          completedAt,
          state: index === samples ? state : "pass",
          timingBasis,
          ...(proof
            ? {
                proof: makeMe.aCiProof
                  .forRun({ revision, runId })
                  .entries([
                    makeMe.aCiProofEntry.at("tests").counting(1).please(),
                  ])
                  .please(),
              }
            : {}),
        })
        .please(),
      index === samples ? selection : "exact",
    );
  }
  return {
    history: builder.inTrunkOrder(revisions).please(),
    receipt: `00000000-0000-4000-8000-${String(samples + 1).padStart(12, "0")}`,
  };
}
for (const facts of [
  { seconds: 104, eligible: false },
  { seconds: 105, eligible: true },
  { seconds: 120, eligible: true },
  { seconds: 105, samples: 4, eligible: false },
  { baseline: 0, eligible: false },
  { state: "failed", eligible: false },
  { proof: false, eligible: false },
  { timingBasis: "workflow-created", eligible: false },
  { selection: "equivalent", eligible: false },
  { selection: "later", eligible: false },
]) {
  test(`shared reference admits only exact complete successful five-percent measurement: ${JSON.stringify(facts)}`, () => {
    const { history, receipt } = cohort(facts);
    const decision = repeatDecisionOf(history, receipt);
    assert.equal(decision !== undefined, facts.eligible);
    if (decision !== undefined) {
      assert.equal(decision.reference.averageMs, 100000);
      assert.equal(decision.reference.sampleCount, 5);
      assert.equal(
        decision.reference.evidence.filter(
          (entry) => entry.status === "included",
        ).length,
        5,
      );
    }
  });
}
const revision = "a".repeat(40);
const bounds = {
  runId: 7,
  revision,
  startedAt: "2026-11-10T01:00:00Z",
  completedAt: "2026-11-10T01:01:46Z",
};
const job = (facts) =>
  makeMe.aGitHubJob
    .withFacts({
      databaseId: 71,
      name: "proof",
      run_id: 7,
      head_sha: revision,
      started_at: "2026-11-10T00:00:00Z",
      completed_at: "2026-11-10T00:01:45Z",
      status: "completed",
      ...facts,
    })
    .please();
for (const [name, jobs, full] of [
  [
    "fresh full set without undocumented run_attempt",
    [
      job({
        databaseId: 72,
        started_at: bounds.startedAt,
        completed_at: bounds.completedAt,
      }),
    ],
    true,
  ],
  [
    "carried-forward ID",
    [job({ started_at: bounds.startedAt, completed_at: bounds.completedAt })],
    false,
  ],
  ["carried-forward bounds", [job({ databaseId: 72 })], false],
  ["missing job", [], false],
  [
    "different job set",
    [
      job({
        databaseId: 72,
        name: "partial",
        started_at: bounds.startedAt,
        completed_at: bounds.completedAt,
      }),
    ],
    false,
  ],
  [
    "wrong SHA",
    [
      job({
        databaseId: 72,
        head_sha: "b".repeat(40),
        started_at: bounds.startedAt,
        completed_at: bounds.completedAt,
      }),
    ],
    false,
  ],
])
  test(`full-repeat proof: ${name}`, () =>
    assert.equal(fullRepeatJobs([job({})], jobs, bounds), full));
test("pending, absent or reversed job bounds never invent completeness", () => {
  assert.equal(completedJobs([job({ status: "queued" })], bounds), undefined);
  assert.equal(
    completedJobs([job({ completed_at: undefined })], bounds),
    undefined,
  );
  assert.equal(
    completedJobs(
      [job({ started_at: bounds.completedAt, completed_at: bounds.startedAt })],
      bounds,
    ),
    undefined,
  );
});
