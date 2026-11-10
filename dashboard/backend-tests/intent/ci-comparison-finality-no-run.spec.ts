// Missing runs are live until actual CI progress or the matching receipt's
// age settles them. Later CI facts never become an exact-only result.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { branch, landing, completion } from "../support/comparisonRead.ts";
import {
  finalityComparisonFacts,
  finalityRun,
} from "../support/finalityComparisonFacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  expect,
  test,
  observedComparisonSource,
  comparisonAcquisitions,
} from "../support/comparisonMemory.ts";

test("unknown receipt age stays refreshable through queued and running to the exact build", async ({
  comparisonRead,
}) => {
  const facts = finalityComparisonFacts("code");
  const observed = observedComparisonSource(
    storyCiComparisonEvidence({
      ...facts,
      now: () => Date.parse("2026-11-05T18:00:00Z"),
      receipts: {
        launchesByProject: new Map(),
        retained: { kind: "document", document: {} },
      },
    }).source,
  );
  const missing = await comparisonRead(observed.source);
  expect(missing).toMatchObject({
    landed: { kind: "none", requestedStatus: { kind: "no-build" } },
  });
  if (missing.kind !== "comparison") throw new Error("Expected comparison");
  expect(missing.landed).not.toHaveProperty("timeWithoutRunnerWaits");
  const asked = comparisonAcquisitions(observed);
  await comparisonRead(observed.source);
  expect(observed.reads.runs).toBeGreaterThan(asked.reads.runs);
  for (const status of ["queued", "in_progress"] as const) {
    facts.runs[2] = makeMe.aRevisionCiRun
      .with({
        ...finalityRun(landing, 103),
        status,
        conclusion: null,
      })
      .please();
    expect(await comparisonRead(observed.source)).toMatchObject({
      landed: { kind: "running", revision: landing, runId: 103 },
    });
  }
  facts.runs[2] = finalityRun(landing, 103);
  const final = await comparisonRead(observed.source);
  expect(final).toMatchObject({
    landed: {
      kind: "build",
      revision: landing,
      selection: "exact",
      runId: 103,
      runAttempt: 1,
      startedAt: "2026-11-05T14:00:00Z",
      completedAt: "2026-11-05T14:04:00.000Z",
    },
    branch: { kind: "build", revision: branch },
  });
  const answered = comparisonAcquisitions(observed);
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(comparisonAcquisitions(observed)).toEqual(answered);
});

for (const bound of ["later run", "walk limit"] as const) {
  test(`unknown receipt age is final at the ${bound} without selecting a later build`, async ({
    comparisonRead,
  }) => {
    const facts = finalityComparisonFacts(
      "code",
      bound === "walk limit" ? 31 : 0,
    );
    if (bound === "later run") facts.runs.push(finalityRun(completion, 299));
    const evidence = storyCiComparisonEvidence({
      ...facts,
      now: () => Date.parse("2026-11-05T18:00:00Z"),
      receipts: {
        launchesByProject: new Map(),
        retained: { kind: "document", document: {} },
      },
    });
    const observed = observedComparisonSource(evidence.source);
    const final = await comparisonRead(observed.source);
    expect(final).toMatchObject({
      landed: { kind: "none", requestedStatus: { kind: "no-build" } },
    });
    if (final.kind !== "comparison") throw new Error("Expected comparison");
    expect(final.landed).not.toHaveProperty("revision");
    expect(evidence.reads.proofs.map((run) => run.runId)).not.toContain(299);
    const asked = comparisonAcquisitions(observed);
    expect(await comparisonRead(observed.source)).toBe(final);
    expect(comparisonAcquisitions(observed)).toEqual(asked);
  });
}
