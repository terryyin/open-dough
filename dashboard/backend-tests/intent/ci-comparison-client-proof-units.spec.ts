import { test, expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readIntentCiProof } from "../../src/authenticatedIntentCiProofRead.ts";
import { ciReadingTransport } from "../support/ciReadingTransport.ts";

test("the proof reader accepts both declared units and refuses a response with one undeclared unit", async () => {
  const facts = makeMe.aComparedStory
    .withEntries([
      [],
      [
        makeMe.aCiProofEntry.at("cases").counting(5, "case").please(),
        makeMe.aCiProofEntry.at("files").counting(3, "file").please(),
      ],
    ])
    .please();
  const answer = facts.entryProof(2);
  const { runId, runAttempt, revision } = answer;
  const subject = { runId, runAttempt, revision };
  if (answer.proof.kind !== "summary") throw new Error("Arrange a summary");
  const summary = answer.proof.summary;
  const [cases, files] = summary.entries;
  if (cases === undefined || files === undefined) {
    throw new Error("Arrange proof in both declared units");
  }
  const response = {
    ...answer,
    proof: {
      ...answer.proof,
      summary: {
        ...summary,
        entries: [
          cases,
          {
            ...files,
            evidence: files.evidence.map((item) => ({
              ...item,
              unit: "legacy",
              label: "checks",
            })),
          },
        ],
      },
    },
  };
  const transport = ciReadingTransport((...[, index]) =>
    Response.json(index === 1 ? answer : response),
  );
  const signal = new AbortController().signal;
  try {
    expect(await readIntentCiProof(facts.source, subject, signal)).toEqual(
      answer.proof,
    );
    await expect(
      readIntentCiProof(facts.source, subject, signal),
    ).rejects.toThrow("shape this dashboard does not understand");
  } finally {
    transport.restore();
  }
});
