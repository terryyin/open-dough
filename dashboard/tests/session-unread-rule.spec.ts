// The unread rule of a session's report (../src/sessionShown.ts): a report is
// unread while its session is not marked done and the record keeps no read
// mark for that report's receipt. A pure reading of one record; the page
// journey is ./session-unread-report.spec.ts.

import { randomUUID } from "node:crypto";
import { expect, test } from "./support/pageTest.ts";
import type { LaunchWithState } from "../src/agentLaunch.ts";
import type { CompletionReport } from "../src/completionReport.ts";
import { sessionShown, unreadReportSummary } from "../src/sessionShown.ts";

const report = (): CompletionReport => ({
  receipt: randomUUID(),
  reference: randomUUID(),
  outcome: "completed",
  message: "Published. Reminder: check the migration.",
  receivedAt: "2026-10-01T10:00:00.000Z",
});

const working: Pick<LaunchWithState, "sessionState"> = {
  sessionState: {
    kind: "available",
    availability: "loaded",
    activity: "working",
  },
};

test("a report marked read is no longer unread, and the native reading stays", () => {
  const completion = report();
  const unread = sessionShown({ ...working, completion });
  expect(unread.unreadReport).toBe("Completed with attention");
  const read = sessionShown({
    ...working,
    completion,
    reportRead: completion.receipt,
  });
  expect(read).toEqual({
    label: "Working",
    needsAttention: false,
    tone: "working",
  });
  expect(
    unreadReportSummary([
      { ...working, completion, reportRead: completion.receipt },
    ]),
  ).toBeUndefined();
});

test("a newer report after a read one is unread again", () => {
  const first = report();
  const newer = { ...report(), outcome: "unfinished" as const };
  const shown = sessionShown({
    ...working,
    completion: newer,
    reportRead: first.receipt,
  });
  expect(shown.unreadReport).toBe("Unfinished work");
  expect(shown.label).toBe("Working");
  expect(
    unreadReportSummary([
      { ...working, completion: newer, reportRead: first.receipt },
    ]),
  ).toBe("1 unread report");
});

test("a reported session marked done has no unread report, whether or not it was read", () => {
  const completion = report();
  for (const reportRead of [undefined, completion.receipt]) {
    const shown = sessionShown({
      ...working,
      completion,
      doneAt: "2026-10-01T11:00:00.000Z",
      ...(reportRead === undefined ? {} : { reportRead }),
    });
    expect(shown.unreadReport).toBeUndefined();
    expect(shown.label).toBe("Done");
  }
});
