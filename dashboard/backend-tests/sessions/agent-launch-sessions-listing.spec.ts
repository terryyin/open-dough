// The story's example 5 at its scale: with 1,000 retained done sessions and
// five open ones, the overview holds the open sessions in full and each done
// session only as its listing facts -- the whole entry except the launch's
// reporting handoff past its reference, the first input's text, and the
// landing evidence -- while the history holds every done session in full
// (../../src/sessionListing.ts, ../../server/machineSessionsFragments.ts).
// The kept state is the Sessions replay's
// (../../test-support/support/sessionsReplayRecords.ts).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type {
  AttemptObservation,
  LaunchRecord,
  LaunchWithState,
} from "../../src/agentLaunch.ts";
import {
  machineSessionsReadSchema,
  sessionsHistoryReadSchema,
} from "../../src/machineSessionsRevision.ts";
import { withRetainedDetail } from "../../src/sessionListing.ts";
import { SessionsAnswerFragments } from "../../server/machineSessionsFragments.ts";
import {
  followUpContextOf,
  quietSession,
  quietTitle,
} from "../../test-support/support/followUpSources.ts";
import {
  type AnsweredEntry,
  withoutRetainedDetail,
} from "../../test-support/support/retainedDetail.ts";
import { replayRecords } from "../../test-support/support/sessionsReplayRecords.ts";

// A kept record as the machine observed it, its host state unconfirmed.
const observed = (record: LaunchRecord): LaunchWithState =>
  makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();

function read(
  records: readonly LaunchWithState[],
  attempts: readonly AttemptObservation[] = [],
) {
  const { records: observing, ...rest } = makeMe.aMachineAnswer
    .observing(...records)
    .answeringAttempts(...attempts)
    .please();
  const { overview, history } = new SessionsAnswerFragments().answers(
    observing,
    rest,
  );
  const overviewRead = machineSessionsReadSchema.parse(
    JSON.parse(overview.serialized()),
  );
  const historyRead = sessionsHistoryReadSchema.parse(
    JSON.parse(history.serialized()),
  );
  if ("unchanged" in overviewRead || "unchanged" in historyRead)
    throw new Error("Expected full answers");
  return { overview: overviewRead.records, history: historyRead.records };
}

// The detail a kept record holds, as the four parts the overview leaves out.
const detailOf = (record: LaunchWithState) => ({
  reporting: record.request.reporting,
  instruction: record.firstInput?.instruction,
  landing: record.landing,
  landingReporting: record.landingReporting,
});

const asAnswered = (record: LaunchWithState) =>
  structuredClone(record) as unknown as AnsweredEntry;

test("the overview lists 1,000 done sessions by their listing facts beside five open ones in full; the history holds them in full", () => {
  const replay = replayRecords(
    "/home",
    "unix://unused",
    Date.parse("2026-11-25T09:00:00Z"),
  );
  const records = replay.records.map(observed);
  const attempts = replay.attempts.map((attempt) =>
    makeMe.anAttemptObservation
      .of(attempt)
      .owned(false)
      .running(false)
      .please(),
  );
  const { overview, history } = read(records, attempts);
  const open = records.filter(({ doneAt }) => doneAt === undefined);
  const done = records.filter(({ doneAt }) => doneAt !== undefined);
  expect(open).toHaveLength(5);
  expect(done).toHaveLength(1_000);
  for (const record of done)
    expect(Object.values(detailOf(record))).not.toContain(undefined);

  expect(history).toEqual(done);
  expect(overview).toEqual(
    records.map((record) =>
      record.doneAt === undefined
        ? record
        : withoutRetainedDetail(asAnswered(record)),
    ),
  );
});

test("the overview lists open and Done follow-ups by source and the history restores the Done context", () => {
  const now = new Date("2026-11-25T09:00:00Z");
  const source = quietSession("follow-up-source", now);
  const context = followUpContextOf(quietTitle, [
    `- Original request: ${quietTitle}`,
    "- Final report: No final report was submitted.",
  ]);
  const recorded = makeMe.aFollowUp
    .ofSession(source)
    .withContext(context)
    .please();
  const instruction = "Check the changelog again";
  const firstInput = `${context}\n\n${instruction}`;
  const followUp = (sessionId: string) =>
    makeMe.aLaunchRecord
      .adHoc({
        instruction,
        title: "Follow up on the changelog",
        followUp: recorded,
      })
      .inCodexSession({
        sessionId,
        continuation: { workspace: "/home", endpoint: "unix://unused" },
      })
      .launchedAt(now.toISOString())
      .withFirstInput({ state: "confirmed", instruction: firstInput });
  const open = observed(followUp("open-follow-up").please());
  const done = observed(
    followUp("done-follow-up").markedDoneAt(now.toISOString()).please(),
  );

  const { overview, history } = read([observed(source), open, done]);
  const bySource = makeMe.aFollowUp.ofSession(source).please();
  const [, openListing, doneListing] = overview;
  for (const [listing, record] of [
    [openListing, open],
    [doneListing, done],
  ] as const)
    expect(listing).toMatchObject({
      session: record.session,
      request: { followUp: bySource },
      firstInput: { state: "confirmed" },
    });
  expect(JSON.stringify(overview)).not.toContain("Follow-up context:");

  const full = history.find(
    ({ session }) => session.sessionId === done.session.sessionId,
  );
  expect(full).toEqual(done);
  if (doneListing === undefined) throw new Error("Missing Done listing");
  const title = "Current listing title";
  expect(
    withRetainedDetail(
      { ...doneListing, request: { ...doneListing.request, title } },
      full,
    ),
  ).toMatchObject({
    request: { title, followUp: recorded },
    firstInput: { instruction: firstInput },
  });
});
