// The macOS notification for a session that starts needing the developer,
// raised by the dashboard server itself (../server/sessionAlerts.ts) with no
// page open: a session this dashboard recorded, not marked done, entering any
// reading other than Working raises one notification naming its project, its
// title, and what it waits for, with a sound. It does not repeat while the
// reading stays, after a page reload, or after a server restart that finds it
// there; working and then blocked again alerts again, a changed reason alone
// does not, and a session marked done never alerts. The text travels as
// `osascript` arguments, so quotes and backslashes arrive unchanged. Closing
// the server ends an `osascript` it started. The synthetic `claude`
// (./fixtures/fake-claude) and `osascript` (./fixtures/fake-osascript) are all
// the server reaches; a real notification is never raised. The server reads
// the sessions every 100 ms here; "nothing more" is asserted only after the
// fake `claude` has logged further listings, never after a sleep.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test as base } from "@playwright/test";
import {
  launch,
  launchRequest,
  machineFolder,
  markDone,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  waitUntil,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { ClaudeSessionChange } from "./support/fakeClaude.ts";
import { processRunning } from "./support/processGroup.ts";

const alertCheckMs = 100;

const test = base.extend<{ machine: string; server: DashboardServer }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-alerts-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  server: async ({ machine }, use) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
      alertCheckMs,
    });
    await use(server);
    await server.close();
  },
});

// What each notification said: its message, its title, and the sound its
// script names.
function notices(server: DashboardServer) {
  return server.osascriptCalls().map(({ argv }) => ({
    message: argv.at(-2),
    title: argv.at(-1),
    sound: /sound name "([^"]*)"/.exec(argv.join("\n"))?.[1],
  }));
}

function messages(server: DashboardServer): (string | undefined)[] {
  return notices(server).map((notice) => notice.message);
}

// How many of the server's own session listings the fake `claude` has logged.
function listings(server: DashboardServer): number {
  const machine = machineFolder(server);
  return server
    .claudeCalls()
    .filter((call) => call.argv[0] === "agents" && call.cwd === machine).length;
}

// Waits until the server has read the sessions twice more, so whatever the
// last change should raise has been raised.
async function afterFurtherListings(server: DashboardServer): Promise<void> {
  const before = listings(server);
  await expect.poll(() => listings(server)).toBeGreaterThanOrEqual(before + 2);
}

async function start(
  server: DashboardServer,
  request: object = launchRequest,
): Promise<string> {
  const response = await launch(server, request);
  return (
    JSON.parse(response.body) as { record: { session: { sessionId: string } } }
  ).record.session.sessionId;
}

async function becomes(
  server: DashboardServer,
  sessionId: string,
  change: ClaudeSessionChange,
  waitingFor?: string,
): Promise<void> {
  server.claudeSessionBecomes(sessionId, change, waitingFor);
  await afterFurtherListings(server);
}

test.describe("a session that starts needing the developer raises one macOS notification", () => {
  test("names the project, title, and what it waits for, with a sound, once while it stays, across a reload, and again after working", async ({
    server,
    page,
  }) => {
    const session = await start(server);
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toEqual([]);

    server.claudeSessionBecomes(session, "blocked", "Which database?");
    await expect.poll(() => server.osascriptCalls().length).toBe(1);
    expect(notices(server)).toEqual([
      {
        message: "Needs input: Which database?",
        title: `Open Dough · ${launchRequest.title}`,
        sound: "Glass",
      },
    ]);

    await afterFurtherListings(server);
    await page.goto(server.baseURL);
    await page.reload();
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toHaveLength(1);

    await becomes(server, session, "blocked", "Which schema?");
    expect(server.osascriptCalls()).toHaveLength(1);

    await becomes(server, session, "working");
    expect(server.osascriptCalls()).toHaveLength(1);
    server.claudeSessionBecomes(session, "blocked", "Which port?");
    await expect.poll(() => server.osascriptCalls().length).toBe(2);
    expect(messages(server)).toEqual([
      "Needs input: Which database?",
      "Needs input: Which port?",
    ]);
  });

  test("raises one for each other reading: ready for review, failed, stopped, unavailable, and not recognized", async ({
    server,
    machine,
  }) => {
    const changes = [
      "done-live",
      "failed",
      "stopped",
      "forgotten",
      "unrecognized",
    ] as const;
    const sessions: string[] = [];
    while (sessions.length < changes.length) sessions.push(await start(server));
    await afterFurtherListings(server);
    for (const [index, change] of changes.entries()) {
      const id = sessions[index] ?? "?";
      if (change === "unrecognized") {
        const file = path.join(machine, "claude-state", "agents.json");
        const listed = JSON.parse(readFileSync(file, "utf8")) as {
          sessionId: string;
          state: string;
        }[];
        writeFileSync(
          file,
          JSON.stringify(
            listed.map((each) =>
              each.sessionId === id ? { ...each, state: "napping" } : each,
            ),
          ),
        );
      } else {
        server.claudeSessionBecomes(id, change);
      }
    }
    await expect.poll(() => server.osascriptCalls().length).toBe(5);
    await afterFurtherListings(server);
    expect(messages(server).sort()).toEqual([
      "Ready for review",
      "Session failed",
      "Session stopped",
      "Session unavailable",
      "State not recognized",
    ]);
  });

  test("raises nothing when Claude Code's listing cannot be read", async ({
    server,
  }) => {
    await start(server);
    await afterFurtherListings(server);
    server.claudeListingFails(true);
    await afterFurtherListings(server);
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toEqual([]);
  });

  test("never raises one for a session marked done, even when it stops", async ({
    server,
  }) => {
    const session = await start(server);
    const response = await markDone(server, {
      source: "open-dough",
      session,
    });
    expect(response.status).toBe(200);
    await afterFurtherListings(server);
    await becomes(server, session, "stopped");
    expect(server.osascriptCalls()).toEqual([]);
  });

  test("stays quiet for a session a restarted server finds already needing the developer, and raises one when it leaves and re-enters", async ({
    machine,
  }) => {
    const first = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
    });
    let session: string;
    try {
      session = await start(first);
      first.claudeSessionBecomes(session, "blocked", "Which database?");
    } finally {
      await first.close();
    }
    const second = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
      alertCheckMs,
    });
    try {
      await afterFurtherListings(second);
      expect(second.osascriptCalls()).toEqual([]);
      await becomes(second, session, "working");
      second.claudeSessionBecomes(session, "blocked", "Which database?");
      await expect.poll(() => second.osascriptCalls().length).toBe(1);
    } finally {
      await second.close();
    }
  });

  test("raises one for a session launched after the server started only once it needs the developer", async ({
    server,
  }) => {
    const session = await start(server);
    await afterFurtherListings(server);
    expect(server.osascriptCalls()).toEqual([]);
    server.claudeSessionBecomes(session, "blocked");
    await expect.poll(() => server.osascriptCalls().length).toBe(1);
  });

  test("passes a title with quotes and a backslash unchanged", async ({
    server,
  }) => {
    const oddTitle = "Say \"hi\" to a \\ back\\slash and 'quotes'";
    const session = await start(server, { ...launchRequest, title: oddTitle });
    await afterFurtherListings(server);
    server.claudeSessionBecomes(session, "blocked", 'Use "this" \\ that?');
    await expect.poll(() => server.osascriptCalls().length).toBe(1);
    expect(notices(server)).toEqual([
      {
        message: 'Needs input: Use "this" \\ that?',
        title: `Open Dough · ${oddTitle}`,
        sound: "Glass",
      },
    ]);
  });

  test("closing the server ends an osascript it started and stops reading the sessions", async ({
    machine,
  }) => {
    const server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
      alertCheckMs,
      osascript: "hang",
    });
    let held: number | undefined;
    try {
      const session = await start(server);
      await afterFurtherListings(server);
      server.claudeSessionBecomes(session, "blocked");
      expect(
        await waitUntil(() => server.heldOsascriptPid() !== undefined, {
          timeoutMs: 10_000,
        }),
      ).toBe(true);
      held = server.heldOsascriptPid();
      expect(processRunning(held)).toBe(true);
    } finally {
      await server.close();
    }
    expect(processRunning(held)).toBe(false);
    expect(server.heldOsascriptEndedBy()).toBe("SIGTERM");
  });
});
