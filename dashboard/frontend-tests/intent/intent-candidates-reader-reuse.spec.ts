// The Candidates reader asks its transport once for each answer fixed at a
// revision and keeps it for the page; an unreadable or invalid reply and
// another revision are asked again
// (../../src/authenticatedIntentCandidatesRead.ts, ../../src/answerMemo.ts).
// Wire classification: ./intent-candidates-client-replies.spec.ts.
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentCandidatesAnswer } from "../../server/intentCandidatesRead.ts";
import { forgetAnswers } from "../../src/answerMemo.ts";
import type { authenticatedGet } from "../../src/authenticatedGet.ts";
import {
  intentCandidatesReader,
  keptIntentCandidatesAt,
} from "../../src/authenticatedIntentCandidatesRead.ts";
import { ReadProblem } from "../../src/readProblem.ts";

const source = makeMe.aPublishedSource.pygardon.please();
const recordText = makeMe.aTestOptimizationCandidatesRecord.please();
const revision = "c1".repeat(20);
const anotherRevision = "c2".repeat(20);

// A transport answering each revision's reply from `replies`, counting asks.
// The page's answer memo is emptied when the case finishes.
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
  onTestFinished(forgetAnswers);
  return {
    asked,
    readAt: (revision: string) =>
      read(source, revision, new AbortController().signal),
  };
}

// Reads `candidates` at `revision` twice: the same record, asked once.
async function expectAskedOnce(candidates: string | null) {
  const reader = transportAnswering((at) => ({ revision: at, candidates }));
  const first = await reader.readAt(revision);
  const second = await reader.readAt(revision);
  expect(second).toBe(first);
  expect(reader.asked).toEqual([revision]);
}

test("a present candidates reply is asked once at its revision", async () => {
  await expectAskedOnce(recordText);
});

test("an absent candidates reply is asked once at its revision", async () => {
  await expectAskedOnce(null);
});

test("a present candidates reply is kept for the page to show on return", async () => {
  const reader = transportAnswering((at) => ({
    revision: at,
    candidates: recordText,
  }));
  const read = await reader.readAt(revision);
  expect(keptIntentCandidatesAt(source, revision)).toBe(read);
  expect(read).toEqual({ status: "present", text: recordText });
});

test("another revision's candidates reply is asked on its own", async () => {
  const reader = transportAnswering((at) => ({
    revision: at,
    candidates: at === revision ? recordText : null,
  }));
  await reader.readAt(revision);
  expect(await reader.readAt(anotherRevision)).toEqual({ status: "absent" });
  expect(reader.asked).toEqual([revision, anotherRevision]);
});

test("an unreadable candidates reply is asked again", async () => {
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
  const reader = transportAnswering(
    (at) =>
      ({ revision: at, candidates: 42 }) as unknown as IntentCandidatesAnswer,
  );
  await expect(reader.readAt(revision)).rejects.toBeInstanceOf(ReadProblem);
  await expect(reader.readAt(revision)).rejects.toBeInstanceOf(ReadProblem);
  expect(reader.asked).toEqual([revision, revision]);
});
