// The working-count rule of listed open sessions (../../src/sessionShown.ts
// `workingCount` / `workingWords`): native Working and Cursor's held
// "working" screen count; awaiting first instruction, held waiting, and a
// session marked done do not; an unread report on a working session still
// counts. A pure reading of records; the page journey is
// ../tests/sessions/sessions-sidebar.spec.ts.

import { expect, test } from "../tests/support/pageTest.ts";
import { completionReport } from "../tests/support/completionReport.ts";
import type { LaunchWithState } from "../src/agentLaunch.ts";
import { cursorHeldLabel } from "../src/cursorHeldLabel.ts";
import {
  attentionCount,
  workingCount,
  workingWords,
} from "../src/sessionShown.ts";

const available = (
  activity: "working" | "waiting" | "awaiting-instruction" | "review",
): Pick<LaunchWithState, "sessionState"> => ({
  sessionState: {
    kind: "available",
    availability: "loaded",
    activity,
  },
});

const held = (
  label: (typeof cursorHeldLabel)[keyof typeof cursorHeldLabel],
): Pick<LaunchWithState, "sessionState"> => ({
  sessionState: { kind: "unknown", label },
});

test("awaiting first instruction is excluded; only native Working counts among unsettled peers", () => {
  const sessions = [
    available("working"),
    available("working"),
    available("awaiting-instruction"),
  ];
  expect(workingCount(sessions)).toBe(2);
  expect(attentionCount(sessions)).toBe(0);
  expect(workingWords(2)).toBe("2 sessions working");
});

test("Cursor held working counts; held waiting does not; done while still working natively does not", () => {
  const sessions = [
    held(cursorHeldLabel.working),
    held(cursorHeldLabel.waiting),
    {
      ...available("working"),
      doneAt: "2026-10-01T11:00:00.000Z",
    },
  ];
  expect(workingCount(sessions)).toBe(1);
  expect(attentionCount(sessions)).toBe(0);
});

test("an unread report on a working session still counts, and one is singular", () => {
  const workingUnread = {
    ...available("working"),
    completion: completionReport({
      message: "Published. Reminder: check the migration.",
    }),
  };
  expect(workingCount([workingUnread])).toBe(1);
  expect(workingWords(1)).toBe("1 session working");
  expect(attentionCount([workingUnread])).toBe(0);
});
