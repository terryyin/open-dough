// Actual published facts, local capture and retained history meet only at
// matching project/target/story/revision. A fixed observation clock proves
// the exact deadline, independently of Git completion/commit times.
import path from "node:path";
import { writeFileSync } from "node:fs";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { readLandedComparison } from "../../tests/support/pendingLandedComparison.ts";
import {
  capturedComparisonLanding,
  missingLandedRun,
} from "../../tests/support/missingLandedRun.ts";
import {
  keepLaunchRecords,
  keepLaunchStore,
  keepLaunchStoreText,
} from "../../tests/support/launchStore.ts";
import { keepLandedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { serveTrunkRuns } from "../../tests/support/landedCiTrunk.ts";

test.use({ serverMode: "boundary" });
const hour = 3_600_000;
const instant = (at: string, ms: number) =>
  new Date(Date.parse(at) + ms).toISOString();

for (const capture of ["launch", "retained history"] as const) {
  test(`${capture} supplies the earliest matching receipt: pending one millisecond before and final at its fixed hour`, async ({
    origin,
    github,
    startServer,
  }) => {
    const setup = await missingLandedRun(origin);
    const home = path.join(origin.machine, "home");
    const at = new Date().toISOString();
    const landing = capturedComparisonLanding(setup, at);
    const duplicate = capturedComparisonLanding(
      setup,
      instant(at, 20 * 60_000),
      { receipt: "55555555-5555-4555-8555-555555555555" },
    );
    const wrongPreparation = capturedComparisonLanding(
      setup,
      instant(at, -2 * hour),
      { revision: setup.trunkSide },
    );
    const wrongExecution = capturedComparisonLanding(
      setup,
      instant(at, -2 * hour),
      { revision: setup.completion },
    );
    const records = [
      makeMe.aLaunchRecord
        .refining({ identity: setup.identity, title: "Story A" })
        .withCapturedLanding(wrongPreparation)
        .please(),
      makeMe.aLaunchRecord
        .executing({ identity: setup.identity, title: "Story A" })
        .withCapturedLanding(wrongExecution)
        .please(),
    ];
    if (capture === "launch") {
      // Reverse receipt order makes choosing the first/last record insufficient.
      keepLaunchRecords(home, [
        ...records,
        makeMe.aLaunchRecord
          .executing({ identity: setup.identity, title: "Story A" })
          .withCapturedLanding(duplicate)
          .please(),
        makeMe.aLaunchRecord
          .executing({ identity: setup.identity, title: "Story A" })
          .withCapturedLanding(landing)
          .please(),
      ]);
    } else {
      keepLaunchRecords(home, records);
      keepLandedCiHistory(
        home,
        makeMe.aLandedCiHistory
          .pending(duplicate, { kind: "pending", waitsFor: "run" })
          .pending(landing, { kind: "pending", waitsFor: "run" })
          .please(),
      );
    }
    serveTrunkRuns(github, origin, () => setup.runs, {
      proofs: () => setup.proofs,
    });
    const server = await startServer({
      environment: "development",
      observationClock: true,
    });
    server.setObservationClock(instant(at, hour - 1));
    const before = await readLandedComparison(server, setup.identity);
    expect(before.landed).toMatchObject({
      kind: "none",
      requestedStatus: { kind: "no-build" },
    });
    const asked = github.calls.length;
    await readLandedComparison(server, setup.identity);
    expect(github.calls.length).toBeGreaterThan(asked);
    // Remove retained launch membership; the history case must still know
    // the original landing's age, rather than its competing execution's.
    if (capture === "retained history") keepLaunchRecords(home, []);
    server.setObservationClock(instant(at, hour));
    const final = await readLandedComparison(server, setup.identity);
    expect(final.landed).toMatchObject({
      kind: "none",
      requestedStatus: { kind: "no-build" },
    });
    const finalRequests = github.calls.length;
    expect(await readLandedComparison(server, setup.identity)).toEqual(final);
    expect(github.calls.length).toBe(finalRequests);
  });
}

for (const capture of [
  "unrelated",
  "legacy history",
  "unreadable launch",
  "unreadable history",
] as const) {
  test(`${capture} cannot supply age or hide published completion`, async ({
    origin,
    github,
    startServer,
  }) => {
    const setup = await missingLandedRun(origin);
    const home = path.join(origin.machine, "home");
    const old = new Date(Date.now() - 2 * hour).toISOString();
    const matching = capturedComparisonLanding(setup, old);
    if (capture === "unrelated") {
      const wrongTarget = capturedComparisonLanding(setup, old, {
        target: "refs/heads/other",
      });
      const wrongStory = capturedComparisonLanding(setup, old, {
        identity: "SEED-999#other",
      });
      const wrongRevision = capturedComparisonLanding(setup, old, {
        revision: setup.completion,
      });
      keepLaunchStore(home, {
        "other-project": [
          makeMe.aLaunchRecord
            .executing({ identity: setup.identity, title: "Story A" })
            .withCapturedLanding(matching)
            .please(),
        ],
        "open-dough": [wrongTarget, wrongStory, wrongRevision].map((landing) =>
          makeMe.aLaunchRecord
            .executing({ identity: setup.identity, title: "Story A" })
            .withCapturedLanding(landing)
            .please(),
        ),
      });
    } else if (capture === "legacy history") {
      const { target, ...legacy } = matching;
      expect(target).toBe("refs/heads/main");
      keepLandedCiHistory(
        home,
        makeMe.aLandedCiHistory
          .pendingLanding({ ...legacy, waitsFor: "run" })
          .please(),
      );
    } else if (capture === "unreadable launch") {
      keepLaunchStoreText(home, "unreadable capture");
    } else {
      keepLandedCiHistory(home, makeMe.aLandedCiHistory.please());
      writeFileSync(
        path.join(home, ".open-dough/dashboard/landed-ci-history.json"),
        "unreadable history",
      );
    }
    let runs = setup.runs;
    serveTrunkRuns(github, origin, () => runs, { proofs: () => setup.proofs });
    const server = await startServer({
      environment: "development",
      observationClock: true,
    });
    server.setObservationClock(new Date(Date.now() + 3 * hour).toISOString());
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
