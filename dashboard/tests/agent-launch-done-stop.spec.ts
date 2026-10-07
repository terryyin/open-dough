// Mark as done when Claude Code's session listing decides the stop, at the
// local launch boundary (../server/agentLaunchPlugin.ts, ../server/doneMarks.ts),
// over raw HTTP and a raw terminal socket: a session Claude Code no longer
// lists is only marked, never stopped; one whose listing cannot be read is
// still stopped; and one that never lists the typed `/rename` is answered with
// only its own `done-` name and that cause once the rename wait ends, is still
// stopped, and is renamed by a later Mark as done. A session still running a
// turn is never attached to: once the wait ends it is still stopped, and a
// later Mark as done renames it once idle. One whose process has exited is
// not renamed, and an attachment that never opens is hung up once the wait
// ends. The
// whole-flow cases are ./agent-launch-done.spec.ts. The machine directory holds
// HOME and the synthetic `claude`'s (./fixtures/fake-claude) state; the real
// one is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { markDone, openDoughFolder, title } from "./agentLaunchBoundary.ts";
import { launched, openTerminal, shows } from "./agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const launchName = `Open Dough · Execution · ${title}`;

test.describe("marking a session done by what Claude Code lists", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-done-stop-"));
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
      doneRenameWaitMs: 2_000,
    });
  });

  test.afterAll(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test("marks a session Claude Code no longer lists without stopping it", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "forgotten");
    const attachesBefore = server.claudeAttaches().length;
    const stopsBefore = server.claudeStopCalls().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        doneProblem:
          "Local done mark retained. Claude Code rename failed: The session is no longer running, so it was not renamed.",
        session: { sessionId: session.sessionId, name: launchName },
        sessionState: { kind: "unavailable" },
      },
    });
    expect(server.claudeAttaches().slice(attachesBefore)).toEqual([]);
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([]);
  });

  test("still stops a session whose listing cannot be read", async () => {
    const session = await launched(server);
    const stopsBefore = server.claudeStopCalls().length;
    server.claudeListingFails(true);
    try {
      const response = await markDone(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        record: {
          doneAt: expect.any(String),
          session: { sessionId: session.sessionId, name: launchName },
          sessionState: { kind: "unknown" },
        },
      });
    } finally {
      server.claudeListingFails(false);
    }
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);
  });

  test("marks an idle session whose typed rename is never listed once the wait ends, keeping the done- name only in the record, and still stops it; a later Mark as done renames it", async () => {
    const session = await launched(server);
    const terminal = await openTerminal(server, session);
    expect(await shows(terminal, "attached")).toBe(true);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    server.claudeRenamesIgnored(true);
    const stopsBefore = server.claudeStopCalls().length;
    try {
      const response = await markDone(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        record: {
          doneAt: expect.any(String),
          doneProblem:
            "Local done mark retained. Claude Code rename failed: The native rename could not be confirmed.",
          session: { sessionId: session.sessionId, name: launchName },
          sessionState: {
            kind: "available",
            availability: "retained",
            activity: "interrupted",
          },
        },
      });
    } finally {
      server.claudeRenamesIgnored(false);
    }
    expect(server.claudeAttaches().at(-1)?.lines).toEqual([
      `/rename done-${launchName}`,
    ]);
    expect(
      server.claudeListing().find((each) => each["id"] === session.shortId),
    ).toMatchObject({ name: launchName, state: "stopped" });
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);

    // Running and idle again, the session is renamed by the retry.
    server.claudeSessionBecomes(session.sessionId, "done-live");
    const retried = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });
    expect(retried.status).toBe(200);
    expect(JSON.parse(retried.body)).not.toHaveProperty("record.doneProblem");
    expect(
      server.claudeListing().find((each) => each["id"] === session.shortId),
    ).toMatchObject({ name: `done-${launchName}` });
  });

  test("never attaches to a session still working, names that cause once the wait ends, and still stops it; a later Mark as done renames it once idle", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working");
    const attachesBefore = server.claudeAttaches().length;
    const stopsBefore = server.claudeStopCalls().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        doneProblem:
          "Local done mark retained. Claude Code rename failed: The session was still working when the wait ended.",
        session: { sessionId: session.sessionId, name: launchName },
      },
    });
    expect(server.claudeAttaches().slice(attachesBefore)).toEqual([]);
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);

    server.claudeSessionBecomes(session.sessionId, "done-live");
    const retried = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });
    expect(retried.status).toBe(200);
    expect(JSON.parse(retried.body)).not.toHaveProperty("record.doneProblem");
    expect(server.claudeAttaches().slice(attachesBefore)).toHaveLength(1);
    expect(
      server.claudeListing().find((each) => each["id"] === session.shortId),
    ).toMatchObject({ name: `done-${launchName}` });
  });

  test("does not rename a session whose process has exited, and attaches to none", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "done-exited");
    const attachesBefore = server.claudeAttaches().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        doneProblem:
          "Local done mark retained. Claude Code rename failed: The session is no longer running, so it was not renamed.",
        session: { sessionId: session.sessionId, name: launchName },
      },
    });
    expect(server.claudeAttaches().slice(attachesBefore)).toEqual([]);
  });

  test("hangs up a private attachment that never opens once the wait ends", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    const attachesBefore = server.claudeAttaches().length;
    server.claudeAttachesSilent(true);
    try {
      const response = await markDone(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        record: {
          doneAt: expect.any(String),
          doneProblem:
            "Local done mark retained. Claude Code rename failed: The terminal attachment could not be opened.",
        },
      });
    } finally {
      server.claudeAttachesSilent(false);
    }
    await expect
      .poll(() => server.claudeAttaches().slice(attachesBefore))
      .toEqual([
        {
          pid: expect.any(Number),
          id: session.shortId,
          lines: [],
          endedBy: "SIGHUP",
        },
      ]);
  });
});
