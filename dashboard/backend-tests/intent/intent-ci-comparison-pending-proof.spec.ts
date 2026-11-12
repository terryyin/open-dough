// Retained connections: the equivalent landing joins actual unanswered
// artifact acquisition to collection/history and comparison memory; each
// provider wait preserves request-owner admission, controlled expiry and
// process identity. A later landing's proof wait past the revision walk is
// judged in process (./ci-comparison-finality-later-judgment.spec.ts).
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
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

test("equivalent proof recovers after a malformed artifact listing, even beyond the landing hour, and final answers reuse proof", async ({
  origin,
  github,
  startServer,
}) => {
  const setup = await pendingLandedComparison(origin, "equivalent");
  let unanswered = true;
  serveProofAnswer(github, origin, setup, () =>
    unanswered ? malformed : undefined,
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
  unanswered = false;
  const recovered = await readLandedComparison(server, setup.identity);
  expect(proofListings(github, 201)).toBeGreaterThan(askedPending);
  expect(recovered.landed).toMatchObject({
    kind: "build",
    revision: setup.represented.headSha,
    selection: "equivalent",
    runId: 201,
    runAttempt: 1,
  });
  expect(recovered.landed.requestedStatus?.kind).toBe("skipped");
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
                provenance: "equivalent",
              },
            ],
          },
        ],
      },
    });
  const askedFinal = github.calls.length;
  expect(await readLandedComparison(server, setup.identity)).toEqual(recovered);
  expect(github.calls.length).toBe(askedFinal);
});

for (const provenance of ["equivalent", "later"] as const) {
  test(`${provenance} proof held by a provider-directed wait recovers after the controlled request-owner clock ends that wait`, async ({
    origin,
  }) => {
    const setup = await pendingLandedComparison(origin, provenance);
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
