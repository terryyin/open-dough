// Closing the local launch boundary abandons a manual Claude Code rename wait,
// waits for its retained failure, and still stops the fake session. The machine
// directory survives shutdown so assertions read the resulting durable record.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { markDone, openDoughFolder, title } from "./agentLaunchBoundary.ts";
import { launched } from "./agentTerminalBoundary.ts";
import { storedRecords } from "./machineLaunchRecords.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";

const launchName = `Open Dough · Execution · ${title}`;

test("a server closed while manual Done waits for a working session retains the rename cause and still stops it", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-done-close-"));
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine,
    projectFolders: ["open-dough"],
    doneRenameWaitMs: 30_000,
  });
  let closed = false;
  try {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working");
    const listingsBefore = server
      .claudeCalls()
      .filter((call) => call.argv[0] === "agents").length;
    const marking = markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    });
    // Own the HTTP result even if shutdown ends the connection first.
    const marked = marking.catch(() => undefined);
    await expect
      .poll(() => (storedRecords(machine) as LaunchRecord[])[0]?.doneAt)
      .toEqual(expect.any(String));
    // Two rename listing reads, after the state read, establish that the
    // wait has observed working and is polling rather than still starting.
    await expect
      .poll(
        () =>
          server.claudeCalls().filter((call) => call.argv[0] === "agents")
            .length,
      )
      .toBeGreaterThanOrEqual(listingsBefore + 3);

    await server.close();
    closed = true;
    await marked;
    const [record] = storedRecords(machine) as LaunchRecord[];
    expect(record).toMatchObject({
      doneAt: expect.any(String),
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The session was still working when the wait ended.",
      session: { sessionId: session.sessionId, name: launchName },
    });
    expect(server.claudeAttaches()).toEqual([]);
    expect(server.claudeStopCalls()).toEqual([
      { argv: ["stop", session.shortId], cwd: openDoughFolder(server) },
    ]);
    expect(
      server.claudeListing().find((each) => each["id"] === session.shortId),
    ).toMatchObject({ name: launchName, state: "stopped" });
  } finally {
    if (!closed) await server.close();
    rmSync(machine, { recursive: true, force: true });
  }
});

test("a server closed before the private composer abandons manual rename without typing", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-done-prompt-close-"));
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine,
    projectFolders: ["open-dough"],
    doneRenameWaitMs: 30_000,
  });
  let closed = false;
  try {
    const session = await launched(server);
    server.claudeSessionBecomes(session.sessionId, "working-idle");
    server.claudeAttachPromptDelay(60_000);
    const marked = markDone(server, {
      source: "open-dough",
      session: session.sessionId,
    }).catch(() => undefined);
    await expect.poll(() => server.claudeAttaches().length).toBe(1);
    await server.close();
    closed = true;
    await marked;
    expect((storedRecords(machine) as LaunchRecord[])[0]).toMatchObject({
      doneAt: expect.any(String),
      doneProblem:
        "Local done mark retained. Claude Code rename failed: The terminal attachment could not be opened.",
      session: { name: launchName },
    });
    await expect
      .poll(() => server.claudeAttaches())
      .toEqual([
        {
          pid: expect.any(Number),
          id: session.shortId,
          lines: [],
          endedBy: "SIGHUP",
        },
      ]);
  } finally {
    if (!closed) await server.close();
    rmSync(machine, { recursive: true, force: true });
  }
});
