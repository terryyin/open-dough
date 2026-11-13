// The macOS notification for a session that starts needing the developer
// names its project, its title, and what it waits for, with a sound, and
// opens that story; it does not repeat while the reading stays or after the
// page is opened and reloaded, and is raised again after working. The text
// travels as Open Dough notification sender arguments. The server's other
// alert rules: ../../backend-tests/sessions/session-alerts.spec.ts. The
// synthetic `claude` (./fixtures/fake-claude) and sender
// (./fixtures/fake-terminal-notifier) are all the server reaches; a real
// notification is never raised. "Nothing more" is asserted only after the
// fake `claude` has logged further listings, never after a sleep.

import { expect } from "@playwright/test";
import { launchRequest } from "../agentLaunchBoundary.ts";
import {
  afterFurtherListings,
  becomes,
  messages,
  notices,
  notificationUrls,
  start,
  test,
} from "../support/sessionAlerts.ts";

test.describe("a session that starts needing the developer raises one macOS notification", () => {
  test("names the project, title, and what it waits for, with a sound, once while it stays, across a reload, and again after working", async ({
    server,
    page,
  }) => {
    const session = await start(server);
    await afterFurtherListings(server);
    expect(server.notifierCalls()).toEqual([]);

    server.claudeSessionBecomes(session, "blocked", "Which database?");
    await expect.poll(() => server.notifierCalls().length).toBe(1);
    expect(notices(server)).toEqual([
      {
        message: "Needs input: Which database?",
        title: `Open Dough · ${launchRequest.title}`,
        sound: "Glass",
      },
    ]);
    expect(server.notifierCalls()[0]?.argv.slice(0, 7)).toEqual([
      "-title",
      `\\Open Dough · ${launchRequest.title}`,
      "-message",
      "\\Needs input: Which database?",
      "-sound",
      "Glass",
      "-execute",
    ]);
    expect(notificationUrls(server)).toEqual([
      `${server.origin}/?project=open-dough&story=SEED-052%23launch-claude-planned-execution`,
    ]);

    await afterFurtherListings(server);
    await page.goto(server.baseURL);
    await page.reload();
    await afterFurtherListings(server);
    expect(server.notifierCalls()).toHaveLength(1);

    await becomes(server, session, "blocked", "Which schema?");
    expect(server.notifierCalls()).toHaveLength(1);

    await becomes(server, session, "working");
    expect(server.notifierCalls()).toHaveLength(1);
    server.claudeSessionBecomes(session, "blocked", "Which port?");
    await expect.poll(() => server.notifierCalls().length).toBe(2);
    expect(messages(server)).toEqual([
      "Needs input: Which database?",
      "Needs input: Which port?",
    ]);
  });
});
