// Real wire validation and exact attempt identity; no selected subjects are faked.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readIntentCiComparison } from "../../src/authenticatedIntentCiComparisonRead.ts";
import { readIntentCiProof } from "../../src/authenticatedIntentCiProofRead.ts";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { ciReadingTransport } from "../support/ciReadingTransport.ts";

test("actual authenticated readers preserve encoded numeric and adapter subjects and refuse mismatched answers", async () => {
  const facts = preparedComparison();
  const numeric = { runId: 2, runAttempt: 1, revision: "b".repeat(40) };
  const adapter = {
    runId: "pipeline+#",
    attemptId: "attempt/? +",
    branch: "feature/topic",
    revision: "c".repeat(40),
  };
  const adapterProof = makeMe.aCiProof.summaryForAdapter(adapter).please();
  const adapterAnswer = {
    ...adapter,
    checkedAt: facts.answer.checkedAt,
    proof: adapterProof,
  };
  const otherIdentity = makeMe.aStoryCiComparison
    .with({ ...facts.answer, identity: "SEED-B#b" })
    .please();
  const responses = [
    Response.json(facts.answer),
    Response.json(facts.proof(2)),
    Response.json(adapterAnswer),
    Response.json({ ...facts.proof(2), runAttempt: 99 }),
    Response.json(otherIdentity),
    Response.json({ ...adapterAnswer, branch: "other/topic" }),
    Response.json({ error: "Forbidden" }, { status: 403 }),
  ];
  const transport = ciReadingTransport((...[, index]) => {
    const response = responses[index - 1];
    if (response === undefined) throw new Error("Unarranged response");
    return response;
  });
  const signal = new AbortController().signal;
  try {
    expect(
      await readIntentCiComparison(facts.source, facts.identity, signal),
    ).toEqual(facts.answer);
    expect(await readIntentCiProof(facts.source, numeric, signal)).toEqual(
      facts.proof(2).proof,
    );
    expect(await readIntentCiProof(facts.source, adapter, signal)).toEqual(
      adapterProof,
    );
    await expect(
      readIntentCiProof(facts.source, numeric, signal),
    ).rejects.toThrow("shape this dashboard does not understand");
    await expect(
      readIntentCiComparison(facts.source, facts.identity, signal),
    ).rejects.toThrow("shape this dashboard does not understand");
    await expect(
      readIntentCiProof(facts.source, adapter, signal),
    ).rejects.toThrow("shape this dashboard does not understand");
    await expect(
      readIntentCiComparison(facts.source, facts.identity, signal),
    ).rejects.toThrow("Forbidden");
    const comparison =
      "/__authenticated-read?source=example&intent=ci-comparison&identity=SEED-A%23a";
    const run = `/__authenticated-read?source=example&intent=ci-proof&run=2&attempt=1&revision=${"b".repeat(40)}`;
    const pipeline = `/__authenticated-read?source=example&intent=ci-proof&run=pipeline%2B%23&attempt-id=attempt%2F%3F+%2B&run-branch=feature%2Ftopic&revision=${"c".repeat(40)}`;
    expect(transport.requests.map(({ url }) => url)).toEqual([
      comparison,
      run,
      pipeline,
      run,
      comparison,
      pipeline,
      comparison,
    ]);
    expect(
      transport.requests.every((request) => request.signal === signal),
    ).toBe(true);
  } finally {
    transport.restore();
  }
});
