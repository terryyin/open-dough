// Recently done lists a published session record while no more than 30 days
// have passed since its close, and drops it after (`currentPublishedSessions`);
// a kept launch standing for an expired record keeps its own lifecycle
// (`newestFirst`).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import {
  currentPublishedSessions,
  newestFirst,
} from "../../src/recentlyDoneListing.ts";

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

const listedFrom = (
  doneSessions: readonly LaunchWithState[],
  keptLaunches: readonly LaunchWithState[],
) =>
  newestFirst(
    [],
    doneSessions,
    "open-dough",
    keptLaunches,
    currentPublishedSessions(
      { status: "listed", revision: "main", sessions: [expired, current] },
      now,
    ),
  );

test("only a record closed no more than 30 days ago is listed", () => {
  const published = listedFrom([], []).flatMap((each) =>
    "published" in each ? [each.published.sessionId] : [],
  );
  expect(published).toEqual([current.sessionId]);
});

test("a kept launch standing for an expired record keeps its own place", () => {
  const kept: LaunchWithState = makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .adHoc({ title: "Kept here" })
        .reportingThrough({
          origin: "https://dashboard.example",
          reference: expired.sessionId,
          command: "node report.mjs",
        })
        .markedDoneAt(now.toISOString())
        .please(),
    )
    .withSessionState(makeMe.aSessionState.retained("working").please())
    .please();
  const listed = listedFrom([kept], [kept]);
  expect(listed.filter((each) => "session" in each)).toEqual([
    { at: Date.parse(kept.launchedAt), session: kept },
  ]);
});
