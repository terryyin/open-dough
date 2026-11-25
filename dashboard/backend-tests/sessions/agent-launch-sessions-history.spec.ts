// The overview lists retained Done sessions compactly beside the attempts that
// still need attention; the history holds those sessions in full with the
// settled attempts under its own revision, which the overview names and which
// moves only when the history does (../../server/machineSessionsFragments.ts),
// read through the shared reader contract (../../src/machineSessionsRevision.ts).
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
import { SessionsAnswerFragments } from "../../server/machineSessionsFragments.ts";
import {
  type AnsweredEntry,
  withoutRetainedDetail,
} from "../../test-support/support/retainedDetail.ts";

const now = "2026-11-25T09:00:00.000Z";

const uuid = (n: number) => `00000000-0000-4000-8000-00000000000${String(n)}`;
const unknown = makeMe.aSessionState.unknown().please();
const working = makeMe.aSessionState.loaded("working").please();

function observed(sessionId: string, reference: string): LaunchWithState {
  const record = makeMe.aLaunchRecord
    .executing({ identity: `SEED-052#${sessionId}`, title: sessionId })
    .inClaudeSession({ sessionId })
    .reportingThrough({
      origin: "http://127.0.0.1:5173/",
      reference,
      command: "node report.mjs",
    })
    .launchedAt(now)
    .withFirstInput({ state: "confirmed", instruction: `Execute ${sessionId}` })
    .please();
  return makeMe.anObservedLaunch.of(record).withSessionState(unknown).please();
}

const open = observed("open", uuid(1));
const done: LaunchWithState = { ...observed("done", uuid(2)), doneAt: now };

const ids = { doneStart: uuid(3), openStart: uuid(4), unsettled: uuid(5) };
const attempt = (record: LaunchRecord, id: string) =>
  makeMe.anAcceptedAttempt.withId(id).requesting(record.request);
const started = (record: LaunchRecord, id: string) =>
  attempt(record, id)
    .launched({ host: "claude", sessionId: record.session.sessionId })
    .settledAt(now);
const asObserved = (kept: ReturnType<ReturnType<typeof attempt>["please"]>) =>
  makeMe.anAttemptObservation.of(kept).owned(false).running(false).please();
// The done session's start shares its story with a copy that never settled,
// so both still need attention; a page reconciled the open session's start.
const attempts: readonly AttemptObservation[] = [
  started(done, ids.doneStart).please(),
  started(open, ids.openStart).reconciledAt(now).please(),
  attempt(done, ids.unsettled).please(),
].map(asObserved);

function read(
  records: readonly LaunchWithState[],
  fragments = new SessionsAnswerFragments(),
) {
  const { records: observing, ...rest } = makeMe.aMachineAnswer
    .observing(...records)
    .answeringAttempts(...attempts)
    .please();
  const { overview, history } = fragments.answers(observing, rest);
  const overviewRead = machineSessionsReadSchema.parse(
    JSON.parse(overview.serialized()),
  );
  const historyRead = sessionsHistoryReadSchema.parse(
    JSON.parse(history.serialized()),
  );
  if ("unchanged" in overviewRead || "unchanged" in historyRead)
    throw new Error("Expected full answers");
  return { overview: overviewRead, history: historyRead };
}

const sessionIds = (records: readonly { session: { sessionId: string } }[]) =>
  records.map(({ session }) => session.sessionId);
const attemptIds = (answered: readonly AttemptObservation[]) =>
  answered.map(({ id }) => id).toSorted();

test("the overview lists the Done session compactly and the history holds it in full", () => {
  const { overview, history } = read([done, open]);
  expect(sessionIds(overview.records)).toEqual(["done", "open"]);
  expect(sessionIds(history.records)).toEqual(["done"]);
  expect(history.records[0]).toEqual(done);
  expect(overview.records[0]).toEqual(
    withoutRetainedDetail(structuredClone(done) as unknown as AnsweredEntry),
  );
  expect(overview.records[1]).toEqual(open);
});

test("the overview carries only attempts still needing attention and the history the settled ones", () => {
  const { overview, history } = read([done, open]);
  expect(attemptIds(overview.attempts)).toEqual(
    [ids.doneStart, ids.unsettled].toSorted(),
  );
  expect(attemptIds(history.attempts)).toEqual([ids.openStart]);
});

test("the overview names the history's own revision", () => {
  const { overview, history } = read([done, open]);
  expect(overview.historyRevision).toBe(history.revision);
  expect(history.revision).toMatch(/^[0-9a-f]{64}$/);
  expect(overview.revision).not.toBe(history.revision);
});

test("an open session's change moves the overview revision only", () => {
  const fragments = new SessionsAnswerFragments();
  const before = read([done, open], fragments);
  const after = read([done, { ...open, sessionState: working }], fragments);
  expect(after.overview.revision).not.toBe(before.overview.revision);
  expect(after.history.revision).toBe(before.history.revision);
});

test("a session marked Done moves the history revision the overview names", () => {
  const fragments = new SessionsAnswerFragments();
  const before = read([done, open], fragments);
  const after = read([done, { ...open, doneAt: now }], fragments);
  expect(after.history.revision).not.toBe(before.history.revision);
  expect(sessionIds(after.history.records)).toEqual(["done", "open"]);
  expect(after.overview.historyRevision).toBe(after.history.revision);
});
