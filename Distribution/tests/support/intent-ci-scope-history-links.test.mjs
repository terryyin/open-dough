import assert from "node:assert/strict";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { scopeHistoryOf } from "../../../dashboard/server/ciScopeHistory.ts";
import { ciScopeHistorySchema } from "../../../dashboard/src/ciScopeHistory.ts";

for (const [linkKind, runUrl] of [
  ["malformed HTTP", "https://"],
  ["non-web", "javascript:alert(1)"],
]) {
  for (const identityKind of ["native", "adapter"]) {
    test(`a ${identityKind} measured point keeps 100 ms and its identity while omitting a ${linkKind} run link`, () => {
      const landing = makeMe.aLaunchLanding
        .comparing({ base: "0".repeat(40), revision: "a".repeat(40) })
        .deliveredAs({ delivery: "measured", receipt: "measured" })
        .please();
      const identity =
        identityKind === "native"
          ? { runId: 51, runAttempt: 2 }
          : {
              adapterAttempt: {
                runId: "adapter-run",
                attemptId: "adapter-attempt",
              },
            };
      const entry = makeMe.aCiProofEntry
        .at("tests")
        .counting(1, "case")
        .timed(100)
        .please();
      const proof = (
        identityKind === "native"
          ? makeMe.aCiProof.forRun({
              revision: landing.revision,
              runId: 51,
              runAttempt: 2,
            })
          : makeMe.aCiProof.forAdapter({
              revision: landing.revision,
              attemptId: "adapter-attempt",
            })
      )
        .entries([entry])
        .please();
      const history = makeMe.aLandedCiHistory
        .inTrunkOrder([landing.revision])
        .recording(
          landing,
          "measured-attempt",
          makeMe.aKeptBuild
            .with({
              revision: landing.revision,
              state: "pass",
              ...identity,
              runUrl,
              startedAt: "2026-11-05T10:00:00Z",
              completedAt: "2026-11-05T10:01:00Z",
              proof,
            })
            .please(),
        )
        .please();

      const answer = scopeHistoryOf(
        history,
        "tests",
        { revision: landing.revision, at: landing.receivedAt },
        [landing.revision],
      );
      assert.equal(ciScopeHistorySchema.safeParse(answer).success, true);
      assert.equal(answer.entries.length, 1);
      const point = answer.entries[0];
      assert.equal(point.kind, "point");
      assert.equal(
        point.readings.find((reading) => reading.unit === "case")?.ms,
        100,
      );
      assert.deepEqual(point.build, {
        revision: landing.revision,
        provenance: "exact",
        ...identity,
      });
      assert.equal("runUrl" in point.build, false);
    });

    test(`a ${identityKind} pending gap keeps its identity while omitting a ${linkKind} run link`, () => {
      const landing = makeMe.aLaunchLanding
        .comparing({ base: "0".repeat(40), revision: "b".repeat(40) })
        .deliveredAs({ delivery: "pending", receipt: "pending" })
        .please();
      const identity =
        identityKind === "native"
          ? { runId: 51, runAttempt: 2 }
          : {
              adapterAttempt: {
                runId: "adapter-run",
                attemptId: "adapter-attempt",
              },
            };
      const history = makeMe.aLandedCiHistory
        .inTrunkOrder([landing.revision])
        .pending(landing, {
          kind: "pending",
          waitsFor: "build",
          run: { ...identity, runUrl },
        })
        .please();

      const answer = scopeHistoryOf(
        history,
        "tests",
        { revision: landing.revision, at: landing.receivedAt },
        [landing.revision],
      );
      assert.equal(ciScopeHistorySchema.safeParse(answer).success, true);
      assert.equal(answer.entries.length, 1);
      const gap = answer.entries[0];
      assert.equal(gap.kind, "gap");
      assert.match(gap.reason, /pending/i);
      assert.deepEqual(gap.run, identity);
      assert.equal("runUrl" in gap.run, false);
      assert.equal("ms" in gap, false);
      assert.equal("build" in gap, false);
    });
  }
}
