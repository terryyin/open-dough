// The published-session listing read (../../server/publishedSessionsRead.ts)
// lists the session close records a project published beside its backlog at a
// pinned revision through the same pinned GitHub path as listed records and
// the done catalog; the read boundary's request parsing admits it only at a
// pinned revision. Tested against real HTTP and a synthetic `gh` answering
// from the fake GitHub.

import { randomUUID } from "node:crypto";
import {
  sessionRecordDirectory,
  sessionRecordFileName,
  sessionRecordRelativePath,
} from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { parseRequestedRead } from "../../server/requestedRead.ts";
import { describedFiles } from "../../test-support/describedRevisions.ts";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  everyRepository,
  publishes,
} from "../../test-support/support/fakeGitHub.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";

test.describe.configure({ mode: "serial" });

const knownSourceId = "open-dough";
const revisionOf = (pair: string) => pair.repeat(20);
const sessionsDirectory = `.planning/${sessionRecordDirectory}`;
const commit = (digit: string) => digit.repeat(40);

const recordPath = (sessionId: string) =>
  `.planning/${sessionRecordRelativePath(sessionId)}`;

const atItsPath = (record: { sessionId: string }) => ({
  [recordPath(record.sessionId)]: JSON.stringify(record),
});

const answerOf = (response: { body: string }) =>
  JSON.parse(response.body) as {
    revision?: string;
    sessions?: { sessionId: string }[];
    error?: string;
  };

test.describe("authenticated published-session listing (development environment)", () => {
  let server: DashboardServer;

  test.beforeAll(async () => {
    server = await startDashboardServer(developmentBoundary);
  });

  test.afterAll(async () => {
    await server.close();
  });

  const listedAt = async (revision: string) =>
    rawRequest({
      url: `${server.baseURL}/__authenticated-read?source=${knownSourceId}&revision=${revision}&sessions=published`,
      headers: { Origin: server.origin },
    });

  const publishAt = (
    revision: string,
    files: Readonly<Record<string, string>>,
  ) => {
    server.github.serve(
      everyRepository,
      publishes({
        revision,
        files: describedFiles({ backlog: null, files }),
      }),
    );
  };

  test("Given published session records at a revision, when the listing is read there, then each record is listed", async () => {
    const revision = revisionOf("a1");
    const [one, other] = [
      makeMe.aSessionRecord.please(),
      makeMe.aSessionRecord.please(),
    ];
    publishAt(revision, { ...atItsPath(one), ...atItsPath(other) });

    const response = await listedAt(revision);
    expect(response.status).toBe(200);
    const answered = answerOf(response);
    expect(answered.revision).toBe(revision);
    expect(
      (answered.sessions ?? []).map(({ sessionId }) => sessionId).sort(),
    ).toEqual([one.sessionId, other.sessionId].sort());
  });

  test("Given malformed files beside a valid record, when the listing is read, then only the valid record is listed", async () => {
    const revision = revisionOf("b2");
    const valid = makeMe.aSessionRecord.please();
    publishAt(revision, {
      ...atItsPath(valid),
      [`${sessionsDirectory}/${sessionRecordFileName(randomUUID())}`]:
        "not json",
      [`${sessionsDirectory}/${sessionRecordFileName(randomUUID())}`]:
        JSON.stringify({ version: 2 }),
      [`${sessionsDirectory}/${sessionRecordFileName(randomUUID())}`]:
        JSON.stringify(makeMe.aSessionRecord.please()),
    });

    const response = await listedAt(revision);
    expect(response.status).toBe(200);
    expect(answerOf(response)).toEqual({
      revision,
      sessions: [valid],
    });
  });

  test("Given a two-range record, when the listing is read, then it is skipped as malformed", async () => {
    const revision = revisionOf("c3");
    const one = makeMe.aSessionRecord.please();
    const twoRanges = {
      ...one,
      ranges: [
        one.ranges[0],
        { base: "c".repeat(40), candidate: "d".repeat(40) },
      ],
    };
    publishAt(revision, atItsPath(twoRanges));

    const response = await listedAt(revision);
    expect(response.status).toBe(200);
    expect(answerOf(response)).toEqual({
      revision,
      sessions: [],
    });
  });

  test("Given a revision with no session directory, when the listing is read, then it answers an empty listing", async () => {
    const revision = revisionOf("d0");
    publishAt(revision, {});

    const response = await listedAt(revision);
    expect(response.status).toBe(200);
    expect(answerOf(response)).toEqual({
      revision,
      sessions: [],
    });
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
