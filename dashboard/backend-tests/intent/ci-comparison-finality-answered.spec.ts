// Terminal artifact answers freeze comparison memory, unlike the artifact
// reader's own policy of retrying every answer except a valid summary.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  trunkSide,
  representedFinalityFacts,
} from "../support/finalityComparisonFacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import { finalityArtifacts } from "../support/finalityArtifacts.ts";
import { archiveOf } from "../support/ciProofMemory.ts";
import {
  expect,
  test,
  observedComparisonSource,
  comparisonAcquisitions,
} from "../support/comparisonMemory.ts";

for (const state of ["queued", "in_progress"] as const) {
  test(`a ${state} equivalent build stays refreshable until its completed proof can stand for the skip`, async ({
    comparisonRead,
  }) => {
    const facts = representedFinalityFacts("equivalent", 0);
    const completed = facts.runs[2];
    if (completed === undefined) throw new Error("Expected arranged run");
    facts.runs[2] = makeMe.aRevisionCiRun
      .with({ ...completed, status: state, conclusion: null })
      .please();
    const observed = observedComparisonSource(
      storyCiComparisonEvidence({ ...facts }).source,
    );
    expect(await comparisonRead(observed.source)).toMatchObject({
      landed: { kind: "none" },
    });
    facts.runs[2] = completed;
    const recovered = await comparisonRead(observed.source);
    expect(recovered).toMatchObject({
      landed: {
        kind: "build",
        selection: "equivalent",
        revision: trunkSide,
        runId: 201,
        runAttempt: 1,
      },
    });
    const asked = comparisonAcquisitions(observed);
    expect(await comparisonRead(observed.source)).toBe(recovered);
    expect(comparisonAcquisitions(observed)).toEqual(asked);
  });
}

test("an answered missing equivalent artifact reuses timed wall time with no acquisitions on repeat", async ({
  comparisonRead,
}) => {
  const facts = representedFinalityFacts("equivalent", 0);
  const artifacts = finalityArtifacts(facts, {
    listing: () => Promise.resolve({ artifacts: [] }),
    archive: () => Promise.reject(new Error("No artifact to download")),
  });
  const observed = observedComparisonSource(
    storyCiComparisonEvidence({ ...facts, proofReader: artifacts.proofReader })
      .source,
  );
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    landed: {
      kind: "build",
      state: "pass",
      selection: "equivalent",
      revision: trunkSide,
      runId: 201,
      runAttempt: 1,
      requestedStatus: { kind: "skipped" },
      startedAt: "2026-11-05T14:00:00Z",
      completedAt: "2026-11-05T14:04:00.000Z",
      timeWithoutRunnerWaits: { reason: "The CI adapter reported no jobs." },
    },
  });
  expect(artifacts.asked()).toEqual([1, 0]);
  const asked = comparisonAcquisitions(observed);
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(comparisonAcquisitions(observed)).toEqual(asked);
  expect(artifacts.asked()).toEqual([1, 0]);
});

for (const reason of ["expired", "invalid", "unopenable"] as const) {
  test(`an answered ${reason} equivalent artifact is a final explained gap with no acquisitions on repeat`, async ({
    comparisonRead,
  }) => {
    const facts = representedFinalityFacts("equivalent", 0);
    const artifact = makeMe.aCiProofArtifact
      .with({
        id: 41,
        runId: 201,
        runAttempt: 1,
        expired: reason === "expired",
      })
      .please();
    const artifacts = finalityArtifacts(facts, {
      listing: () => Promise.resolve({ artifacts: [artifact] }),
      archive: () =>
        Promise.resolve(
          reason === "unopenable"
            ? Buffer.from("not a zip archive")
            : archiveOf({ invalid: true }),
        ),
    });
    const observed = observedComparisonSource(
      storyCiComparisonEvidence({
        ...facts,
        proofReader: artifacts.proofReader,
      }).source,
    );
    const final = await comparisonRead(observed.source);
    expect(final).toMatchObject({
      landed: { kind: "none", requestedStatus: { kind: "skipped" } },
    });
    if (final.kind !== "comparison" || final.landed.kind !== "none")
      throw new Error("Expected explained gap");
    expect(final.landed).not.toHaveProperty("timeWithoutRunnerWaits");
    expect(final.landed.explanation).toContain(
      reason === "expired"
        ? "expired"
        : reason === "invalid"
          ? "not valid"
          : "could not be read",
    );
    expect(artifacts.asked()).toEqual([1, reason === "expired" ? 0 : 1]);
    const asked = comparisonAcquisitions(observed);
    const raw = artifacts.asked();
    expect(await comparisonRead(observed.source)).toBe(final);
    expect(comparisonAcquisitions(observed)).toEqual(asked);
    expect(artifacts.asked()).toEqual(raw);
  });
}

test("an unread CI listing is retried and then the final equivalent endpoint is remembered", async ({
  comparisonRead,
}) => {
  const facts = representedFinalityFacts("equivalent", 0);
  const evidence = storyCiComparisonEvidence(facts);
  let readable = false;
  const observed = observedComparisonSource({
    ...evidence.source,
    buildsFor: () =>
      Promise.resolve({
        builds: {
          ...evidence.builds,
          lookup: {
            ...evidence.builds.lookup,
            listRunsAt: (sha) =>
              readable
                ? evidence.builds.lookup.listRunsAt(sha)
                : Promise.reject(new Error("GitHub is unreachable")),
          },
        },
      }),
  });
  expect(await comparisonRead(observed.source)).toMatchObject({
    landed: { kind: "unavailable" },
  });
  readable = true;
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    landed: { kind: "build", selection: "equivalent", runId: 201 },
  });
  const asked = comparisonAcquisitions(observed);
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(comparisonAcquisitions(observed)).toEqual(asked);
});
