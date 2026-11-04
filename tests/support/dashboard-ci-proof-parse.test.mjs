// Query-shape refusals of Intent's CI proof read
// (`../../dashboard/server/intentCiProofRead.ts` `parseIntentCiProofRead`):
// one run, its attempt and its revision, and nothing else, before any
// GitHub call. One browser refusal remains in
// ../../dashboard/tests/intent-ci-proof.spec.ts.
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
