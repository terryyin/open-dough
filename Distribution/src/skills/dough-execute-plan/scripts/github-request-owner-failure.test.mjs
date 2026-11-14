import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ownerFailure,
  ownerFailureText,
  safeOwnerCause,
} from "./github-request-owner-failure.mjs";
import { answerFromWire } from "./github-request-owner-wire.mjs";

test("arbitrary exceptions and owner cause fields remain unknown without exposing their contents", () => {
  const secret = "gho_secret-token-at-/secret/endpoint/path";
  assert.deepEqual(ownerFailure(new Error(secret)), {
    kind: "owner-unavailable",
    cause: "unknown",
  });
  for (const cause of [secret, "constructor", "__proto__", undefined, {}]) {
    assert.equal(safeOwnerCause(cause), "unknown");
    const answer = answerFromWire({
      headers: [],
      failure: { kind: "owner-unavailable", cause },
    });
    assert.deepEqual(answer.failure, {
      kind: "owner-unavailable",
      cause: "unknown",
    });
    assert.ok(ownerFailureText(cause).includes("gave no usable answer"));
    assert.equal(JSON.stringify(answer).includes(secret), false);
    assert.equal(ownerFailureText(cause).includes(secret), false);
  }
});
