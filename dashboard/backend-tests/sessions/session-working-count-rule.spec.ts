// The working-count rule of listed open sessions (../../src/sessionShown.ts
// `workingCount` / `workingWords`): native Working and Cursor's held
// "working" screen count; awaiting first instruction, held waiting, and a
// session marked done do not; an unread report on a working session still
// counts. A pure reading of records; the page journey is
// ../../../e2e/sessions/sessions-sidebar.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { cursorHeldLabel } from "../../src/cursorHeldLabel.ts";
import {
  attentionCount,
  workingCount,
  workingWords,
} from "../../src/sessionShown.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";

test("awaiting first instruction is excluded; only native Working counts among unsettled peers", () => {
  const sessions = [
    { sessionState: makeMe.aSessionState.loaded("working").please() },
    { sessionState: makeMe.aSessionState.loaded("working").please() },
    {
      sessionState: makeMe.aSessionState
        .loaded("awaiting-instruction")
        .please(),
    },
  ];
  expect(workingCount(sessions)).toBe(2);
  expect(attentionCount(sessions)).toBe(0);
  expect(workingWords(2)).toBe("2 sessions working");
});

test("Cursor held working counts; held waiting does not; done while still working natively does not", () => {
  const sessions = [
    {
      sessionState: makeMe.aSessionState
        .unknown(cursorHeldLabel.working)
        .please(),
    },
    {
      sessionState: makeMe.aSessionState
        .unknown(cursorHeldLabel.waiting)
        .please(),
    },
    {
      sessionState: makeMe.aSessionState.loaded("working").please(),
      doneAt: "2026-10-01T11:00:00.000Z",
    },
  ];
  expect(workingCount(sessions)).toBe(1);
  expect(attentionCount(sessions)).toBe(0);
});

test("an unread report on a working session still counts, and one is singular", () => {
  const workingUnread = {
    sessionState: makeMe.aSessionState.loaded("working").please(),
    completion: makeMe.aCompletionReport
      .saying("Published. Reminder: check the migration.")
      .please(),
  };
  expect(workingCount([workingUnread])).toBe(1);
  expect(workingWords(1)).toBe("1 session working");
  expect(attentionCount([workingUnread])).toBe(0);
});
