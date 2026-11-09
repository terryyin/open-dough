// An answered corrupt archive stays a proof gap across collector restart;
// another attempt supplies an observable barrier after the skipped attempt.
import path from "node:path";
import type { CiRunAnswer } from "../../tests/support/baseCiActions.ts";
import { retainedHistory } from "../../tests/support/collectedScopeHistory.ts";
import {
  landedRecord,
  minutesAgo,
} from "../../tests/support/landedCiHistory.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  passedFrom,
  publishedLanding,
  runningFrom,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";
import {
  serveCollectedTrunkRuns,
  type CollectedTrunkProofs,
} from "../../tests/support/landedCiScopeProofs.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { collectedScopeFileSummary } from "../../tests/support/scopeHistoryProofs.ts";

test.use({ serverMode: "boundary" });

test("a final corrupt exact proof is not reacquired when another pending attempt completes after restart", async ({
  origin,
  github,
  startServer,
}) => {
  const home = path.join(origin.machine, "home");
  const older = await publishedLanding(origin, {
    title: "pending-barrier",
    receipt: "eeeeeeee-0000-4000-8000-000000000092",
    at: minutesAgo(10),
  });
  const corrupt = await publishedLanding(origin, {
    title: "corrupt-final",
    receipt: "eeeeeeee-0000-4000-8000-000000000093",
    at: minutesAgo(5),
  });
  const corruptRun = trunkRun(
    corrupt.revision,
    93,
    passedFrom(corrupt.at, 1000),
  );
  let runs: readonly CiRunAnswer[] = [
    trunkRun(older.revision, 92, runningFrom(older.at)),
    corruptRun,
  ];
  let proofs: CollectedTrunkProofs = {
    93: { kind: "unopenable", artifactId: 930 },
  };
  serveCollectedTrunkRuns(
    github,
    origin,
    () => runs,
    () => proofs,
  );
  keepLaunchRecords(home, [landedRecord(older), landedRecord(corrupt)]);
  const first = await startServer();
  await expect
    .poll(() => retainedHistory(home)?.builds["run/93/1"]?.proof)
    .toMatchObject({ kind: "unavailable", reason: "unreadable" });
  await expect
    .poll(() => retainedHistory(home)?.landings[older.receipt]?.observed.kind)
    .toBe("pending");
  const held = retainedHistory(home)?.builds["run/93/1"];
  await first.close();
  const corruptRequests = () =>
    github.calls.filter(
      ({ request }) =>
        request.kind === "actions-run-artifacts" && request.runId === 93,
    ).length;
  expect(corruptRequests()).toBe(1);
  runs = [trunkRun(older.revision, 92, passedFrom(older.at, 2000)), corruptRun];
  proofs = {
    92: {
      kind: "collected",
      artifactId: 920,
      text: collectedScopeFileSummary(
        {
          repository: "terryyin/open-dough",
          runId: 92,
          attempt: 1,
          revision: older.revision,
        },
        [["a.spec.ts", 200, 20]],
      ),
    },
    // If the final attempt were asked again this would incorrectly replace its gap.
    93: {
      kind: "collected",
      artifactId: 930,
      text: collectedScopeFileSummary(
        {
          repository: "terryyin/open-dough",
          runId: 93,
          attempt: 1,
          revision: corrupt.revision,
        },
        [["a.spec.ts", 9900, 990]],
      ),
    },
  };
  await startServer();
  // Recorded order is older/corrupt. The newest-first pass encounters corrupt
  // before this pending older attempt, so its summary is a completed-pass barrier.
  await expect
    .poll(() => retainedHistory(home)?.builds["run/92/1"]?.proof?.kind)
    .toBe("summary");
  expect(retainedHistory(home)?.builds["run/93/1"]).toEqual(held);
  expect(corruptRequests()).toBe(1);
});
