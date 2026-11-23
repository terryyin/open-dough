// The Candidates reader asks its transport once for each answer fixed at a
// revision and keeps it for the page; an unreadable or invalid reply and
// another revision are asked again
// (../../src/authenticatedIntentCandidatesRead.ts, ../../src/answerMemo.ts).
// Wire classification: ./intent-candidates-client-replies.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCandidatesAnswer } from "../../server/intentCandidatesRead.ts";
import type { authenticatedGet } from "../../src/authenticatedGet.ts";
import {
  intentCandidatesReader,
  keptIntentCandidatesAt,
} from "../../src/authenticatedIntentCandidatesRead.ts";
import { ReadProblem } from "../../src/readProblem.ts";

const source = makeMe.aPublishedSource.pygardon.please();
const recordText = makeMe.aTestOptimizationCandidatesRecord.please();

// A transport answering each revision's reply from `replies`, counting asks.
function transportAnswering(
  replies: (revision: string) => IntentCandidatesAnswer,
) {
  const asked: string[] = [];
  const get: typeof authenticatedGet = (query) => {
    const revision = new URLSearchParams(query).get("revision") ?? "";
    asked.push(revision);
    return Promise.resolve(replies(revision));
  };
  const read = intentCandidatesReader(get);
  return {
    asked,
    readAt: (revision: string) =>
      read(source, revision, new AbortController().signal),
  };
}

// Reads `candidates` at `revision` twice: the same record, asked once.
async function expectAskedOnceAt(revision: string, candidates: string | null) {
  const reader = transportAnswering((at) => ({ revision: at, candidates }));
  const first = await reader.readAt(revision);
  const second = await reader.readAt(revision);
  expect(second).toBe(first);
  expect(reader.asked).toEqual([revision]);
}

// Each case reads at its own revisions: answers are kept per revision.
test("a present candidates reply is asked once at its revision", async () => {
  await expectAskedOnceAt("c1".repeat(20), recordText);
});

test("an absent candidates reply is asked once at its revision", async () => {
  await expectAskedOnceAt("c2".repeat(20), null);
});

test("a present candidates reply is kept for the page to show on return", async () => {
  const revision = "c3".repeat(20);
  const reader = transportAnswering((at) => ({
    revision: at,
    candidates: recordText,
  }));
  const read = await reader.readAt(revision);
  expect(keptIntentCandidatesAt(source, revision)).toBe(read);
  expect(read).toEqual({ status: "present", text: recordText });
});

test("another revision's candidates reply is asked on its own", async () => {
  const [first, next] = ["c4".repeat(20), "c5".repeat(20)];
  const reader = transportAnswering((at) => ({
    revision: at,
    candidates: at === first ? recordText : null,
  }));
  await reader.readAt(first);
  expect(await reader.readAt(next)).toEqual({ status: "absent" });
  expect(reader.asked).toEqual([first, next]);
});

test("an unreadable candidates reply is asked again", async () => {
  const revision = "c6".repeat(20);
  const reader = transportAnswering((at) => ({
    revision: at,
    candidates: null,
    candidatesProblem: "unreadable",
    recovery: "transient",
  }));
  expect(await reader.readAt(revision)).toEqual({
    status: "unreadable",
    recovery: "transient",
  });
  await reader.readAt(revision);
  expect(reader.asked).toEqual([revision, revision]);
});

test("an invalid candidates reply fails and is asked again", async () => {
  const revision = "c7".repeat(20);
  const reader = transportAnswering(
    (at) =>
      ({ revision: at, candidates: 42 }) as unknown as IntentCandidatesAnswer,
  );
  await expect(reader.readAt(revision)).rejects.toBeInstanceOf(ReadProblem);
  await expect(reader.readAt(revision)).rejects.toBeInstanceOf(ReadProblem);
  expect(reader.asked).toEqual([revision, revision]);
});
