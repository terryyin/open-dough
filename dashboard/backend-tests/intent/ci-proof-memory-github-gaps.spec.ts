// Only checked summaries are retained: failed acquisition and validation retry.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  archiveOf,
  listedArtifact,
  repository,
  run,
  signal,
} from "../support/ciProofMemory.ts";

test("a missing artifact is listed afresh, then its valid summary is remembered", async () => {
  const proof = makeMe.aCiProof.summaryFor(run).please();
  let lists = 0;
  let downloads = 0;
  const reader = ciProofArtifactReader({
    listing() {
      lists += 1;
      return Promise.resolve({
        artifacts: lists === 1 ? [] : [listedArtifact(run)],
      });
    },
    archive() {
      downloads += 1;
      return Promise.resolve(archiveOf(proof.summary));
    },
  });
  expect(await reader(repository, run, signal())).toEqual({
    kind: "unavailable",
    reason: "none",
  });
  expect(await reader(repository, run, signal())).toEqual(proof);
  expect(await reader(repository, run, signal())).toEqual(proof);
  expect([lists, downloads]).toEqual([2, 1]);
});

for (const [reason, changed] of [
  ["invalid", { schemaVersion: 0 }],
  ["mismatched", { repository: "example/other" }],
  ["mismatched", { runId: 2 }],
  ["mismatched", { runAttempt: 2 }],
  ["mismatched", { revision: "b".repeat(40) }],
] as const) {
  test(`${JSON.stringify(changed)} is ${reason}, retried and never remembered instead of the asked attempt`, async () => {
    const proof = makeMe.aCiProof.summaryFor(run).please();
    let lists = 0;
    let downloads = 0;
    const reader = ciProofArtifactReader({
      listing() {
        lists += 1;
        return Promise.resolve({ artifacts: [listedArtifact(run)] });
      },
      archive() {
        downloads += 1;
        return Promise.resolve(
          archiveOf(
            downloads === 1 ? { ...proof.summary, ...changed } : proof.summary,
          ),
        );
      },
    });
    expect(await reader(repository, run, signal())).toMatchObject({
      kind: "unavailable",
      reason,
    });
    expect(await reader(repository, run, signal())).toEqual(proof);
    expect(await reader(repository, run, signal())).toEqual(proof);
    expect([lists, downloads]).toEqual([2, 2]);
  });
}

test("a version 1 artifact is converted before its proof is remembered", async () => {
  // The old collector's literal schema is the input under test.
  const summary = {
    schemaVersion: 1,
    repository,
    ...run,
    entries: [
      {
        path: "tests",
        unit: "tests",
        passed: 3,
        failed: 0,
        other: 0,
        parts: [{ part: 1, status: "present", passed: 3, failed: 0, other: 0 }],
      },
    ],
  };
  let downloads = 0;
  const reader = ciProofArtifactReader({
    listing: () => Promise.resolve({ artifacts: [listedArtifact(run)] }),
    archive: () => {
      downloads += 1;
      return Promise.resolve(archiveOf(summary));
    },
  });
  const expected = {
    kind: "summary",
    summary: {
      schemaVersion: 2,
      repository,
      ...run,
      entries: [
        {
          path: "tests",
          evidence: [
            {
              unit: "legacy",
              label: "tests",
              passed: 3,
              failed: 0,
              other: 0,
              parts: [
                { part: 1, status: "present", passed: 3, failed: 0, other: 0 },
              ],
            },
          ],
        },
      ],
    },
  };
  expect(await reader(repository, run, signal())).toEqual(expected);
  expect(await reader(repository, run, signal())).toEqual(expected);
  expect(downloads).toBe(1);
});
