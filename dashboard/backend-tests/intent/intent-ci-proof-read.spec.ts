// Intent CI proof admission (`../../server/intentCiProofRead.ts`
// `parseIntentCiProofRead` via `parseRequestedRead`): a proof query must name
// the run's attempt; one that omits it is refused before any provider is asked.
// Query-shape refusals of `parseIntentCiProofRead`:
// ../../../Distribution/tests/support/dashboard-ci-proof-parse.test.mjs.

import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { ciProofArtifactReader } from "../../server/ciProofArtifact.ts";
import {
  parseIntentCiProofRead,
  performIntentCiProofRead,
  type IntentCiProofReaders,
} from "../../server/intentCiProofRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";

const revision = "a1".repeat(20);
const source = makeMe.aPublishedSource.openDough.please();
const refusal =
  "A CI proof read names only the Intent request, one run, its attempt and its revision.";

test("a CI proof query that omits the attempt is refused before asking the provider", async () => {
  const listing = vi.fn().mockResolvedValue({ artifacts: [] });
  const archive = vi.fn();
  const adapter = vi.fn();
  const readers: IntentCiProofReaders = {
    artifact: ciProofArtifactReader({ listing, archive }),
    adapter: adapter as IntentCiProofReaders["adapter"],
  };
  const omitted = new URLSearchParams(
    `intent=ci-proof&run=41&revision=${revision}`,
  );

  expect(parseIntentCiProofRead(omitted)).toMatchObject({
    kind: "refused",
    status: 400,
    message: refusal,
  });
  // Authenticated admission refuses before `perform` (`authenticatedRead.ts`).
  expect(parseRequestedRead(omitted)).toMatchObject({
    kind: "refused",
    status: 400,
    message: refusal,
  });
  expect(listing).toHaveBeenCalledTimes(0);
  expect(archive).toHaveBeenCalledTimes(0);
  expect(adapter).toHaveBeenCalledTimes(0);

  // The same query naming its attempt is admitted and asks the artifact provider.
  const complete = parseRequestedRead(
    new URLSearchParams(
      `intent=ci-proof&run=41&attempt=1&revision=${revision}`,
    ),
  );
  expect(complete).toMatchObject({
    kind: "intent-ci-proof",
    runId: 41,
    runAttempt: 1,
    revision,
  });
  if (complete.kind !== "intent-ci-proof")
    throw new Error("expected intent-ci-proof admission");
  await performIntentCiProofRead(
    source,
    complete,
    new AbortController().signal,
    () => "/unused",
    readers,
  );
  expect(listing).toHaveBeenCalledTimes(1);
  expect(archive).toHaveBeenCalledTimes(0);
  expect(adapter).toHaveBeenCalledTimes(0);
});
