// The unread rule of a session's report (../src/sessionShown.ts): a report is
// unread while its session is not marked done and the record keeps no read
// mark for that report's receipt. A pure reading of one record; the page
// journey is ./session-unread-report.spec.ts.

import { expect, test } from "./support/pageTest.ts";
import { completionReport } from "./support/completionReport.ts";
import type { LaunchWithState } from "../src/agentLaunch.ts";
import {
  alertReading,
  attentionCount,
  sessionShown,
  unfinishedIntention,
  unreadReportSummary,
} from "../src/sessionShown.ts";

const report = () =>
  completionReport({ message: "Published. Reminder: check the migration." });

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

test("only explicitly completed refinements with missing preparation workspaces replace waiting", () => {
  const completion = report();
  const retired = {
    request: {
      source: "open-dough",
      identity: "SEED-901#retired-refinement",
      title: "Retired refinement",
      workflow: "refinement",
      host: "claude",
    },
    session: {
      host: "claude",
      sessionId: "refinement-session",
      shortId: "refineme",
      name: "refinement",
    },
    launchedAt: "2026-10-17T00:00:00Z",
    preparation: {
      identity: "SEED-901#retired-refinement",
      workspace: "/retired",
      branch: "claude/refine",
      remote: "origin",
      target: "main",
    },
    workspaceState: { kind: "missing" },
    completion,
    sessionState: {
      kind: "available",
      availability: "loaded",
      activity: "waiting",
    },
  } satisfies LaunchWithState;
  expect(sessionShown(retired)).toMatchObject({
    label: "Completed with attention",
    needsAttention: true,
    tone: "ready",
  });
  expect(alertReading(retired)).toBe("Completed with attention");
  expect(attentionCount([retired])).toBe(1);
  expect(unfinishedIntention(retired)).toBeUndefined();
  expect(
    sessionShown({ ...retired, reportRead: completion.receipt }),
  ).toMatchObject({ label: "Completed with attention", needsAttention: true });
  expect(
    sessionShown({ ...retired, completion: { ...completion, message: "" } }),
  ).toMatchObject({ label: "Completed", needsAttention: false });

  const ordinary: Parameters<typeof sessionShown>[0][] = [
    { ...retired, completion: undefined },
    { ...retired, completion: { ...completion, outcome: "unfinished" } },
    { ...retired, preparation: undefined },
    { ...retired, workspaceState: undefined },
    { ...retired, workspaceState: { kind: "available" } },
    { ...retired, workspaceState: { kind: "unknown" } },
    { ...retired, request: { ...retired.request, workflow: "execution" } },
  ];
  for (const session of ordinary) {
    expect(sessionShown(session).label).toBe("Needs input");
    expect(unfinishedIntention(session)).toBe(
      "This session is waiting for your input.",
    );
  }
  const active = { ...retired, ...working };
  expect(sessionShown(active).label).toBe("Working");
  expect(unfinishedIntention(active)).toBe(
    "This session is still working. Marking it done asks it to stop.",
  );
});
