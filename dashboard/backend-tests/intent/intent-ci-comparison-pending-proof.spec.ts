// Real published endpoints, production comparison memory and counted upstream
// requests. Provider transitions do not supply the comparison's finality.
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  noConnection,
  rateLimitedAnswer,
  type OriginAnswer,
} from "../../tests/originAnswers.ts";
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { landedCiHistory } from "../../tests/support/landedCiHistory.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import {
  pendingLandedComparison,
  readLandedComparison,
  proofListings,
  serveProofAnswer,
} from "../../tests/support/pendingLandedComparison.ts";
import { listingReuseWithOwnerClock } from "../../tests/support/listingReuseWithOwnerClock.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";

test.use({ serverMode: "boundary" });

const malformed: OriginAnswer = {
  status: 200,
  contentType: "application/json",
  body: JSON.stringify({ artifacts: "not an artifact listing" }),
};

for (const provenance of ["equivalent", "later"] as const) {
  for (const [name, failure] of [
    ["a transiently failed request", noConnection],
    ["a malformed artifact listing", malformed],
  ] as const) {
    test(`${provenance} proof recovers after ${name}, even beyond the landing hour, and final answers reuse proof`, async ({
      origin,
      github,
      startServer,
    }) => {
      // The existing completion and advance are two later revisions; 29
      // more put the end past the 30-revision walk. Only unanswered proof,
      // rather than awaiting a future build at the head, keeps this pending.
      const setup = await pendingLandedComparison(
        origin,
        provenance,
        provenance === "later" ? 29 : 0,
      );
      let unanswered = true;
      serveProofAnswer(github, origin, setup, () =>
        unanswered ? failure : undefined,
      );
      const receivedAt = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
      keepLaunchRecords(path.join(origin.machine, "home"), [
        makeMe.aLaunchRecord
          .executing({ identity: setup.identity, title: "Story A" })
          .launchedAt(receivedAt)
          .landedAt(setup.landingMerge, { identity: setup.identity })
          .please(),
      ]);
      const server = await startServer({ observationClock: true });
      const first = await readLandedComparison(server, setup.identity);
      expect(first.landed).toMatchObject({ kind: "none" });
      expect(first.landed).not.toHaveProperty("timeWithoutRunnerWaits");
      await expect
        .poll(() => landedCiHistory(server))
        .toMatchObject({
          body: {
            entries: [
              {
                kind: "gap",
                reason: "pending",
                waitsFor: "proof",
                revision: setup.landingMerge,
                identity: setup.identity,
                runId: 201,
                runAttempt: 1,
              },
            ],
          },
        });
      const askedPending = proofListings(github, 201);
      server.advanceObservationClock(3 * 60 * 60_000);
      const stillPending = await readLandedComparison(server, setup.identity);
      expect(stillPending.landed.kind).toBe("none");
      expect(proofListings(github, 201)).toBeGreaterThan(askedPending);

      unanswered = false;
      const recovered = await readLandedComparison(server, setup.identity);
      expect(recovered.landed).toMatchObject({
        kind: "build",
        revision: setup.represented.headSha,
        selection: provenance,
        runId: 201,
        runAttempt: 1,
      });
      expect(recovered.landed.requestedStatus?.kind).toBe(
        provenance === "equivalent" ? "skipped" : "cancelled",
      );
      await expect
        .poll(() => landedCiHistory(server))
        .toMatchObject({
          body: {
            entries: [
              {
                kind: "point",
                revision: setup.represented.headSha,
                runId: 201,
                runAttempt: 1,
                landings: [
                  {
                    revision: setup.landingMerge,
                    identity: setup.identity,
                    provenance,
                  },
                ],
              },
            ],
          },
        });
      const askedFinal = github.calls.length;
      expect(await readLandedComparison(server, setup.identity)).toEqual(
        recovered,
      );
      expect(github.calls.length).toBe(askedFinal);
    });
  }
}

for (const provenance of ["equivalent", "later"] as const) {
  test(`${provenance} proof held by a provider-directed wait recovers after the controlled request-owner clock ends that wait`, async ({
    origin,
  }) => {
    const setup = await pendingLandedComparison(
      origin,
      provenance,
      provenance === "later" ? 29 : 0,
    );
    const clocked = await listingReuseWithOwnerClock((wiring) =>
      startDashboardServer({
        ...wiring,
        mode: "boundary",
        machine: origin.machine,
        projectFolders: ["open-dough"],
      }),
    );
    try {
      let held = true;
      serveProofAnswer(clocked.server.github, origin, setup, () =>
        held ? rateLimitedAnswer(429, { "Retry-After": "120" }) : undefined,
      );
      const first = await readLandedComparison(clocked.server, setup.identity);
      // A later-build walk still has revisions to list after the held proof;
      // the provider's same wait makes that continuing read unavailable.
      expect(first.landed.kind).toBe(
        provenance === "equivalent" ? "none" : "unavailable",
      );
      if (first.landed.kind !== "none" && first.landed.kind !== "unavailable")
        throw new Error("Expected a pending gap");
      expect(first.landed.explanation).toMatch(/could not be read|wait/i);
      const asked = clocked.server.github.calls.length;
      expect(
        (await readLandedComparison(clocked.server, setup.identity)).landed
          .kind,
      ).toBe("unavailable");
      expect(clocked.server.github.calls.length).toBe(asked);
      held = false;
      clocked.advanceOwnerClock(120_001);
      const recovered = await readLandedComparison(
        clocked.server,
        setup.identity,
      );
      expect(recovered.landed).toMatchObject({
        kind: "build",
        selection: provenance,
        revision: setup.represented.headSha,
        runId: 201,
        runAttempt: 1,
      });
      expect(proofListings(clocked.server.github, 201)).toBe(2);
      expect(clocked.standingOwnerPid()).toBe(clocked.ownerPid);
    } finally {
      await clocked.close();
    }
  });
}
