// How each native session state reads on its entry (../../src/sessionShown.ts)
// and whether it offers Open terminal (../../src/launchRecord.ts). The page
// journeys keep one change each: ../../tests/sessions/agent-launch-session-state-pace.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { attachOpens } from "../../src/launchRecord.ts";
import { attentionSummary, sessionShown } from "../../src/sessionShown.ts";

const loaded = (activity: Parameters<typeof makeMe.aSessionState.loaded>[0]) =>
  makeMe.aSessionState.loaded(activity).please();
const claude = makeMe.aHostSession.claude({ sessionId: "claude-1" }).please();
const doneAt = "2026-10-01T11:00:00.000Z";

test("working and awaiting a first instruction need no attention", () => {
  expect(sessionShown({ sessionState: loaded("working") })).toEqual({
    label: "Working",
    needsAttention: false,
    tone: "working",
  });
  expect(
    sessionShown({ sessionState: loaded("awaiting-instruction") }),
  ).toEqual({
    label: "Awaiting first instruction",
    needsAttention: false,
    tone: "unsettled",
  });
});

test("waiting, review, failure and interruption need attention", () => {
  const waiting = makeMe.aSessionState
    .loaded("waiting")
    .waitingFor("permission to run npm test")
    .please();
  expect(sessionShown({ sessionState: waiting })).toEqual({
    label: "Needs input",
    note: "permission to run npm test",
    needsAttention: true,
    tone: "needs-input",
  });
  expect(sessionShown({ sessionState: loaded("waiting") })).not.toHaveProperty(
    "note",
  );
  expect(sessionShown({ sessionState: loaded("review") })).toEqual({
    label: "Ready for review",
    needsAttention: true,
    tone: "ready",
  });
  expect(sessionShown({ sessionState: loaded("failed") })).toEqual({
    label: "Session failed",
    needsAttention: true,
    tone: "halted",
  });
  expect(sessionShown({ sessionState: loaded("interrupted") })).toEqual({
    label: "Session stopped",
    needsAttention: true,
    tone: "halted",
  });
});

test("an unavailable session reads unavailable, or Done once marked done, and offers no terminal", () => {
  const sessionState = makeMe.aSessionState.unavailable().please();
  expect(sessionShown({ sessionState })).toEqual({
    label: "Session unavailable",
    needsAttention: false,
    tone: "unsettled",
  });
  expect(sessionShown({ sessionState, doneAt })).toEqual({
    label: "Done",
    needsAttention: false,
    tone: "done",
  });
  expect(attachOpens(sessionState)).toBe(false);
  expect(attachOpens(loaded("review"))).toBe(true);
});

test("an unreadable listing reads in the host's words, without attention, still offering the terminal", () => {
  const sessionState = makeMe.aSessionState.unknown().please();
  const shown = {
    label: "State unknown",
    note: "Claude Code's session list could not be read",
    needsAttention: false,
    tone: "unsettled",
  };
  expect(sessionShown({ sessionState, session: claude })).toEqual(shown);
  expect(sessionShown({ sessionState, session: claude, doneAt })).toEqual(
    shown,
  );
  expect(attachOpens(sessionState)).toBe(true);
});

test("an activity the host words but the dashboard does not know reads not recognized, with the host's words", () => {
  const sessionState = makeMe.aSessionState
    .loaded("unknown")
    .describedAs("compacting")
    .please();
  expect(sessionShown({ sessionState })).toEqual({
    label: "State not recognized",
    note: "compacting",
    needsAttention: false,
    tone: "unsettled",
  });
});

test("marked done reads Done whatever the host later lists, except while it works again", () => {
  expect(sessionShown({ sessionState: loaded("review"), doneAt })).toEqual({
    label: "Done",
    needsAttention: false,
    tone: "done",
  });
  expect(sessionShown({ sessionState: loaded("failed"), doneAt }).label).toBe(
    "Done",
  );
  expect(sessionShown({ sessionState: loaded("working"), doneAt }).label).toBe(
    "Working",
  );
});

test("a card counts the sessions that need attention, never an unavailable or unknown one", () => {
  const sessions = [
    { sessionState: loaded("waiting") },
    { sessionState: loaded("review") },
    { sessionState: loaded("working") },
    { sessionState: makeMe.aSessionState.unavailable().please() },
    { sessionState: makeMe.aSessionState.unknown().please() },
  ];
  expect(attentionSummary(sessions)).toBe("2 sessions need attention");
  expect(attentionSummary(sessions.slice(1))).toBe("1 session needs attention");
  expect(attentionSummary(sessions.slice(2))).toBeUndefined();
});
