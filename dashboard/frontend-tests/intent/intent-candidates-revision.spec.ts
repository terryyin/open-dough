// Optimization Candidates, shown across a newer offered revision, stays the
// chosen view and keeps the record of the revision Intent reads until
// **Show latest**, which reads the record recorded at the new revision. An
// old read still outstanding then neither shows a failure when it departs
// nor replaces the new record when it answers late
// (../../src/IntentCandidatesRecord.tsx, ../../src/IntentRevisionNotice.tsx).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCandidatesReadResult } from "../../src/authenticatedIntentCandidatesRead.ts";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { intentCandidates } from "./intent-candidates-page.ts";
import { mountIntentReading } from "./intent-revision-fixtures.ts";
import { intentRevisionNotice } from "./intent-revision-notice-page.ts";

const before = "ab".repeat(20);
const after = "e9".repeat(20);
const recordWith = (slug: string) =>
  makeMe.aTestOptimizationCandidatesRecord
    .pending(slug, "`dashboard/tests/launch.spec.ts`")
    .please();
const records: Record<string, string> = {
  [before]: recordWith("launch-records-poll-waits"),
  [after]: recordWith("launch-records-page-clock"),
};

type Reply = (
  revision: string,
  signal: AbortSignal,
) => Promise<IntentCandidatesReadResult>;
const present = (revision: string) =>
  Promise.resolve<IntentCandidatesReadResult>({
    status: "present",
    text: records[revision] ?? "",
  });

// A reply the case holds until it releases it with the reply's record.
function heldReply() {
  let release: (read: IntentCandidatesReadResult) => void = () => undefined;
  const promise = new Promise<IntentCandidatesReadResult>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

// Every record read, by revision, answered by `reply`: by default at once
// with that revision's record.
function recordReads(reply: Reply = present): {
  reads: string[];
  readSource: IntentReadSource;
} {
  const reads: string[] = [];
  return {
    reads,
    readSource: {
      readLocations: () =>
        Promise.resolve({ status: "configured", locations: [] }),
      readCandidates(...[, revision, signal]) {
        reads.push(revision);
        return reply(revision, signal);
      },
      readFile: () => Promise.reject(new Error("no case reads a file")),
    },
  };
}

// Mounts the reading on Optimization Candidates at `before`, where the first
// read shows the old entry, then offers `after` and chooses **Show latest**.
// Every later read is answered by `reply`.
async function showLatestAfterOffer(reply: Reply) {
  let firstRead = true;
  const { reads, readSource } = recordReads((revision, signal) => {
    if (!firstRead) return reply(revision, signal);
    firstRead = false;
    return present(revision);
  });
  const intent = await mountIntentReading(readSource, before, "candidates");
  await intentCandidates().shows("launch-records-poll-waits");
  await intent.offerRevision(after);
  await (await intentRevisionNotice().isShownOnce()).showLatest();
  return { reads, candidates: intentCandidates() };
}

test("Optimization Candidates shown across a new revision stays chosen and reads that revision's record after Show latest", async () => {
  const { reads, readSource } = recordReads();
  const intent = await mountIntentReading(readSource, before, "candidates");
  const candidates = intentCandidates();
  await candidates.isChosen();
  await candidates.isRecordedAt(before);
  await candidates.shows("launch-records-poll-waits");

  await intent.offerRevision(after);
  const notice = await intentRevisionNotice().isShownOnce();
  await candidates.isChosen();
  await candidates.isRecordedAt(before);
  await candidates.shows("launch-records-poll-waits");

  await notice.showLatest();
  await candidates.isChosen();
  await candidates.isRecordedAt(after);
  await candidates.shows("launch-records-page-clock");
  await candidates.lacks("launch-records-poll-waits");
  expect(reads).toContain(after);
});

test("an old read that departs at Show latest shows no failure while the new record is read", async () => {
  const newRecord = heldReply();
  const { reads, candidates } = await showLatestAfterOffer(
    (revision, signal) =>
      revision === after
        ? newRecord.promise
        : new Promise((...[, reject]) => {
            signal.addEventListener("abort", () => {
              reject(signal.reason as Error);
            });
          }),
  );
  await candidates.isRecordedAt(after);
  await candidates.isReading();
  await candidates.showsNoFailure();
  await candidates.lacks("launch-records-poll-waits");
  expect(reads).toContain(after);

  newRecord.release(await present(after));
  await candidates.shows("launch-records-page-clock");
  await candidates.showsNoFailure();
});

test("an old read that answers after the new record shows cannot replace it", async () => {
  const lateAnswers: (() => Promise<void>)[] = [];
  const { candidates } = await showLatestAfterOffer((revision) => {
    if (revision === after) return present(after);
    const oldRecord = heldReply();
    lateAnswers.push(async () => {
      oldRecord.release(await present(before));
      await oldRecord.promise;
    });
    return oldRecord.promise;
  });
  await candidates.shows("launch-records-page-clock");

  await Promise.all(lateAnswers.map((answer) => answer()));
  // A task later, any render the late answers caused has happened.
  await new Promise((rendered) => setTimeout(rendered, 0));
  await candidates.isRecordedAt(after);
  await candidates.shows("launch-records-page-clock");
  await candidates.lacks("launch-records-poll-waits");
  await candidates.showsNoFailure();
});
