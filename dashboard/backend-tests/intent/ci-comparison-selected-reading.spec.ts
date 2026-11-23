import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readIntentCiComparison,
  readSelectedIntentCiComparison,
} from "../../src/authenticatedIntentCiComparisonRead.ts";
import { readIntentCiProof } from "../../src/authenticatedIntentCiProofRead.ts";
import { createSelectedCiComparisonProofs } from "../../src/ciComparisonProofs.ts";
import {
  createCiComparisonReading,
  createSelectedCiComparisonReading,
} from "../../src/ciComparisonReading.ts";
import type { CiComparisonRange } from "../../src/selectedCiComparison.ts";
import {
  ciReadingTransport,
  heldResponse,
} from "../support/ciReadingTransport.ts";

const firstRange = { start: "a".repeat(40), end: "b".repeat(40) };
const nextRange = { start: firstRange.start, end: "c".repeat(40) };

function rangeFor(
  facts: ReturnType<typeof makeMe.aComparedStory.please>,
  range: CiComparisonRange,
  result: "branch" | "landed",
) {
  return makeMe.aSelectedCiComparison
    .with({
      source: facts.source.id,
      identity: facts.identity,
      range,
      baseline: facts.answer.baseline,
      selection: facts.answer[result],
    })
    .please();
}

test("a late answer cannot replace the result for a new revision pair of the same story", async () => {
  const facts = makeMe.aComparedStory.please();
  const first = rangeFor(facts, firstRange, "branch");
  const next = rangeFor(facts, nextRange, "landed");
  const held = heldResponse();
  const transport = ciReadingTransport((query) =>
    query.get("end") === firstRange.end ? held.response : Response.json(next),
  );
  const reading = createSelectedCiComparisonReading(
    readSelectedIntentCiComparison,
  );
  const { source, identity } = facts;
  try {
    const oldRead = reading.select(source, { identity, range: firstRange });
    await reading.select(source, { identity, range: nextRange });
    expect(transport.requests[0]?.signal.aborted).toBe(true);
    held.release(Response.json(first));
    await oldRead;
    expect(reading.getSnapshot().shown).toEqual(next);
  } finally {
    held.release(Response.json(first));
    reading.dispose();
    transport.restore();
  }
});

test("checking a selected comparison again keeps its pair and leaves the default available on return", async () => {
  const facts = makeMe.aComparedStory.please();
  const selectedAnswer = rangeFor(facts, firstRange, "branch");
  const transport = ciReadingTransport((query) =>
    Response.json(query.has("end") ? selectedAnswer : facts.answer),
  );
  const wholeStory = createCiComparisonReading(readIntentCiComparison);
  const selected = createSelectedCiComparisonReading(
    readSelectedIntentCiComparison,
  );
  const { source, identity } = facts;
  try {
    await wholeStory.select(source, identity);
    await selected.select(source, { identity, range: firstRange });
    await selected.checkAgain();
    expect(selected.getSnapshot()).toMatchObject({
      checkedAgain: 1,
      shown: { range: firstRange },
    });
    const requestedEnds = transport.requests.map(({ url }) =>
      new URL(url, "http://local.test").searchParams.get("end"),
    );
    expect(requestedEnds).toEqual([null, firstRange.end, firstRange.end]);
    await selected.select(source, undefined);
    expect(selected.getSnapshot().shown).toBeUndefined();
    expect(wholeStory.getSnapshot()).toMatchObject({
      checkedAgain: 0,
      shown: facts.answer,
    });
  } finally {
    selected.dispose();
    wholeStory.dispose();
    transport.restore();
  }
});

test("the selected pair reads proof for each measured attempt and revision", async () => {
  const adapter = {
    runId: "pipeline+selected",
    attemptId: "retry 2",
    branch: "main",
    revision: "d".repeat(40),
  };
  const facts = makeMe.aComparedStory
    .withAdapterAttemptAt("landed", adapter, { revision: adapter.revision })
    .please();
  const answer = rangeFor(facts, nextRange, "landed");
  const adapterAnswer = makeMe.anIntentCiProofAnswer
    .with({
      ...adapter,
      checkedAt: answer.checkedAt,
      proof: makeMe.aCiProof.summaryForAdapter(adapter).please(),
    })
    .please();
  const baseline = facts.proof(1);
  const transport = ciReadingTransport((query) =>
    Response.json(query.has("attempt-id") ? adapterAnswer : baseline),
  );
  const proofs = createSelectedCiComparisonProofs(readIntentCiProof);
  try {
    await proofs.select(facts.source, answer, 0);
    expect(transport.requests.map(({ url }) => url)).toEqual([
      `/__authenticated-read?source=example&intent=ci-proof&run=${baseline.runId}&attempt=${baseline.runAttempt}&revision=${baseline.revision}`,
      `/__authenticated-read?source=example&intent=ci-proof&run=pipeline%2Bselected&attempt-id=retry+2&run-branch=main&revision=${adapter.revision}`,
    ]);
    expect(proofs.proofsFor(facts.source, answer, 0)).toMatchObject({
      baseline: { kind: "summary" },
      selection: { kind: "summary" },
    });
  } finally {
    proofs.dispose();
    transport.restore();
  }
});
