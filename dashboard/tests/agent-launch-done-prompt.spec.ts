// Private Claude Done waits for its composer, never typing into the banner.
// Timeout or client exit retains the attachment cause and ends the private client.
// Server-close abandonment is in ./agent-launch-done-close.spec.ts.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { markDone, title } from "./agentLaunchBoundary.ts";
import { launched } from "./agentTerminalBoundary.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const launchName = `Open Dough · Execution · ${title}`;

test.describe("manual Done with a private Claude composer", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-done-prompt-"));
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

  test("waits for the private composer after its banner before typing the rename", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    const attachesBefore = server.claudeAttaches().length;
    server.claudeAttachPromptDelay(800);
    try {
      const response = await markSessionDone(session);
      expect(response.status).toBe(200);
      const result = JSON.parse(response.body) as { record: LaunchRecord };
      expect(result).not.toHaveProperty("record.doneProblem");
      expect(result.record.doneAt).toEqual(expect.any(String));
      expect(result.record.session.name).toBe(launchName);
      expect(
        server.claudeListing().find((each) => each["id"] === session.shortId),
      ).toMatchObject({ name: `done-${launchName}` });
      await expect
        .poll(() => server.claudeAttaches().slice(attachesBefore))
        .toEqual([
          {
            pid: expect.any(Number),
            id: session.shortId,
            lines: [`/rename done-${launchName}`],
            endedBy: "SIGHUP",
          },
        ]);
    } finally {
      server.claudeAttachPromptDelay(0);
    }
  });

  test("hangs up without typing when the private composer arrives after the rename wait", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    const attachesBefore = server.claudeAttaches().length;
    server.claudeAttachPromptDelay(10_000);
    try {
      const response = await markSessionDone(session);
      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        record: {
          doneAt: expect.any(String),
          doneProblem:
            "Local done mark retained. Claude Code rename failed: The terminal attachment could not be opened.",
        },
      });
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
      expect(
        server.claudeListing().find((each) => each["id"] === session.shortId),
      ).toMatchObject({ name: launchName, state: "stopped" });
    } finally {
      server.claudeAttachPromptDelay(0);
    }
  });

  test("does not type when the private client exits before its composer", async () => {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    const attachesBefore = server.claudeAttaches().length;
    server.claudeAttachPromptDelay(10_000);
    try {
      const marking = markSessionDone(session);
      await expect
        .poll(() => server.claudeAttaches().length)
        .toBe(attachesBefore + 1);
      const attached = server.claudeAttaches().at(-1);
      if (attached === undefined)
        throw new Error("The private attach was not recorded.");
      process.kill(attached.pid, "SIGTERM");
      const response = await marking;
      const result = JSON.parse(response.body) as { record: LaunchRecord };
      expect(result.record.doneProblem).toBe(
        "Local done mark retained. Claude Code rename failed: The terminal attachment could not be opened.",
      );
      expect(server.claudeAttaches().at(-1)).toMatchObject({
        lines: [],
        endedBy: "SIGTERM",
      });
    } finally {
      server.claudeAttachPromptDelay(0);
    }
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
