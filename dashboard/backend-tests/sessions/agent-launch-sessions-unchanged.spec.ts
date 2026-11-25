// A viewer naming the revision of the sessions answer it holds is answered
// only that it is unchanged while that answer still stands, and in full
// otherwise (../../server/machineSessionObservation.ts), read through the
// shared reader contract (../../src/machineSessionsRevision.ts).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import {
  machineSessionsReadSchema,
  sessionsHistoryReadSchema,
} from "../../src/machineSessionsRevision.ts";
import {
  MachineSessionObservation,
  type SessionsAsk,
} from "../../server/machineSessionObservation.ts";

type SessionsAudience = SessionsAsk["audience"];

const now = "2026-11-25T09:00:00.000Z";
const staying = new AbortController().signal;

function observed(sessionId: string): LaunchWithState {
  const record = makeMe.aLaunchRecord
    .executing({ identity: `SEED-052#${sessionId}`, title: sessionId })
    .inClaudeSession({ sessionId })
    .launchedAt(now)
    .please();
  return makeMe.anObservedLaunch
    .of(record)
    .withSessionState(makeMe.aSessionState.unknown().please())
    .please();
}

// One server's shared observation of `records`, whose observed inputs move
// with each update, as a written machine document moves its revision.
function machine(...initial: LaunchWithState[]) {
  let records = initial;
  let inputs = 0;
  const observation = new MachineSessionObservation(
    () => Promise.resolve(makeMe.aMachineAnswer.observing(...records).please()),
    () => Promise.resolve([inputs]),
    { waitMs: 30_000, reuseMs: 1_000 },
  );
  const schemas = {
    overview: machineSessionsReadSchema,
    history: sessionsHistoryReadSchema,
  };
  return {
    update(...updated: LaunchWithState[]) {
      records = updated;
      inputs += 1;
    },
    async ask(audience: SessionsAudience, held?: string) {
      const { serialized } = await observation.answerFor(
        { audience, held, fresh: false },
        staying,
      );
      return schemas[audience].parse(JSON.parse(serialized));
    },
  };
}

const done: LaunchWithState = { ...observed("done"), doneAt: now };
const open = observed("open");
const audiences = ["overview", "history"] as const;

async function revisionOf(
  sessions: ReturnType<typeof machine>,
  audience: SessionsAudience,
) {
  const answer = await sessions.ask(audience);
  if ("unchanged" in answer) throw new Error("Expected a full answer");
  expect(answer.revision).toMatch(/^[0-9a-f]{64}$/);
  return answer.revision as string;
}

test.each(audiences)(
  "a viewer holding the current %s revision is answered unchanged",
  async (audience) => {
    const sessions = machine(done, open);
    const held = await revisionOf(sessions, audience);
    for (let ask = 0; ask < 2; ask += 1)
      expect(await sessions.ask(audience, held)).toEqual({
        revision: held,
        unchanged: true,
      });
  },
);

test.each(audiences)(
  "a viewer of the %s holding the other audience's revision or a stale one is answered in full",
  async (audience) => {
    const sessions = machine(done, open);
    const full = await sessions.ask(audience);
    const other = await revisionOf(
      sessions,
      audience === "history" ? "overview" : "history",
    );
    for (const held of [other, "an-older-revision"])
      expect(await sessions.ask(audience, held)).toEqual(full);
  },
);

test.each(audiences)(
  "once an observed record changes, the held %s revision is answered in full under a new revision",
  async (audience) => {
    const sessions = machine(done, open);
    const held = await revisionOf(sessions, audience);
    sessions.update(done, { ...open, doneAt: now });
    const changed = await sessions.ask(audience, held);
    if ("unchanged" in changed) throw new Error("Expected a full answer");
    expect(changed.revision).not.toBe(held);
    expect(changed.records.map(({ doneAt }) => doneAt)).toEqual([now, now]);
  },
);
