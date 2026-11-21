// The published-session listing read (../../server/publishedSessionsRead.ts)
// lists the session close records a project published beside its backlog,
// read from that project's real Git at a pinned revision; the read boundary's
// request parsing admits it only at a pinned revision.
import { randomUUID } from "node:crypto";
import { posix } from "node:path";
import { expect, test } from "vitest";
import { backlogPath } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { sessionRecordPath } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { performPublishedSessionsRead } from "../../server/publishedSessionsRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { aCheckout, historyBeforeTheCase } from "../support/doneCaptureCase.ts";

const commit = (digit: string) => digit.repeat(40);

const atItsPath = (record: { sessionId: string }) => ({
  [sessionRecordPath(record.sessionId, backlogPath)]: JSON.stringify(record),
});

// The sessions listed at the base revision of a checkout holding `files`.
async function listed(files: Readonly<Record<string, string>>) {
  const checkout = await aCheckout({
    history: historyBeforeTheCase({ files }),
  });
  return performPublishedSessionsRead(
    {
      repository: checkout.integration,
      revision: checkout.base,
      backlogPath,
      ref: "main",
    },
    new AbortController().signal,
  );
}

test("Given published session records at a revision, when the listing is read there, then each record is listed", async () => {
  const [one, other] = [
    makeMe.aSessionRecord.please(),
    makeMe.aSessionRecord.please(),
  ];

  const outcome = await listed({ ...atItsPath(one), ...atItsPath(other) });

  expect(outcome).toMatchObject({ kind: "answered" });
  expect(
    "answer" in outcome && "sessions" in outcome.answer
      ? outcome.answer.sessions.map(({ sessionId }) => sessionId).sort()
      : [],
  ).toEqual([one.sessionId, other.sessionId].sort());
});

test("Given malformed files beside a valid record, when the listing is read, then only the valid record is listed", async () => {
  const valid = makeMe.aSessionRecord.please();
  const directory = posix.dirname(
    sessionRecordPath(valid.sessionId, backlogPath),
  );

  const outcome = await listed({
    ...atItsPath(valid),
    [`${directory}/${randomUUID()}.json`]: "not json",
    [`${directory}/${randomUUID()}.json`]: JSON.stringify({ version: 2 }),
    [`${directory}/${randomUUID()}.json`]: JSON.stringify(
      makeMe.aSessionRecord.please(),
    ),
  });

  expect(outcome).toMatchObject({
    kind: "answered",
    answer: { sessions: [valid] },
  });
});

test("Given a listing request at an unpinned revision, when it is parsed, then it is refused", () => {
  expect(
    parseRequestedRead(
      new URLSearchParams({ sessions: "published", revision: "main" }),
    ),
  ).toMatchObject({ kind: "refused", status: 400 });
});

test("Given a listing request at a pinned revision, when it is parsed, then it names the listing at that revision", () => {
  expect(
    parseRequestedRead(
      new URLSearchParams({ sessions: "published", revision: commit("c") }),
    ),
  ).toEqual({ kind: "published-sessions-at", revision: commit("c") });
});
