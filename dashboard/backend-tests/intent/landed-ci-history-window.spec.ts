// The bound of this machine's landed CI history under a collection pass
// (../../server/landedCiPass.ts, ../../server/landedCiMeasuredBuilds.ts): a
// pass walks a project's landings newest first until it holds 20 measured
// builds, resolving only landings not yet final, and the kept history holds
// only that window -- its landings, though no launch record names them any
// more, and their builds -- dropping older measured landings, an older gap and
// a stale pending landing, which no pass asks CI about again
// (SEED-285#see-landed-ci-wall-time-history example 8). Which entries a read
// answers from a fuller history is ./landed-ci-history-read-window.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import {
  keepHistory,
  landedCiPassInputs,
  passProject,
} from "../support/landedCiPassInputs.ts";

const day = 24 * 60 * 60_000;
const start = Date.parse("2026-09-01T12:00:00Z");
const at = (ms: number) => new Date(ms).toISOString();
const receipt = (n: number) =>
  `ffffffff-0000-4000-8000-${String(n).padStart(12, "0")}`;

test("once a pass holds 20 measured builds, the kept history holds only that window's landings and builds, dropping older ones and a stale pending landing, and resolves only landings not yet final", async () => {
  // Kept from earlier passes, oldest first: a pending landing a pass never
  // reached again, a landing CI never built, then 20 measured landings, one
  // a day, whose launch records have all expired.
  const measured = [...Array(20).keys()].map((n) => ({
    receipt: receipt(10 + n),
    revision: (0x10 + n).toString(16).repeat(20),
    receivedAt: at(start + n * day),
    runId: 300 + n,
    startedAt: at(start + n * day),
    completedAt: at(start + n * day + 6 * 60_000),
  }));
  // Two new landings, recorded in the last minutes, both built.
  const fresh = [
    { revision: "a1".repeat(20), receipt: receipt(100), runId: 401 },
    { revision: "a2".repeat(20), receipt: receipt(101), runId: 402 },
  ];
  const trunk = [
    "f0".repeat(20),
    "f1".repeat(20),
    ...measured.map((landing) => landing.revision),
    ...fresh.map((landing) => landing.revision),
  ];
  const pass = landedCiPassInputs(trunk, {
    runs: () =>
      fresh.map(({ revision, runId }) =>
        makeMe.aRevisionCiRun
          .with({
            headSha: revision,
            databaseId: runId,
            startedAt: "2026-11-05T10:00:00Z",
            completedAt: "2026-11-05T10:06:05Z",
          })
          .please(),
      ),
    records: () =>
      fresh.map(({ revision, receipt }, n) =>
        makeMe.aLaunchRecord
          .executing({ identity: `SEED-9#fresh-${String(n)}`, title: "t" })
          .launchedAt(at(Date.now() - (2 - n) * 60_000))
          .landedAt(revision, { receipt })
          .please(),
      ),
  });
  let kept = makeMe.aLandedCiHistory
    .pendingLanding({
      receipt: receipt(0),
      revision: "f0".repeat(20),
      receivedAt: at(start - 2 * day),
      waitsFor: "build",
    })
    .unmeasuredLanding({
      receipt: receipt(1),
      revision: "f1".repeat(20),
      receivedAt: at(start - day),
      reason: "no-build",
    });
  for (const landing of measured) kept = kept.measuredLanding(landing);
  await keepHistory(pass.home, kept.inTrunkOrder(trunk).please());

  await pass.collect();

  // The window: the two new landings and the 18 newest kept ones.
  const window = [...measured.slice(2), ...fresh];
  const history = await keptLandedCiHistory(passProject.id, pass.home);
  expect(Object.keys(history.landings).sort()).toEqual(
    window.map((each) => each.receipt).sort(),
  );
  expect(Object.keys(history.builds).sort()).toEqual(
    window.map((each) => `run/${String(each.runId)}/1`).sort(),
  );
  // Only the new landings' runs were asked for.
  expect(new Set(pass.asked.runsAt)).toEqual(
    new Set(fresh.map(({ revision }) => revision)),
  );
});
