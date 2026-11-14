// Taken observations and source lifetimes through the actual selected-story owner.
import { test, expect } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { preparedComparison } from "../../tests/support/comparisonMountFacts.ts";
import { takenTrunkComparison } from "../../tests/support/comparisonMountSelections.ts";
import { ciComparisonClient } from "../support/ciComparisonClient.ts";
import { heldResponse } from "../support/ciReadingTransport.ts";

test("a Taken Trunk comparison ignores the same head and rereads only its changed provisional proof", async () => {
  const facts = preparedComparison();
  const taken = takenTrunkComparison(facts);
  const changed = makeMe.aStoryCiComparison
    .with({ ...taken.answer, provisional: facts.answer.landed })
    .please();
  let comparisons = 0;
  const client = ciComparisonClient(facts.source, (query) => {
    if (query.get("intent") === "ci-proof")
      return Response.json(facts.proof(Number(query.get("run"))));
    comparisons += 1;
    return Response.json(comparisons === 1 ? taken.answer : changed);
  });
  try {
    await client.comparison.select(
      facts.source,
      facts.identity,
      "b".repeat(40),
    );
    await client.readProofs();
    expect(client.view()?.answer).toMatchObject({
      phase: "taken",
      mode: "trunk",
      branch: { kind: "not-applicable" },
      provisional: { revision: "b".repeat(40) },
    });
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 2 });
    await client.comparison.select(
      facts.source,
      facts.identity,
      "b".repeat(40),
    );
    await client.readProofs();
    expect(client.counts()).toEqual({ comparisons: 1, proofs: 2 });
    await client.comparison.select(
      facts.source,
      facts.identity,
      "c".repeat(40),
    );
    await client.readProofs();
    expect(client.view()?.answer).toMatchObject({
      provisional: { revision: "c".repeat(40) },
    });
    expect(client.counts()).toEqual({ comparisons: 2, proofs: 3 });
  } finally {
    client.dispose();
  }
});

test("first or absent heads only record while a new source object rereads and departure ignores a late failure", async () => {
  const facts = preparedComparison();
  const held = heldResponse();
  let requests = 0;
  const client = ciComparisonClient(facts.source, () => {
    requests += 1;
    return requests === 2 ? held.response : Response.json(facts.answer);
  });
  try {
    await client.comparison.select(facts.source, undefined);
    expect(requests).toBe(0);
    await client.comparison.select(facts.source, facts.identity);
    expect(
      client.comparison.select(facts.source, facts.identity, "a".repeat(40)),
    ).toBeUndefined();
    expect(
      client.comparison.select(facts.source, facts.identity),
    ).toBeUndefined();
    expect(
      client.comparison.select(facts.source, facts.identity, "b".repeat(40)),
    ).toBeUndefined();
    expect(requests).toBe(1);
    const source = makeMe.aPublishedSource.with({ ...facts.source }).please();
    const old = client.comparison.select(
      source,
      facts.identity,
      "b".repeat(40),
    );
    expect(requests).toBe(2);
    expect(client.requests[0]?.signal.aborted).toBe(true);
    await client.comparison.select(source, undefined);
    expect(client.requests[1]?.signal.aborted).toBe(true);
    expect(client.comparison.getSnapshot()).toMatchObject({
      shown: undefined,
      failed: undefined,
      checkedAgain: 0,
    });
    held.release(Response.json({ error: "Old failure" }, { status: 503 }));
    await old;
    expect(client.comparison.getSnapshot().failed).toBeUndefined();
    await client.comparison.select(source, facts.identity, "b".repeat(40));
    expect(client.comparison.getSnapshot()).toMatchObject({
      shown: facts.answer,
      failed: undefined,
      reading: false,
    });
    expect(requests).toBe(3);
  } finally {
    held.release(Response.json(facts.answer));
    client.dispose();
  }
});
