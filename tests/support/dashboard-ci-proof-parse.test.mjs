// Query-shape refusals of Intent's CI proof read
// (`../../dashboard/server/intentCiProofRead.ts` `parseIntentCiProofRead`):
// one run, its attempt and its revision, or one ciAdapter attempt's run,
// attempt id, discovered branch and revision, and nothing else, before any
// GitHub call or adapter run. One browser refusal remains in
// ../../dashboard/tests/intent/intent-ci-proof.spec.ts.
import assert from "node:assert/strict";
import test from "node:test";
import { parseIntentCiProofRead } from "../../dashboard/server/intentCiProofRead.ts";

const revision = `a1b2c3d${"0".repeat(33)}`;
const refusal =
  "A CI proof read names only the Intent request, one run, its attempt and its revision.";

const parse = (query) =>
  parseIntentCiProofRead(new URLSearchParams(`intent=ci-proof&${query}`));

test("a well-formed CI proof query names the run, attempt and revision", () => {
  assert.deepEqual(parse(`run=41&attempt=1&revision=${revision}`), {
    kind: "intent-ci-proof",
    runId: 41,
    runAttempt: 1,
    revision,
  });
});

test("each malformed CI proof query is refused", () => {
  for (const query of [
    `run=41&revision=${revision}`,
    `run=0&attempt=1&revision=${revision}`,
    `run=4.1&attempt=1&revision=${revision}`,
    "run=41&attempt=1&revision=main",
    `run=41&run=42&attempt=1&revision=${revision}`,
    `run=41&attempt=1&revision=${revision}&judged=main`,
    `run=41&attempt=1&revision=${revision}&path=tests`,
  ]) {
    const result = parse(query);
    assert.equal(result?.kind, "refused", query);
    assert.equal(
      result?.kind === "refused" ? result.message : undefined,
      query.includes("revision=main")
        ? "The pinned revision is not a commit sha."
        : refusal,
      query,
    );
  }
});

const uuid = "9f1c2d3e-0000-4000-8000-000000000001";

test("a well-formed adapter CI proof query names the attempt as text", () => {
  assert.deepEqual(
    parse(
      `run=${uuid}&attempt-id=${uuid}&run-branch=feature/x&revision=${revision}`,
    ),
    {
      kind: "intent-ci-proof",
      runId: uuid,
      attemptId: uuid,
      branch: "feature/x",
      revision,
    },
  );
  // A numeric adapter identity stays its text form.
  assert.deepEqual(
    parse(`run=7&attempt-id=1&run-branch=main&revision=${revision}`),
    {
      kind: "intent-ci-proof",
      runId: "7",
      attemptId: "1",
      branch: "main",
      revision,
    },
  );
});

test("each malformed adapter CI proof query is refused", () => {
  const long = "a".repeat(257);
  for (const query of [
    `attempt-id=1&run-branch=main&revision=${revision}`,
    `run=7&attempt-id=1&revision=${revision}`,
    `run=7&attempt-id=&run-branch=main&revision=${revision}`,
    `run=&attempt-id=1&run-branch=main&revision=${revision}`,
    `run=${long}&attempt-id=1&run-branch=main&revision=${revision}`,
    `run=7&attempt-id=${long}&run-branch=main&revision=${revision}`,
    `run=7&attempt-id=1&attempt-id=2&run-branch=main&revision=${revision}`,
    `run=7&attempt-id=1&attempt=1&run-branch=main&revision=${revision}`,
    `run=7&attempt-id=1&run-branch=a..b&revision=${revision}`,
    `run=7&attempt-id=1&run-branch=main&revision=${revision}&judged=main`,
  ]) {
    const result = parse(query);
    assert.equal(result?.kind, "refused", query);
    assert.equal(
      result?.kind === "refused" ? result.message : undefined,
      refusal,
      query,
    );
  }
});
