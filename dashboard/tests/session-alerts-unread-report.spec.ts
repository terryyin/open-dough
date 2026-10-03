// The dashboard server's macOS notification when a session's completion report
// arrives unread (../server/sessionAlerts.ts; ./session-alerts.spec.ts is the
// native reading's): one notification in the report's own words, “Unread
// report: <completion label>”, whatever the native reading, which goes on
// alerting as it would without a report; none for a session marked done.
// Real start, launch, installed reporting command and store; the synthetic
// `claude` (./fixtures/fake-claude) and `osascript`
// (./fixtures/fake-osascript) are all the server reaches. The server reads
// the sessions every 100 ms here; "nothing more" is asserted only after the
// fake `claude` has logged further listings, never after a sleep.

import { expect } from "@playwright/test";
import { markDone } from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { launchedStory } from "./support/reportedLaunch.ts";
import {
  afterFurtherListings,
  alertCheckMs,
  becomes,
  messages,
  notices,
  test,
} from "./support/sessionAlerts.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  queuedTitle,
  startOrigin,
} from "./support/startOrigin.ts";

test("a report arriving unread raises one notification in its own words, apart from the native reading, and none once marked done", async () => {
  test.setTimeout(120_000);
  const origin = await startOrigin();
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    alertCheckMs,
  });
  try {
    const reported = await launchedStory(
      server,
      origin,
      queuedIdentity,
      queuedTitle,
    );
    const markedDone = await launchedStory(
      server,
      origin,
      otherQueuedIdentity,
      "Marked done",
    );
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toEqual([]);

    await reported.report();
    await expect.poll(() => server.osascriptCalls().length).toBe(1);
    expect(notices(server)).toEqual([
      {
        message: "Unread report: Completed with attention",
        title: `Open Dough · ${queuedTitle}`,
        sound: "Glass",
      },
    ]);
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toHaveLength(1);

    server.claudeSessionBecomes(reported.sessionId, "blocked", "Which port?");
    await expect.poll(() => server.osascriptCalls().length).toBe(2);
    await afterFurtherListings(server);
    expect(messages(server)).toEqual([
      "Unread report: Completed with attention",
      "Needs input: Which port?",
    ]);

    expect(
      (
        await markDone(server, {
          source: "open-dough",
          session: markedDone.sessionId,
        })
      ).status,
    ).toBe(200);
    await afterFurtherListings(server);
    await markedDone.report();
    await becomes(server, markedDone.sessionId, "stopped");
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toHaveLength(2);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
