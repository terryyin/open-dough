// Manual Done's bounded Claude Code rename failures retain their cause and
// still stop the session. External fake revival supplies a new running-session
// precondition, rather than proving the deferred retry of a stopped session.
// The local launch boundary runs against the synthetic Claude, never the real
// host. Native listing stop/removal cases are in ./agent-launch-done-stop.spec.ts;
// server-close abandonment is in ./agent-launch-done-close.spec.ts.
// Private composer readiness is in ./agent-launch-done-prompt.spec.ts.

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

test.describe("manual Done when Claude Code rename does not settle", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-done-rename-wait-"));
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

  const markSessionDone = (session: { readonly sessionId: string }) =>
    markDone(server, { source: "open-dough", session: session.sessionId });

  test("marks an idle session whose typed rename is never listed once the wait ends and still stops it; Mark as done renames it given a new running-session precondition", async () => {
    const session = await launched(server);
    const terminal = await openTerminal(server, session);
    expect(await shows(terminal, "attached")).toBe(true);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    server.claudeRenamesIgnored(true);
    const stopsBefore = server.claudeStopCalls().length;
    const removalsBefore = server.claudeRemovalCalls().length;
    try {
      const response = await markSessionDone(session);

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
    expect(server.claudeRemovalCalls().slice(removalsBefore)).toEqual([]);

    // The fake supplies a new running-session precondition. This does not
    // prove recovery of the session that manual Done stopped.
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

  test("never attaches to a session still working, names that cause once the wait ends, and still stops it; Mark as done renames it given a new running-session precondition", async () => {
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

    // The fake supplies running and idle, not a retry of a stopped session.
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
});
