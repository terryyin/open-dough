// Mark as done at the local launch boundary (../server/agentLaunchPlugin.ts,
// ../server/doneMarks.ts), over raw HTTP and a raw terminal socket: a
// same-origin POST for a session this dashboard recorded types Claude Code's
// own `/rename done-<name>` into its open terminal, ends that attachment,
// runs `claude stop <short id>`, and keeps the done mark on this machine
// across a restart. With no terminal open, the `done-` name is only the
// record's, and the session is still stopped. Any other request is refused
// before `claude` runs. The machine directory holds HOME and the synthetic
// `claude`'s (./fixtures/fake-claude) state; the real one is never reached.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
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
      projectFolders: ["open-dough", "pygardon"],
      doneRenameWaitMs: 3_000,
    });

  const listed = (session: LaunchedSession) =>
    server.claudeListing().find((each) => each["id"] === session.shortId);

  const stopCalls = () =>
    server.claudeCalls().filter((call) => call.argv[0] === "stop");

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
      sessionState: { kind: "listed", state: "stopped" },
    });
    expect(record).not.toHaveProperty("sessionState.status");
    // Ctrl+U cleared the draft, so the one line entered is the rename.
    expect(server.claudeAttaches().at(-1)?.lines).toEqual([
      `/rename ${doneName}`,
    ]);
    expect(await terminal.closed).toBe(4000);
    expect(await lastAttachEnded(server)).toBe("SIGHUP");
    expect(stopCalls()).toEqual([
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

  test("with no terminal open, keeps the done- name only in the record and still stops the session", async () => {
    const session = await launched(server);
    const attachesBefore = server.claudeAttaches().length;
    const stopsBefore = stopCalls().length;

    const response = await markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      record: {
        doneAt: expect.any(String),
        session: { name: launchName },
        sessionState: { kind: "listed", state: "stopped" },
      },
    });
    expect(server.claudeAttaches()).toHaveLength(attachesBefore);
    expect(stopCalls().slice(stopsBefore)).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);
    expect(listed(session)).toMatchObject({
      name: launchName,
      state: "stopped",
    });
  });

  test("refuses a request for a session this dashboard did not record, or another project's, before running claude", async () => {
    const session = await launched(server);
    for (const body of [
      {
        source: "open-dough",
        session: "00000000-0000-4000-8000-000000000000",
      },
      { source: "pygardon", session: session.sessionId },
    ]) {
      const callsBefore = server.claudeCalls().length;

      const response = await markDone(server, body);

      expect(response.status).toBe(404);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    }
    const [record] = (await recordsOf(server, "open-dough")).filter(
      (each) =>
        (each as { session: { sessionId: string } }).session.sessionId ===
        session.sessionId,
    );
    expect(record).not.toHaveProperty("doneAt");
    expect(listed(session)).toMatchObject({ status: "busy" });
  });

  for (const refused of [
    {
      request: "from another site",
      status: 403,
      headers: () => ({ Origin: "http://evil.example" }),
    },
    { request: "with no Origin", status: 403, headers: () => ({}) },
    {
      request: "for an unknown project",
      status: 404,
      source: "not-a-real-project",
    },
    {
      request: "that is malformed",
      status: 400,
      extra: { command: "ls" },
    },
  ]) {
    test(`refuses a done request ${refused.request} before running claude`, async () => {
      const session = await launched(server);
      const callsBefore = server.claudeCalls().length;

      const response = await markDone(
        server,
        {
          source: refused.source ?? "open-dough",
          session: session.sessionId,
          ...refused.extra,
        },
        refused.headers?.() ?? { Origin: server.origin },
      );

      expect(response.status).toBe(refused.status);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
      expect(listed(session)).toMatchObject({ status: "busy" });
    });
  }
});
