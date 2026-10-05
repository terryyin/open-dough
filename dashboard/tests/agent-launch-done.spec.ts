// Mark as done at the local launch boundary (../server/agentLaunchPlugin.ts,
// ../server/doneMarks.ts), over raw HTTP and a raw terminal socket: a
// same-origin POST for a session this dashboard recorded types Claude Code's
// own `/rename done-<name>` into its open terminal, ends that attachment,
// runs `claude stop <short id>`, and keeps the done mark on this machine
// across a restart. With no terminal open, or a launch name holding a
// control character, the `done-` name is only the record's, and the session
// is still stopped. What the listing changes about a stop is
// ./agent-launch-done-stop.spec.ts. Which requests are refused before
// `claude` runs is ./agent-launch-done-refusal.spec.ts. The machine
// directory holds HOME and the synthetic `claude`'s (./fixtures/fake-claude)
// state; the real one is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import {
  launch,
  launchRequest,
  markDone,
  openDoughFolder,
  recordsOf,
  title,
} from "./agentLaunchBoundary.ts";
import {
  lastAttachEnded,
  launched,
  openTerminal,
  shows,
  type LaunchedSession,
} from "./agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const launchName = `Open Dough · Execution · ${title}`;
const doneName = `done-${launchName}`;

test.describe("marking a recorded session done", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  const startServer = () =>
    startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough"],
      doneRenameWaitMs: 3_000,
    });

  const listed = (session: LaunchedSession) =>
    server.claudeListing().find((each) => each["id"] === session.shortId);

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-done-"));
    server = await startServer();
  });

  test.afterAll(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test("renames the session through its open terminal, ends the attachment, stops the session, and keeps the mark across a restart", async () => {
    const session = await launched(server);
    const terminal = await openTerminal(server, session);
    expect(await shows(terminal, "attached")).toBe(true);
    terminal.send({ input: "a leftover draft" });

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    const { record } = JSON.parse(response.body) as {
      record: { doneAt: string; session: { name: string } };
    };
    expect(Date.parse(record.doneAt)).not.toBeNaN();
    expect(record).toMatchObject({
      session: { sessionId: session.sessionId, name: launchName },
      sessionState: {
        kind: "available",
        availability: "retained",
        activity: "interrupted",
      },
    });
    expect(record).not.toHaveProperty("sessionState.status");
    // Ctrl+U cleared the draft, so the one line entered is the rename.
    expect(server.claudeAttaches().at(-1)?.lines).toEqual([
      `/rename ${doneName}`,
    ]);
    expect(await terminal.closed).toBe(4000);
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
    expect(server.claudeStopCalls()).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);
    expect(listed(session)).toMatchObject({
      name: doneName,
      state: "stopped",
    });
    expect(listed(session)).not.toHaveProperty("status");

    await server.close();
    server = await startServer();
    expect(await recordsOf(server, "open-dough")).toContainEqual(
      expect.objectContaining({
        session: expect.objectContaining({ sessionId: session.sessionId }),
        doneAt: record.doneAt,
      }),
    );
  });

  test("types nothing into the open terminal of a session whose title holds a control character, keeping the done- name only in the record", async () => {
    server.claudeScenario("launched");
    const escTitle = `${title} \u001b[2J`;
    const escName = `Open Dough · Execution · ${escTitle}`;
    const launchedAnswer = await launch(server, {
      ...launchRequest,
      title: escTitle,
    });
    expect(launchedAnswer.status).toBe(200);
    const { session } = (
      JSON.parse(launchedAnswer.body) as {
        record: { session: LaunchedSession };
      }
    ).record;
    const terminal = await openTerminal(server, session);
    expect(await shows(terminal, "attached")).toBe(true);
    const stopsBefore = server.claudeStopCalls().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        session: { name: escName },
        sessionState: {
          kind: "available",
          availability: "retained",
          activity: "interrupted",
        },
      },
    });
    expect(await terminal.closed).toBe(4000);
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
    // No line, and so no rename, reached the attached session.
    expect(server.claudeAttaches().at(-1)?.lines).toEqual([]);
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);
    expect(listed(session)).toMatchObject({ name: escName, state: "stopped" });
  });

  test("with no terminal open, keeps the done- name only in the record and still stops the session", async () => {
    const session = await launched(server);
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
        session: { name: launchName },
        sessionState: {
          kind: "available",
          availability: "retained",
          activity: "interrupted",
        },
      },
    });
    expect(server.claudeAttaches()).toHaveLength(attachesBefore);
    expect(server.claudeStopCalls().slice(stopsBefore)).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);
    expect(listed(session)).toMatchObject({
      name: launchName,
      state: "stopped",
    });
  });
});
