// Mark as done when Claude Code's session listing decides stop or removal, at the
// local launch boundary (../server/agentLaunchPlugin.ts, ../server/doneMarks.ts),
// over raw HTTP and a raw terminal socket: a session Claude Code no longer
// lists is only marked, never stopped; one whose listing cannot be read is
// still stopped; one listed as exited has its job removed with `claude rm`,
// neither renamed nor stopped; and one that never lists the typed `/rename` is
// answered with only its own `done-` name once the rename wait ends, and is
// still stopped. The whole-flow cases are ./agent-launch-done.spec.ts. The
// machine directory holds HOME and the synthetic `claude`'s
// (./fixtures/fake-claude) state; the real one is never reached.

import { existsSync, mkdtempSync, rmSync } from "node:fs";
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
      doneRenameWaitMs: 300,
    });
  });

  test.afterAll(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test("marks a session Claude Code no longer lists without stopping it", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "forgotten");
    const stopsBefore = server.claudeStopCalls().length;
    const removalsBefore = server.claudeRemovalCalls().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        session: { sessionId: session.sessionId, name: launchName },
        sessionState: { kind: "unavailable" },
      },
    });
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([]);
    expect(server.claudeRemovalCalls().slice(removalsBefore)).toEqual([]);
  });

  test("removes an exited session's job with claude rm, neither renaming nor stopping it", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "done-exited");
    const stopsBefore = server.claudeStopCalls().length;
    const removalsBefore = server.claudeRemovalCalls().length;
    const attachesBefore = server.claudeAttaches().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    const { record } = JSON.parse(response.body) as {
      record: Record<string, unknown>;
    };
    expect(record).toMatchObject({
      doneAt: expect.any(String),
      session: { sessionId: session.sessionId, name: launchName },
      sessionState: { kind: "unavailable" },
    });
    expect(record).not.toHaveProperty("doneProblem");
    expect(server.claudeRemovalCalls().slice(removalsBefore)).toEqual([
      { argv: ["rm", session.shortId], cwd: openDoughFolder(server) },
    ]);
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([]);
    expect(server.claudeAttaches().length).toBe(attachesBefore);
    expect(
      server.claudeListing().find((each) => each["id"] === session.shortId),
    ).toBeUndefined();
    expect(existsSync(path.join(server.home, "git", "open-dough"))).toBe(true);
  });

  test("still stops a session whose listing cannot be read", async () => {
    const session = await launched(server);
    const stopsBefore = server.claudeStopCalls().length;
    const removalsBefore = server.claudeRemovalCalls().length;
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
    expect(server.claudeRemovalCalls().slice(removalsBefore)).toEqual([]);
  });

  test("marks a busy session whose typed rename is never listed once the wait ends, keeping the done- name only in the record, and still stops it", async () => {
    const session = await launched(server);
    const terminal = await openTerminal(server, session);
    expect(await shows(terminal, "attached")).toBe(true);
    server.claudeRenamesIgnored(true);
    const stopsBefore = server.claudeStopCalls().length;
    const removalsBefore = server.claudeRemovalCalls().length;
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
    expect(server.claudeRemovalCalls().slice(removalsBefore)).toEqual([]);
  });
});
