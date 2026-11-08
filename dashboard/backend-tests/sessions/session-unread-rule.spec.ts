// The unread rule of a session's report (../../src/sessionShown.ts): a report is
// unread while its session is not marked done and the record keeps no read
// mark for that report's receipt. A pure reading of one record; the page
// journey is ../../tests/sessions/session-unread-report.spec.ts.

import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import {
  alertReading,
  attentionCount,
  sessionShown,
  unfinishedIntention,
  unreadReportSummary,
} from "../../src/sessionShown.ts";

const message = "Published. Reminder: check the migration.";
const report = () => makeMe.aCompletionReport.saying(message).please();

const working: Pick<LaunchWithState, "sessionState"> = {
  sessionState: makeMe.aSessionState.loaded("working").please(),
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
  const kept = makeMe.aLaunchRecord
    .executing({ identity: "SEED-902#reported-twice", title: "Reported twice" })
    .completedWith({
      message,
      receipt: "aaaaaaaa-0000-4000-8000-000000000001",
    })
    .withReportRead()
    .please();
  const newer = makeMe.aCompletionReport
    .saying(message)
    .withOutcome("unfinished")
    .withReceipt("aaaaaaaa-0000-4000-8000-000000000002")
    .please();
  const received = { ...kept, ...working, completion: newer };
  const shown = sessionShown(received);
  expect(shown.unreadReport).toBe("Unfinished work");
  expect(shown.label).toBe("Working");
  expect(unreadReportSummary([received])).toBe("1 unread report");
});

test("a reported session marked done has no unread report, whether or not it was read", () => {
  const reported = () =>
    makeMe.aLaunchRecord
      .executing({ identity: "SEED-903#reported-done", title: "Reported done" })
      .completedWith({ message })
      .markedDoneAt("2026-10-01T11:00:00.000Z");
  for (const kept of [
    reported().please(),
    reported().withReportRead().please(),
  ]) {
    const shown = sessionShown({ ...kept, ...working });
    expect(shown.unreadReport).toBeUndefined();
    expect(shown.label).toBe("Done");
  }
});

test("only explicitly completed refinements with missing preparation workspaces replace waiting", () => {
  const completion = report();
  const story = {
    identity: "SEED-901#retired-refinement",
    title: "Retired refinement",
  };
  const retired: LaunchWithState = {
    ...makeMe.anObservedLaunch
      .of(
        makeMe.aLaunchRecord
          .refining(story)
          .onStoryBranch({ workspace: "/retired", branch: "claude/refine" })
          .inClaudeSession({
            sessionId: "refinement-session",
            shortId: "refineme",
          })
          .launchedAt("2026-10-17T00:00:00Z")
          .please(),
      )
      .withWorkspace("missing")
      .withSessionState(makeMe.aSessionState.loaded("waiting").please())
      .please(),
    completion,
  };
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
    {
      ...retired,
      request: makeMe.aLaunchRecord.executing(story).please().request,
    },
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

test("a quiet completion retained for wrap-up has no unread message or alert", () => {
  const session = {
    ...working,
    completion: makeMe.aCompletionReport.saying("").please(),
  };
  expect(sessionShown(session).unreadReport).toBeUndefined();
  expect(unreadReportSummary([session])).toBeUndefined();
  expect(attentionCount([session])).toBe(0);
});
