// Actual comparison memory stays live for running or unread evidence and
// keeps answered terminal gaps without further provider requests.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  pendingLandedComparison,
  readLandedComparison,
  proofListings,
} from "../../tests/support/pendingLandedComparison.ts";
import {
  runningFrom,
  serveTrunkRuns,
  trunkRun,
} from "../../tests/support/landedCiTrunk.ts";

test.use({ serverMode: "boundary" });

for (const state of ["queued", "in_progress"] as const) {
  test(`a ${state} equivalent build stays refreshable until its completed proof can stand for the skip`, async ({
    origin,
    github,
    startServer,
  }) => {
    const setup = await pendingLandedComparison(origin, "equivalent");
    let runs = setup.runs.map((run) =>
      run.id === 201
        ? trunkRun(run.headSha, 201, {
            ...runningFrom("2026-11-05T13:00:00Z"),
            status: state,
          })
        : run,
    );
    serveTrunkRuns(github, origin, () => runs, { proofs: () => setup.proofs });
    const server = await startServer();
    expect(
      (await readLandedComparison(server, setup.identity)).landed.kind,
    ).toBe("none");
    runs = setup.runs;
    const recovered = await readLandedComparison(server, setup.identity);
    expect(recovered.landed).toMatchObject({
      kind: "build",
      selection: "equivalent",
      revision: setup.trunkSide,
      runId: 201,
      runAttempt: 1,
    });
    const asked = github.calls.length;
    expect(await readLandedComparison(server, setup.identity)).toEqual(
      recovered,
    );
    expect(github.calls.length).toBe(asked);
  });
}

test("an answered missing equivalent proof still reuses timed wall time with no provider requests on repeat", async ({
  origin,
  github,
  startServer,
}) => {
  const setup = await pendingLandedComparison(origin, "equivalent");
  serveTrunkRuns(github, origin, () => setup.runs, {
    proofs: () => ({ ...setup.proofs, 201: { kind: "none" as const } }),
  });
  const server = await startServer();
  const final = await readLandedComparison(server, setup.identity);
  expect(final.landed).toMatchObject({
    kind: "build",
    selection: "equivalent",
    revision: setup.trunkSide,
    runId: 201,
    runAttempt: 1,
    requestedStatus: { kind: "skipped" },
  });
  if (final.landed.kind !== "build")
    throw new Error("Expected a timed equivalent build");
  expect(final.landed.startedAt).toBeTruthy();
  expect(final.landed.completedAt).toBeTruthy();
  const asked = github.calls.length;
  expect(proofListings(github, 201)).toBe(1);
  expect(await readLandedComparison(server, setup.identity)).toEqual(final);
  expect(github.calls.length).toBe(asked);
});

for (const reason of ["expired", "invalid", "unopenable"] as const) {
  test(`an answered ${reason} equivalent artifact is a final explained gap with no provider requests on repeat`, async ({
    origin,
    github,
    startServer,
  }) => {
    const setup = await pendingLandedComparison(origin, "equivalent");
    const proof =
      reason === "expired"
        ? { kind: "expired" as const, artifactId: 2010 }
        : reason === "unopenable"
          ? { kind: "unopenable" as const, artifactId: 2010 }
          : {
              kind: "summary" as const,
              artifactId: 2010,
              summary: { invalid: true },
            };
    serveTrunkRuns(github, origin, () => setup.runs, {
      proofs: () => ({ ...setup.proofs, 201: proof }),
    });
    const server = await startServer();
    const final = await readLandedComparison(server, setup.identity);
    expect(final.landed).toMatchObject({
      kind: "none",
      requestedStatus: { kind: "skipped" },
    });
    expect(final.landed).not.toHaveProperty("timeWithoutRunnerWaits");
    if (final.landed.kind !== "none")
      throw new Error("Expected an explained gap");
    expect(final.landed.explanation).toContain(
      reason === "expired"
        ? "expired"
        : reason === "invalid"
          ? "not valid"
          : "could not be read",
    );
    const asked = github.calls.length;
    expect(proofListings(github, 201)).toBe(1);
    expect(await readLandedComparison(server, setup.identity)).toEqual(final);
    expect(github.calls.length).toBe(asked);
  });
}

test("an unread CI listing is retried and then the final equivalent endpoint is remembered", async ({
  origin,
  github,
  startServer,
}) => {
  const setup = await pendingLandedComparison(origin, "equivalent");
  let readable = false;
  serveTrunkRuns(github, origin, () => setup.runs, {
    readable: () => readable,
    proofs: () => setup.proofs,
  });
  const server = await startServer();
  expect((await readLandedComparison(server, setup.identity)).landed.kind).toBe(
    "unavailable",
  );
  readable = true;
  const final = await readLandedComparison(server, setup.identity);
  expect(final.landed).toMatchObject({
    kind: "build",
    selection: "equivalent",
    runId: 201,
  });
  const asked = github.calls.length;
  expect(await readLandedComparison(server, setup.identity)).toEqual(final);
  expect(github.calls.length).toBe(asked);
});
