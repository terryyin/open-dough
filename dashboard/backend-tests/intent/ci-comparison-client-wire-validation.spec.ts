// Real wire validation and exact attempt identity; no selected subjects are faked.
import { test, expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readIntentCiComparison,
  readSelectedIntentCiComparison,
} from "../../src/authenticatedIntentCiComparisonRead.ts";
import { readIntentCiProof } from "../../src/authenticatedIntentCiProofRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { ciReadingTransport } from "../support/ciReadingTransport.ts";

const start = "a".repeat(40);
const end = "b".repeat(40);

for (const malformed of [
  `start=${start}`,
  `end=${end}`,
  `start=main%5E&end=${end}`,
  `start=${start}&end=bbbbbbb`,
  `start=${start}&start=${start}&end=${end}`,
  `start=${start}&end=${end}&end=${end}`,
]) {
  test(`refuses an ambiguous comparison range (${malformed.replace(/\w{40}/g, "sha")}) before read dispatch`, () => {
    const { identity } = makeMe.aComparedStory.please();
    const params = new URLSearchParams(
      `intent=ci-comparison&identity=${encodeURIComponent(identity)}&${malformed}`,
    );
    expect(parseRequestedRead(params)).toMatchObject({
      kind: "refused",
      status: 400,
      message:
        "A selected CI comparison needs one start and one end commit ID.",
    });
  });
}

test("actual authenticated readers preserve encoded numeric and adapter subjects and refuse mismatched answers", async () => {
  const facts = makeMe.aComparedStory.please();
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
  const otherIdentity = makeMe.aComparedStory
    .withAnswer({ identity: "SEED-B#b" })
    .please().answer;
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

const range = { start, end };

function selectionOf(facts: ReturnType<typeof makeMe.aComparedStory.please>) {
  return makeMe.aSelectedCiComparison
    .with({
      source: facts.source.id,
      identity: facts.identity,
      range,
      baseline: facts.answer.baseline,
      selection: facts.answer.branch,
    })
    .please();
}

test("the selected comparison request names the source, story and both commits", async () => {
  const facts = makeMe.aComparedStory.please();
  const answer = selectionOf(facts);
  const transport = ciReadingTransport(() => Response.json(answer));
  const signal = new AbortController().signal;
  try {
    await expect(
      readSelectedIntentCiComparison(
        facts.source,
        facts.identity,
        range,
        signal,
      ),
    ).resolves.toEqual(answer);
    expect(transport.requests).toEqual([
      {
        url: `/__authenticated-read?source=example&intent=ci-comparison&identity=SEED-A%23a&start=${range.start}&end=${range.end}`,
        signal,
      },
    ]);
  } finally {
    transport.restore();
  }
});

test.each([
  { name: "source ID", fields: { source: "other-source" } },
  { name: "story identity", fields: { identity: "SEED-B#b" } },
  {
    name: "start revision",
    fields: { range: { ...range, start: "c".repeat(40) } },
  },
  {
    name: "end revision",
    fields: { range: { ...range, end: "c".repeat(40) } },
  },
])("a selected comparison refuses a different $name", async ({ fields }) => {
  const facts = makeMe.aComparedStory.please();
  const transport = ciReadingTransport(() =>
    Response.json({ ...selectionOf(facts), ...fields }),
  );
  try {
    await expect(
      readSelectedIntentCiComparison(
        facts.source,
        facts.identity,
        range,
        new AbortController().signal,
      ),
    ).rejects.toThrow("shape this dashboard does not understand");
  } finally {
    transport.restore();
  }
});

test("a selected gap cannot answer a default comparison", async () => {
  const facts = makeMe.aComparedStory.please();
  const transport = ciReadingTransport(() =>
    Response.json({
      kind: "unavailable",
      checkedAt: facts.answer.checkedAt,
      identity: facts.identity,
      explanation: "No evidence for the selected commits.",
      source: facts.source.id,
      range,
    }),
  );
  try {
    await expect(
      readIntentCiComparison(
        facts.source,
        facts.identity,
        new AbortController().signal,
      ),
    ).rejects.toThrow("shape this dashboard does not understand");
  } finally {
    transport.restore();
  }
});
