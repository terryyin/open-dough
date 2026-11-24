// The adapter command is external; configuration, validation and memory are real.
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciAdapterProofReader } from "../../server/ciAdapterProof.ts";
import type { CiAdapterProofAttempt } from "../../src/ciProof.ts";
import {
  configuredAdapter,
  repository,
  revision,
  signal,
} from "../support/ciProofMemory.ts";

const attempt = makeMe.aCiAdapterProofAttempt
  .with({
    runId: "pipeline#1",
    attemptId: "2",
    branch: "main",
    revision,
  })
  .please();

test("a configured adapter receives the exact subject once, then valid proof is reused", async () => {
  const project = configuredAdapter();
  const proof = makeMe.aCiProof.summaryForAdapter(attempt).please();
  const requests: unknown[] = [];
  const reader = ciAdapterProofReader((...args) => {
    requests.push(args);
    return Promise.resolve({ summary: proof.summary });
  });
  const held = signal();
  try {
    expect(await reader(repository, project.folder, attempt, held, 45)).toEqual(
      proof,
    );
    expect(
      await reader("EXAMPLE/PROJECT", project.folder, attempt, held, 45),
    ).toEqual(proof);
    expect(requests).toEqual([
      [
        ["adapter", "proof"],
        { repo: repository, branch: "main" },
        { runId: "pipeline#1", attemptId: "2", sha: revision },
        {
          signal: held,
          cwd: project.folder,
          timeoutMs: 45,
          answerBytes: 1_048_576,
        },
      ],
    ]);
  } finally {
    project.cleanup();
  }
});

test("an adapter's unavailable proof is retried, then the recovered summary is remembered", async () => {
  const project = configuredAdapter();
  const proof = makeMe.aCiProof.summaryForAdapter(attempt).please();
  let calls = 0;
  const reader = ciAdapterProofReader(() => {
    calls += 1;
    return Promise.resolve(
      calls === 1
        ? { unavailable: "still publishing" }
        : { summary: proof.summary },
    );
  });
  try {
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      {
        kind: "unavailable",
        reason: "none",
        detail: "still publishing",
      },
    );
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      proof,
    );
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      proof,
    );
    expect(calls).toBe(2);
  } finally {
    project.cleanup();
  }
});

test("an unreadable command answer is retried rather than retained as the attempt's proof", async () => {
  const project = configuredAdapter();
  const proof = makeMe.aCiProof.summaryForAdapter(attempt).please();
  let calls = 0;
  const reader = ciAdapterProofReader(() => {
    calls += 1;
    return calls === 1
      ? Promise.reject(new Error("adapter disconnected"))
      : Promise.resolve({ summary: proof.summary });
  });
  try {
    expect(
      await reader(repository, project.folder, attempt, signal()),
    ).toMatchObject({
      kind: "unavailable",
      reason: "unreadable",
      detail: "adapter disconnected",
    });
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      proof,
    );
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      proof,
    );
    expect(calls).toBe(2);
  } finally {
    project.cleanup();
  }
});

test("a retry's proof is remembered separately from the previous attempt of its pipeline", async () => {
  const previous = makeMe.aCiAdapterProofAttempt
    .with({ ...attempt, attemptId: "1" })
    .please();
  const previousProof = makeMe.aCiProof
    .summaryForAdapter(previous, [
      makeMe.aCiProofEntry.at("tests").counting(3).please(),
    ])
    .please();
  const retryProof = makeMe.aCiProof
    .summaryForAdapter(attempt, [
      makeMe.aCiProofEntry.at("tests").counting(5).please(),
    ])
    .please();
  const readCommand = vi
    .fn<NonNullable<Parameters<typeof ciAdapterProofReader>[0]>>()
    .mockResolvedValueOnce({ summary: previousProof.summary })
    .mockResolvedValueOnce({ summary: retryProof.summary })
    .mockResolvedValue({ summary: previousProof.summary });
  const reader = ciAdapterProofReader(readCommand);
  const project = configuredAdapter();
  try {
    expect(
      await reader(repository, project.folder, previous, signal()),
    ).toEqual(previousProof);
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      retryProof,
    );
    expect(
      await reader(repository, project.folder, previous, signal()),
    ).toEqual(previousProof);
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      retryProof,
    );
    const requestedSubjects = readCommand.mock.calls.map(
      ([, , subject]): unknown => subject,
    );
    expect(requestedSubjects).toEqual([
      { runId: "pipeline#1", attemptId: "1", sha: revision },
      { runId: "pipeline#1", attemptId: "2", sha: revision },
    ]);
  } finally {
    project.cleanup();
  }
});

test("opaque run, attempt, revision and repository keys retain distinct valid summaries", async () => {
  const project = configuredAdapter();
  let selected = attempt;
  let selectedRepository = repository;
  let calls = 0;
  const reader = ciAdapterProofReader(() => {
    calls += 1;
    return Promise.resolve({
      summary: makeMe.aCiProof
        .summaryForAdapter(selected, [], selectedRepository)
        .please().summary,
    });
  });
  try {
    const subjects: readonly (readonly [string, CiAdapterProofAttempt])[] = [
      [repository, attempt],
      [repository, { ...attempt, runId: "another-pipeline" }],
      [repository, { ...attempt, runId: "pipeline", attemptId: "1#2" }],
      [repository, { ...attempt, revision: "b".repeat(40) }],
      ["example/other", attempt],
    ];
    for (const [repo, subject] of subjects) {
      selected = subject;
      selectedRepository = repo;
      const expected = makeMe.aCiProof
        .summaryForAdapter(subject, [], repo)
        .please();
      expect(await reader(repo, project.folder, subject, signal())).toEqual(
        expected,
      );
      expect(await reader(repo, project.folder, subject, signal())).toEqual(
        expected,
      );
    }
    expect(calls).toBe(5);
  } finally {
    project.cleanup();
  }
});
