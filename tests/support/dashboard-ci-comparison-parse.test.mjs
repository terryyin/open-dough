// Query-shape refusals of Intent's CI comparison read
// (`../../dashboard/server/intentCiComparisonRead.ts`
// `parseIntentCiComparisonRead`): one story identity and nothing else,
// before any GitHub or Git call.
import assert from "node:assert/strict";
import test from "node:test";
import { parseIntentCiComparisonRead } from "../../dashboard/server/intentCiComparisonParse.ts";

const refusal =
  "A CI comparison read names only the Intent request and one story identity.";

const parse = (query) =>
  parseIntentCiComparisonRead(
    new URLSearchParams(`intent=ci-comparison&${query}`),
  );

test("a well-formed CI comparison query names the identity", () => {
  assert.deepEqual(parse("identity=SEED-A%23a"), {
    kind: "intent-ci-comparison",
    identity: "SEED-A#a",
  });
});

test("each malformed CI comparison query is refused", () => {
  for (const query of [
    "",
    "identity=",
    "identity=SEED-A%23a&identity=SEED-B%23b",
    "identity=SEED-A%23a&revision=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "identity=SEED-A%23a&judged=main",
    "identity=SEED-A%23a&path=tests",
    `identity=${"x".repeat(201)}`,
    "identity=line%0Abreak",
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
