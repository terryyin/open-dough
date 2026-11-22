// The published-session listing admits only pinned revisions and lists the
// valid session close records at their own paths beside the backlog.

import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performPublishedSessionsRead } from "../../server/publishedSessionsRead.ts";
import { parseRequestedRead } from "../../server/requestedRead.ts";

const source = makeMe.aPublishedSource
  .with({
    ...makeMe.aPublishedSource.pygardon.please(),
    backlogPath: "planning/team/WORK.md",
  })
  .please();
const revision = "a1".repeat(20);
const read = { kind: "published-sessions-at", revision } as const;
const sessionsDirectory = "planning/team/sessions";

const atItsPath = (record: { sessionId: string }) => ({
  [sessionRecordPathBeside(source.backlogPath, record.sessionId)]:
    JSON.stringify(record),
});

const readListing = (files: Readonly<Record<string, string>>) =>
  performPublishedSessionsRead(
    source,
    read,
    (directory) => {
      expect(directory).toBe(sessionsDirectory);
      return Promise.resolve(
        Object.keys(files).map((path, index) => ({
          name: path.slice(directory.length + 1),
          sha: index.toString(16).padStart(40, "0"),
        })),
      );
    },
    ({ path }) => {
      const text = files[path];
      if (text === undefined) throw new Error(`Unexpected blob read: ${path}`);
      return Promise.resolve(text);
    },
  );

test("lists two valid published records in path order at the requested revision", async () => {
  const one = makeMe.aSessionRecord.please();
  const other = makeMe.aSessionRecord.please();
  const [first, last] =
    one.sessionId < other.sessionId ? [one, other] : [other, one];

  expect(
    await readListing({ ...atItsPath(last), ...atItsPath(first) }),
  ).toEqual({
    kind: "answered",
    answer: { revision, sessions: [first, last] },
  });
});

test("skips malformed records and valid records at another UUID's path", async () => {
  const valid = makeMe.aSessionRecord.please();
  const misplaced = makeMe.aSessionRecord.please();

  expect(
    await readListing({
      ...atItsPath(valid),
      [sessionRecordPathBeside(source.backlogPath, randomUUID())]: "not json",
      [sessionRecordPathBeside(source.backlogPath, randomUUID())]:
        JSON.stringify({
          version: 2,
        }),
      [sessionRecordPathBeside(source.backlogPath, randomUUID())]:
        JSON.stringify(misplaced),
    }),
  ).toEqual({
    kind: "answered",
    answer: { revision, sessions: [valid] },
  });
});

test("skips a session record with two ranges", async () => {
  const record = makeMe.aSessionRecord.please();
  const twoRanges = {
    ...record,
    ranges: [
      ...record.ranges,
      { base: "c".repeat(40), candidate: "d".repeat(40) },
    ],
  };

  expect(await readListing(atItsPath(twoRanges))).toEqual({
    kind: "answered",
    answer: { revision, sessions: [] },
  });
});

test("answers with no sessions when the directory lists no files", async () => {
  expect(await readListing({})).toEqual({
    kind: "answered",
    answer: { revision, sessions: [] },
  });
});

test("propagates a directory listing refusal", async () => {
  const refusal = new Error(
    "The published sessions directory could not be read",
  );

  await expect(
    performPublishedSessionsRead(
      source,
      read,
      () => Promise.reject(refusal),
      () => Promise.reject(new Error("Unexpected blob read")),
    ),
  ).rejects.toBe(refusal);
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
      new URLSearchParams({ sessions: "published", revision }),
    ),
  ).toEqual(read);
});
