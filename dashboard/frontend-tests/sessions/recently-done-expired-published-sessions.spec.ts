// Published session choices retain the existing close-record window.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { currentPublishedSessions } from "../../src/publishedSessions.ts";

const now = new Date("2026-06-01T00:00:00.000Z");
const before = (milliseconds: number) =>
  new Date(now.getTime() - milliseconds).toISOString();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

const recordClosedAt = (closedAt: string) =>
  publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord.closedAt(closedAt).please(),
  );

const current = recordClosedAt(before(29 * day + 23 * hour));
const expired = recordClosedAt(before(30 * day + 60 * 1000));

test("only a record closed no more than 30 days ago is listed", () => {
  const published = currentPublishedSessions(
    { status: "listed", revision: "main", sessions: [expired, current] },
    now,
  );
  expect(published.map(({ sessionId }) => sessionId)).toEqual([
    current.sessionId,
  ]);
});
