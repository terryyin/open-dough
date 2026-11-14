// A failed schema or asked-attempt identity check cannot poison proof memory.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciAdapterProofReader } from "../../server/ciAdapterProof.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
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

for (const [reason, changed] of [
  ["invalid", { schemaVersion: 0 }],
  ["mismatched", { repository: "example/other" }],
  ["mismatched", { attemptId: "retry:1" }],
  ["mismatched", { revision: "b".repeat(40) }],
] as const) {
  test(`adapter ${JSON.stringify(changed)} is ${reason}, reacquired and checked before memory`, async () => {
    const project = configuredAdapter();
    const proof = makeMe.aCiProof.summaryForAdapter(attempt).please();
    let calls = 0;
    const reader = ciAdapterProofReader(() => {
      calls += 1;
      return Promise.resolve({
        summary: calls === 1 ? { ...proof.summary, ...changed } : proof.summary,
      });
    });
    try {
      const rejected = await reader(
        repository,
        project.folder,
        attempt,
        signal(),
      );
      expect(rejected).toMatchObject({ kind: "unavailable", reason });
      if (reason === "invalid")
        expect(rejected).toMatchObject({
          detail: "schemaVersion is not 1 or 2",
        });
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
    expect(await reader(repository, project.folder, attempt, signal())).toEqual(
      {
        kind: "unavailable",
        reason: "too-large",
        limitBytes: 1_048_576,
      },
    );
  } finally {
    project.cleanup();
  }
});
