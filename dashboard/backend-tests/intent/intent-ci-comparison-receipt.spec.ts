// Retained producer/acquisition connections: exact malformed local bytes go
// through canonical parsing and the DEFAULT comparison source. Fast receipt
// rules own eligibility/deadline decisions without materializing published Git.
import path from "node:path";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { readLandedComparison } from "../../tests/support/pendingLandedComparison.ts";
import { missingLandedRun } from "../../tests/support/missingLandedRun.ts";
import { keepLaunchStoreText } from "../../tests/support/launchStore.ts";
import { keepLandedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { serveTrunkRuns } from "../../tests/support/landedCiTrunk.ts";

test.use({ serverMode: "boundary" });

for (const capture of ["unreadable launch", "unreadable history"] as const) {
  test(`${capture} cannot supply age or hide published completion`, async ({
    origin,
    github,
    startServer,
  }) => {
    const setup = await missingLandedRun(origin);
    const directory = path.join(origin.machine, "home");
    if (capture === "unreadable launch") {
      keepLaunchStoreText(directory, "unreadable capture");
    } else {
      keepLandedCiHistory(directory, makeMe.aLandedCiHistory.please());
      writeFileSync(
        path.join(directory, ".open-dough/dashboard/landed-ci-history.json"),
        "unreadable history",
      );
    }
    let runs = setup.runs;
    serveTrunkRuns(github, origin, () => runs, { proofs: () => setup.proofs });
    const server = await startServer({
      environment: "development",
      observationClock: true,
    });
    server.setObservationClock(
      new Date(Date.now() + 3 * 3_600_000).toISOString(),
    );
    expect(
      (await readLandedComparison(server, setup.identity)).landed.kind,
    ).toBe("none");
    runs = [...setup.runs, setup.exact];
    expect(
      (await readLandedComparison(server, setup.identity)).landed,
    ).toMatchObject({
      kind: "build",
      selection: "exact",
      revision: setup.landingMerge,
      runId: 103,
    });
  });
}
