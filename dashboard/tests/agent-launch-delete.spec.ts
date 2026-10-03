// Delete record at the local launch boundary (../server/agentLaunchPlugin.ts),
// over raw HTTP: a same-origin POST for a session this dashboard recorded
// removes only that session's record from this machine's launch records while
// Claude Code's listing still leaves its state unknown, or no longer lists it
// while it is not marked done. It runs no `claude
// stop`, renames nothing, and marks nothing done. A session whose state the
// boundary reads as known keeps its record and is answered with that state.
// Which requests are refused before `claude` runs, and a record file that
// cannot be written, are here too. The machine directory holds HOME and the
// synthetic `claude`'s (./fixtures/fake-claude) state; the real one is never
// reached.

import { chmodSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { deleteRecord, markDone, recordsOf } from "./agentLaunchBoundary.ts";
import { closeOpenSessions } from "./openStorySessionSetup.ts";
import { launched } from "./agentTerminalBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

test.describe("deleting a recorded session's record", () => {
  test.describe.configure({ mode: "serial" });
  let machine: string;
  let server: DashboardServer;

  const recordFile = () =>
    path.join(server.home, ".open-dough", "dashboard", "agent-launches.json");

  const stored = () =>
    (
      JSON.parse(readFileSync(recordFile(), "utf8")) as Record<
        string,
        { session: { sessionId: string } }[]
      >
    )["open-dough"] ?? [];

  const stopCalls = () =>
    server.claudeCalls().filter((call) => call.argv[0] === "stop");

  const sessionIds = async () =>
    (await recordsOf(server, "open-dough")).map(
      (each) => (each as { session: { sessionId: string } }).session.sessionId,
    );

  test.beforeAll(async () => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-delete-"));
    server = await startDashboardServer({
      mode: "preview",
      prebuilt: builtDashboardDir,
      machine,
      projectFolders: ["open-dough", "pygardon"],
    });
  });

  test.afterAll(async () => {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  });

  test.beforeEach(async () => {
    await closeOpenSessions(server);
  });

  test("deletes only the record of a session whose listing cannot be read, stopping and renaming nothing", async () => {
    const kept = await launched(server);
    const session = await launched(server, "open-dough", {
      identity: "SEED-other#delete-target",
      title: "Another story",
    });
    const before = stored();
    server.claudeListingFails(true);
    const callsBefore = server.claudeCalls().length;
    const stopsBefore = stopCalls().length;
    try {
      const response = await deleteRecord(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
      expect(await sessionIds()).toEqual([kept.sessionId]);
    } finally {
      server.claudeListingFails(false);
    }
    expect(stored()).toEqual(
      before.filter((each) => each.session.sessionId !== session.sessionId),
    );
    expect(stopCalls()).toHaveLength(stopsBefore);
    expect(
      server
        .claudeCalls()
        .slice(callsBefore)
        .map((call) => call.argv[0]),
    ).not.toContain("stop");
    expect(server.claudeAttaches()).toEqual([]);
    expect(
      server.claudeListing().find((each) => each["id"] === session.shortId),
    ).toBeDefined();
  });

  test("deletes only the record of a session Claude Code no longer lists and that is not marked done, stopping nothing", async () => {
    const kept = await launched(server);
    const session = await launched(server, "open-dough", {
      identity: "SEED-other#delete-forgotten",
      title: "Forgotten story",
    });
    server.claudeSessionBecomes(session.sessionId, "forgotten");
    const before = stored();
    const stopsBefore = stopCalls().length;

    const response = await deleteRecord(server, {
      source: "open-dough",
      session: session.sessionId,
    });

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
    expect(await sessionIds()).toContain(kept.sessionId);
    expect(await sessionIds()).not.toContain(session.sessionId);
    expect(stored()).toEqual(
      before.filter((each) => each.session.sessionId !== session.sessionId),
    );
    expect(stopCalls()).toHaveLength(stopsBefore);
  });

  for (const known of ["working", "unlisted and marked done"] as const) {
    test(`keeps the record of a session that is ${known} and answers its state`, async () => {
      const session = await launched(server);
      if (known === "working") {
        server.claudeSessionBecomes(session.sessionId, "working");
      } else {
        await markDone(server, {
          source: "open-dough",
          session: session.sessionId,
        });
        server.claudeSessionBecomes(session.sessionId, "forgotten");
      }
      const before = stored();
      const stopsBefore = stopCalls().length;

      const response = await deleteRecord(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        kind: "state-known",
        record: {
          session: { sessionId: session.sessionId },
          sessionState:
            known === "working"
              ? {
                  kind: "available",
                  availability: "loaded",
                  activity: "working",
                }
              : { kind: "unavailable" },
        },
      });
      expect(await sessionIds()).toContain(session.sessionId);
      expect(stored()).toEqual(before);
      expect(stopCalls()).toHaveLength(stopsBefore);
    });
  }

  test("refuses a session this dashboard did not record, or another project's, before running claude", async () => {
    const session = await launched(server);
    for (const body of [
      {
        source: "open-dough",
        session: "00000000-0000-4000-8000-000000000000",
      },
      { source: "pygardon", session: session.sessionId },
      { source: "not-a-real-project", session: session.sessionId },
    ]) {
      const callsBefore = server.claudeCalls().length;

      const response = await deleteRecord(server, body);

      expect(response.status).toBe(404);
      expect(server.claudeCalls()).toHaveLength(callsBefore);
    }
    expect(await sessionIds()).toContain(session.sessionId);
  });

  test("refuses a request from another site before running claude", async () => {
    const session = await launched(server);
    const callsBefore = server.claudeCalls().length;

    const response = await deleteRecord(
      server,
      { source: "open-dough", session: session.sessionId },
      { Origin: "http://evil.example" },
    );

    expect(response.status).toBe(403);
    expect(server.claudeCalls()).toHaveLength(callsBefore);
    expect(await sessionIds()).toContain(session.sessionId);
  });

  test("answers a record file that cannot be written with why, keeping the record", async () => {
    const session = await launched(server);
    const before = stored();
    const directory = path.dirname(recordFile());
    server.claudeListingFails(true);
    chmodSync(directory, 0o500);
    try {
      const response = await deleteRecord(server, {
        source: "open-dough",
        session: session.sessionId,
      });

      expect(response.status).toBe(500);
      expect(response.headers["content-type"]).toContain("application/json");
      expect(JSON.parse(response.body)).toEqual({
        error: expect.stringContaining(
          "The session record could not be deleted",
        ),
      });
    } finally {
      chmodSync(directory, 0o700);
      server.claudeListingFails(false);
    }
    expect(stored()).toEqual(before);
    expect(await sessionIds()).toContain(session.sessionId);
  });
});
