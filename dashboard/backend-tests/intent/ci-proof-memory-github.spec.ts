// A valid run attempt is immutable; a reader remembers only its checked proof.
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

test("a valid chosen artifact is extracted once and reused across repository casing", async () => {
  const proof = makeMe.aCiProof
    .summaryFor(run, [
      makeMe.aCiProofEntry
        .at("tests")
        .holding(
          makeMe.aCiProofEvidence.inUnit("case").counting(3).timed(20).please(),
          makeMe.aCiProofEvidence.inUnit("file").counting(1).timed(5).please(),
        )
        .please(),
    ])
    .please();
  const requests: string[][] = [];
  const reader = ciProofArtifactReader({
    listing(args) {
      requests.push(args);
      return Promise.resolve({
        artifacts: [
          listedArtifact({ ...run, runAttempt: 2 }, 99),
          listedArtifact({ ...run, runId: 8 }, 98),
          listedArtifact(run),
        ],
      });
    },
    archive(args) {
      requests.push(args);
      return Promise.resolve(archiveOf(proof.summary));
    },
  });

  expect(await reader(repository, run, signal())).toEqual(proof);
  expect(await reader("EXAMPLE/PROJECT", run, signal())).toEqual(proof);
  expect(requests).toEqual([
    [
      "api",
      "repos/example/project/actions/runs/1/artifacts?name=ci-proof-summary-attempt-1&per_page=100",
    ],
    ["api", "repos/example/project/actions/artifacts/41/zip"],
  ]);
});

test("repository, run and attempt each identify a separate remembered artifact", async () => {
  let lists = 0;
  let downloads = 0;
  let selected = run;
  let selectedRepository = repository;
  const reader = ciProofArtifactReader({
    listing() {
      lists += 1;
      return Promise.resolve({ artifacts: [listedArtifact(selected)] });
    },
    archive() {
      downloads += 1;
      return Promise.resolve(
        archiveOf(
          makeMe.aCiProof.summaryFor(selected, [], selectedRepository).please()
            .summary,
        ),
      );
    },
  });
  for (const [repo, subject] of [
    [repository, run],
    [repository, { ...run, runAttempt: 2 }],
    [repository, { ...run, runId: 2 }],
    ["example/other", run],
  ] as const) {
    selected = subject;
    selectedRepository = repo;
    expect(await reader(repo, subject, signal())).toMatchObject({
      kind: "summary",
      summary: { repository: repo, ...subject },
    });
    expect(await reader(repo, subject, signal())).toMatchObject({
      kind: "summary",
    });
  }
  expect([lists, downloads]).toEqual([4, 4]);
});

test("a new reader has its own memory while the first still retains its proof", async () => {
  const proof = makeMe.aCiProof.summaryFor(run).please();
  let lists = 0;
  const acquisition = {
    listing: () => {
      lists += 1;
      return Promise.resolve({ artifacts: [listedArtifact(run)] });
    },
    archive: () => Promise.resolve(archiveOf(proof.summary)),
  };
  const first = ciProofArtifactReader(acquisition);
  const second = ciProofArtifactReader(acquisition);
  expect(await first(repository, run, signal())).toEqual(proof);
  expect(await second(repository, run, signal())).toEqual(proof);
  expect(await first(repository, run, signal())).toEqual(proof);
  expect(lists).toBe(2);
});
