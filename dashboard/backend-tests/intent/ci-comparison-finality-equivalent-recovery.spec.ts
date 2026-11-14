import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  finalityIdentity,
  representedFinalityFacts,
} from "../support/finalityComparisonFacts.ts";
import {
  baseline,
  branch,
  completion,
  comparisonProject,
  start,
} from "../support/comparisonRead.ts";
import { finalityArtifacts } from "../support/finalityArtifacts.ts";
import { storyCiComparisonEvidence } from "../support/storyCiComparisonEvidence.ts";
import {
  ciComparisonAnswers,
  ciComparisonAnswerKey,
  clearCiComparisonAnswers,
} from "../../server/intentCiComparisonAnswers.ts";
import { ciComparisonReader } from "../../server/intentCiComparisonRead.ts";
import { rememberedByKey } from "../../server/rememberedByKey.ts";
import type { StoryCiComparisonAnswer } from "../../src/storyCiComparison.ts";
import type { StoryCiComparisonSource } from "../../server/storyCiComparisonSource.ts";
import {
  test,
  expect,
  observedComparisonSource,
  comparisonAcquisitions,
} from "../support/comparisonMemory.ts";

for (const condition of ["failed", "untimed"] as const) {
  test(`a fresh ${condition} equivalent with settled missing proof is a final gap on repeat`, async ({
    comparisonRead,
  }) => {
    const facts = representedFinalityFacts("equivalent", 0);
    const completed = facts.runs[2];
    if (completed === undefined) throw new Error("Expected equivalent run");
    facts.runs[2] = makeMe.aRevisionCiRun
      .with({
        ...completed,
        ...(condition === "failed"
          ? { conclusion: "failure" }
          : { startedAt: "", completedAt: "" }),
      })
      .please();
    const artifacts = finalityArtifacts(facts, {
      listing: () => Promise.resolve({ artifacts: [] }),
      archive: () => Promise.reject(new Error("No artifact to download")),
    });
    const observed = observedComparisonSource(
      storyCiComparisonEvidence({
        ...facts,
        proofReader: artifacts.proofReader,
      }).source,
    );
    const final = await comparisonRead(observed.source);
    expect(final).toMatchObject({
      landed: {
        kind: "none",
        requestedStatus: { kind: "skipped" },
        explanation:
          "The equivalent build at fffffff published no CI proof summary.",
      },
    });
    if (final.kind !== "comparison") throw new Error("Expected comparison");
    expect(final.landed).not.toHaveProperty("timeWithoutRunnerWaits");
    expect(artifacts.asked()).toEqual([1, 0]);
    const asked = comparisonAcquisitions(observed);
    expect(await comparisonRead(observed.source)).toBe(final);
    expect(comparisonAcquisitions(observed)).toEqual(asked);
    expect(artifacts.asked()).toEqual([1, 0]);
  });
}

for (const condition of ["timed", "failed", "untimed"] as const) {
  test(`a retained no-proof gap revalidates once to its ${condition} equivalent in the same process`, async () => {
    const facts = representedFinalityFacts("equivalent", 0);
    const completed = facts.runs[2];
    if (completed === undefined) throw new Error("Expected equivalent run");
    facts.runs[2] = makeMe.aRevisionCiRun
      .with({
        ...completed,
        ...(condition === "failed" ? { conclusion: "failure" } : {}),
        ...(condition === "untimed" ? { startedAt: "", completedAt: "" } : {}),
      })
      .please();
    const retained = makeMe.aStoryCiComparison
      .with({
        kind: "comparison",
        identity: finalityIdentity,
        phase: "done",
        mode: "story-branch",
        completion,
        storyStart: start,
        checkedAt: "2026-11-05T14:05:00.000Z",
        baseline: {
          kind: "build",
          revision: baseline,
          subject: baseline,
          state: "pass",
          selection: "ancestor",
          laterWithoutResult: 1,
          runId: 101,
          runAttempt: 1,
          timeWithoutRunnerWaits: { milliseconds: 240000 },
        },
        branch: {
          kind: "build",
          revision: branch,
          subject: branch,
          state: "pass",
          selection: "exact",
          laterWithoutResult: 0,
          runId: 102,
          runAttempt: 1,
          timeWithoutRunnerWaits: { milliseconds: 240000 },
        },
        landed: {
          kind: "none",
          explanation:
            "The equivalent build at fffffff published no CI proof summary.",
          requestedStatus: {
            kind: "skipped",
            explanation: "The landing merge changed only planning paths.",
          },
        },
      })
      .please();
    const store = rememberedByKey<StoryCiComparisonAnswer>();
    const key = ciComparisonAnswerKey(
      comparisonProject.repository,
      finalityIdentity,
    );
    store.set(key, retained);
    const reader = ciComparisonReader(ciComparisonAnswers(store));
    const artifacts = finalityArtifacts(facts, {
      listing: () => Promise.resolve({ artifacts: [] }),
      archive: () => Promise.reject(new Error("No artifact to download")),
    });
    const observed = observedComparisonSource(
      storyCiComparisonEvidence({
        ...facts,
        proofReader: artifacts.proofReader,
      }).source,
    );
    const final = await readComparison(reader, observed.source);
    expect(final).not.toBe(retained);
    expect(final).toMatchObject({
      landed:
        condition === "timed"
          ? {
              kind: "build",
              state: "pass",
              revision: "f".repeat(40),
              selection: "equivalent",
              runId: 201,
              runAttempt: 1,
              requestedStatus: { kind: "skipped" },
              startedAt: "2026-11-05T14:00:00Z",
              completedAt: "2026-11-05T14:04:00.000Z",
            }
          : {
              kind: "none",
              requestedStatus: { kind: "skipped" },
              explanation:
                "The equivalent build at fffffff published no CI proof summary.",
            },
    });
    expect(store.get(key)).toBe(final);
    expect(artifacts.asked()).toEqual([1, 0]);
    const asked = comparisonAcquisitions(observed);
    expect(asked.reads.endpoints).toBeGreaterThan(0);
    expect(await readComparison(reader, observed.source)).toBe(final);
    expect(comparisonAcquisitions(observed)).toEqual(asked);
    expect(artifacts.asked()).toEqual([1, 0]);
  });
}

test("clearing the default comparison owner makes the next read acquire again", async ({
  comparisonRead,
}) => {
  const facts = representedFinalityFacts("equivalent", 0);
  const observed = observedComparisonSource(
    storyCiComparisonEvidence(facts).source,
  );
  const final = await comparisonRead(observed.source);
  const asked = comparisonAcquisitions(observed);
  expect(await comparisonRead(observed.source)).toBe(final);
  expect(comparisonAcquisitions(observed)).toEqual(asked);
  clearCiComparisonAnswers();
  expect(await comparisonRead(observed.source)).not.toBe(final);
  expect(observed.reads.endpoints).toBeGreaterThan(asked.reads.endpoints);
});

async function readComparison(
  reader: ReturnType<typeof ciComparisonReader>,
  source: StoryCiComparisonSource,
): Promise<StoryCiComparisonAnswer> {
  const outcome = await reader(
    comparisonProject,
    { kind: "intent-ci-comparison", identity: finalityIdentity },
    new AbortController().signal,
    source,
  );
  expect(outcome.kind).toBe("answered");
  if (outcome.kind !== "answered")
    throw new Error("Expected comparison answer");
  return outcome.answer as StoryCiComparisonAnswer;
}
