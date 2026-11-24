// An adapter's unusable proof has a specific reader-facing reason and cannot
// poison proof memory.
import { assert, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciAdapterProofReader } from "../../server/ciAdapterProof.ts";
import { adapterUnavailableLine } from "../../src/ciProofAbsenceWording.ts";
import {
  configuredAdapter,
  repository,
  revision,
  signal,
} from "../support/ciProofMemory.ts";

const attempt = makeMe.aCiAdapterProofAttempt
  .with({
    runId: "pipeline",
    attemptId: "retry:2",
    branch: "story",
    revision,
  })
  .please();

const proof = makeMe.aCiProof.summaryForAdapter(attempt).please();
const otherRevision = "b".repeat(40);

for (const [gap, answer, line] of [
  [
    "an explicit absence",
    { unavailable: "no summary retained" },
    "This attempt's CI adapter gave no CI proof summary: no summary retained.",
  ],
  [
    "an unsupported schema",
    { summary: { ...proof.summary, schemaVersion: 3 } },
    "This attempt's CI proof summary is not a valid summary: schemaVersion is not 2.",
  ],
  [
    "another repository",
    { summary: { ...proof.summary, repository: "someone/else" } },
    "This attempt's CI proof summary is for another repository, attempt or revision: it names repository someone/else.",
  ],
  [
    "another attempt",
    { summary: { ...proof.summary, attemptId: "retry:1" } },
    "This attempt's CI proof summary is for another repository, attempt or revision: it names attempt retry:1.",
  ],
  [
    "another revision",
    { summary: { ...proof.summary, revision: otherRevision } },
    `This attempt's CI proof summary is for another repository, attempt or revision: it names revision ${otherRevision}.`,
  ],
] as const) {
  test(`adapter proof with ${gap} explains why and is acquired again before memory`, async () => {
    const project = configuredAdapter();
    let calls = 0;
    const reader = ciAdapterProofReader(() => {
      calls += 1;
      return Promise.resolve(calls === 1 ? answer : { summary: proof.summary });
    });
    try {
      const rejected = await reader(
        repository,
        project.folder,
        attempt,
        signal(),
      );
      assert(rejected.kind === "unavailable");
      expect(adapterUnavailableLine(rejected)).toBe(line);
      expect(
        await reader(repository, project.folder, attempt, signal()),
      ).toEqual(proof);
      expect(
        await reader(repository, project.folder, attempt, signal()),
      ).toEqual(proof);
      expect(calls).toBe(2);
    } finally {
      project.cleanup();
    }
  });
}

test("an oversized adapter command answer becomes the shared one MiB proof gap", async () => {
  const project = configuredAdapter();
  const reader = ciAdapterProofReader(() =>
    Promise.reject(
      Object.assign(new Error("answer exceeded limit"), {
        code: "ERR_CHILD_PROCESS_STDIO_MAXBUFFER",
      }),
    ),
  );
  try {
    const rejected = await reader(
      repository,
      project.folder,
      attempt,
      signal(),
    );
    expect(rejected).toEqual({
      kind: "unavailable",
      reason: "too-large",
      limitBytes: 1_048_576,
    });
    assert(rejected.kind === "unavailable");
    expect(adapterUnavailableLine(rejected)).toBe(
      "This attempt's CI proof is larger than the 1 MiB proof limit.",
    );
  } finally {
    project.cleanup();
  }
});
