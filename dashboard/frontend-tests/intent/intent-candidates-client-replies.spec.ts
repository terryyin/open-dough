// The authenticated client classifies a refused or malformed candidates
// answer as a terminal failure, never as transient recovery
// (../../src/authenticatedIntentCandidatesRead.ts, ../../src/authenticatedGet.ts).
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { readIntentCandidatesAt } from "../../src/authenticatedIntentCandidatesRead.ts";
import { ReadProblem } from "../../src/readProblem.ts";

// Each case asks at its own revision: answers are kept per revision.
const [refusedAt, malformedAt] = ["e7".repeat(20), "e8".repeat(20)];

// The local authenticated read answers `status` with `body`.
function answers(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json(body, { status }))),
  );
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });
}

async function failureOf(revision: string) {
  const failure: unknown = await readIntentCandidatesAt(
    makeMe.aPublishedSource.pygardon.please(),
    revision,
    new AbortController().signal,
  ).catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(ReadProblem);
  return failure as ReadProblem;
}

test("a refused candidates read is a terminal failure", async () => {
  answers(403, { error: "Forbidden" });
  const failure = await failureOf(refusedAt);
  expect(failure.message).toBe("Forbidden");
  expect(failure.recovery).toBeUndefined();
  expect(failure.limited).toBeUndefined();
});

test("a malformed candidates answer claiming transient recovery is a terminal failure", async () => {
  answers(200, {
    revision: malformedAt,
    candidates: 42,
    recovery: "transient",
  });
  const failure = await failureOf(malformedAt);
  expect(failure.message).toContain(
    "answered in a shape this dashboard does not understand",
  );
  expect(failure.recovery).toBeUndefined();
  expect(failure.limited).toBeUndefined();
});
