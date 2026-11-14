// How long and where the local launch boundary (../../server/launchBoundary.ts)
// keeps a project's launch records, over raw HTTP: this machine keeps them
// outside every repository until 30 days after its session is marked done,
// however old an unclosed one is, across server restarts and shared
// between servers of either project environment, and an unreadable store answers none
// and is moved aside by the next launch rather than lost, even when an earlier
// unreadable copy is already beside it. Each test owns a fresh machine
// directory holding HOME and the synthetic `claude`'s (../../tests/fixtures/fake-claude)
// state; the real one is never reached. What one launch answers and keeps is
// ./agent-launch-boundary.spec.ts; what a server answers after the store it
// already read is replaced is ./agent-launch-records-replaced.spec.ts.

import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  identity,
  launch,
  launchRequest,
  markDone,
  recordsOf,
  title,
} from "../../tests/agentLaunchBoundary.ts";
import { distinctStoryRequest } from "../../tests/openStorySessionSetup.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../tests/support/dashboardServer.ts";
import { daysAgo, machineHome } from "../../tests/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  keepLaunchStoreText,
  keptLaunchRecords,
  launchStoreFile,
} from "../../tests/support/launchStore.ts";
import { launchWithStateSchema } from "../../src/agentLaunch.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { alertReading } from "../../src/sessionShown.ts";
import { attentionCount } from "../../src/sessionCounts.ts";

const launchWaitMs = 4_000;
// The story's execution, kept for the `claude` session `sessionId`.
const execution = (sessionId: string) =>
  makeMe.aLaunchRecord
    .executing({ identity, title })
    .inClaudeSession({ sessionId });
// A done, exited Claude listing row for that session in `cwd`.
const doneExitedListing = (sessionId: string, cwd: string) =>
  makeMe.aClaudeListingRow
    .background({ sessionId, name: title, cwd, startedAt: Date.now() })
    .as("done-exited")
    .please();

test.describe("launch records kept on this machine", () => {
  let machine: string;
  const servers: DashboardServer[] = [];

  async function serverOn(
    environment: ProjectEnvironment,
  ): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode: "boundary",
      environment,
      machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: launchWaitMs,
    });
    servers.push(server);
    return server;
  }

  // A machine directory each test owns, holding HOME and the fake `claude`'s
  // state across the servers it starts.
  test.beforeEach(() => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-machine-"));
  });

  test.afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    rmSync(machine, { recursive: true, force: true });
  });

  test("answers a launch from another server on this machine, and again after both restart", async () => {
    const development = await serverOn("development");
    development.claudeScenario("launched");
    const { record } = JSON.parse(
      (await launch(development, launchRequest)).body,
    ) as { record: unknown };
    expect(record).toBeDefined();

    const production = await serverOn("production");
    expect(await recordsOf(production, "open-dough")).toEqual([record]);

    await Promise.all(servers.splice(0).map((server) => server.close()));
    const restarted = await serverOn("development");
    expect(await recordsOf(restarted, "open-dough")).toEqual([record]);
  });

  test("concurrent done marks from separate dashboard processes all survive and suppress later review attention", async () => {
    const sessionIds = Array.from(
      Array<unknown>(24).keys(),
      (index) =>
        `${String(index).padStart(8, "0")}-0000-4000-8000-000000000001`,
    );
    keepLaunchStore(machineHome(machine), {
      "open-dough": sessionIds.map((sessionId) =>
        execution(sessionId).launchedAt(daysAgo(1)).please(),
      ),
    });
    const development = await serverOn("development");
    const production = await serverOn("production");
    const replies = await Promise.all(
      sessionIds.map((session, index) =>
        markDone(index % 2 === 0 ? development : production, {
          source: "open-dough",
          session,
        }),
      ),
    );
    expect(replies.map((reply) => reply.status)).toEqual(
      sessionIds.map(() => 200),
    );
    const expected = replies.map((reply) => {
      const record = launchWithStateSchema.parse(
        (JSON.parse(reply.body) as { record: unknown }).record,
      );
      return { session: record.session.sessionId, doneAt: record.doneAt };
    });
    expect(
      keptLaunchRecords(machineHome(machine)).map((record) => {
        if (!("session" in record)) throw new Error("Expected a kept session");
        return { session: record.session.sessionId, doneAt: record.doneAt };
      }),
    ).toEqual(expected);

    // Native completion can arrive after closure; it must not revive attention.
    const openDough = path.join(development.home, "git", "open-dough");
    writeFileSync(
      path.join(machine, "claude-state", "agents.json"),
      JSON.stringify(sessionIds.map((id) => doneExitedListing(id, openDough))),
    );
    for (const server of [development, production]) {
      const records = (await recordsOf(server, "open-dough")).map((record) =>
        launchWithStateSchema.parse(record),
      );
      expect(records.map((record) => record.sessionState)).toEqual(
        sessionIds.map(() => ({
          kind: "available",
          availability: "retained",
          activity: "review",
        })),
      );
      expect(attentionCount(records)).toBe(0);
      expect(records.map(alertReading)).toEqual(
        sessionIds.map(() => undefined),
      );
    }
  });

  test("keeps an unclosed record however old, and a done one until 30 days after marking, dropping it on the next write", async () => {
    const unclosed = execution("40000000-0000-4000-8000-000000000040")
      .launchedAt(daysAgo(40))
      .please();
    const recentlyDone = execution("60000000-0000-4000-8000-000000000029")
      .launchedAt(daysAgo(60))
      .markedDoneAt(daysAgo(29))
      .please();
    const longDone = execution("60000000-0000-4000-8000-000000000031")
      .launchedAt(daysAgo(60))
      .markedDoneAt(daysAgo(31))
      .please();
    keepLaunchStore(machineHome(machine), {
      "open-dough": [longDone, unclosed, recentlyDone],
    });
    const server = await serverOn("production");

    // The fake `claude` never launched them, so it no longer lists them.
    expect(await recordsOf(server, "open-dough")).toEqual([
      { ...unclosed, sessionState: { kind: "unavailable" } },
      { ...recentlyDone, sessionState: { kind: "unavailable" } },
    ]);
    expect(keptLaunchRecords(machineHome(machine))).toHaveLength(3);

    server.claudeScenario("launched");
    const { record } = JSON.parse(
      (await launch(server, distinctStoryRequest("retention-write"))).body,
    ) as {
      record: { session: { sessionId: string } };
    };
    expect(keptLaunchRecords(machineHome(machine))).toEqual([
      unclosed,
      recentlyDone,
      expect.objectContaining({
        session: expect.objectContaining({
          sessionId: record.session.sessionId,
        }),
      }),
    ]);
  });

  test("answers no records from an unreadable store and leaves it until the next launch moves it aside, keeping every earlier copy", async () => {
    const unreadable = "{ not launch records";
    keepLaunchStoreText(machineHome(machine), unreadable);
    const server = await serverOn("production");

    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(readFileSync(launchStoreFile(machineHome(machine)), "utf8")).toBe(
      unreadable,
    );

    // Story starts refuse an unreadable store; an ad hoc launch still writes
    // and moves the unreadable copy aside.
    server.claudeScenario("launched");
    const adHoc = makeMe.aLaunchRequest.adHoc().please();
    const { record } = JSON.parse((await launch(server, adHoc)).body) as {
      record: unknown;
    };
    expect(await recordsOf(server, "open-dough")).toEqual([record]);
    expect(
      readFileSync(
        `${launchStoreFile(machineHome(machine))}.unreadable`,
        "utf8",
      ),
    ).toBe(unreadable);
    const unreadableAgain = "[ still not launch records";
    keepLaunchStoreText(machineHome(machine), unreadableAgain);
    const second = JSON.parse((await launch(server, adHoc)).body) as {
      record: unknown;
    };
    expect(await recordsOf(server, "open-dough")).toEqual([second.record]);
    const dir = path.dirname(launchStoreFile(machineHome(machine)));
    const copyPrefix = `${path.basename(launchStoreFile(machineHome(machine)))}.unreadable`;
    const copies = readdirSync(dir)
      .filter((name) => name.startsWith(copyPrefix))
      .map((name) => readFileSync(path.join(dir, name), "utf8"));
    expect(copies.sort()).toEqual([unreadable, unreadableAgain].sort());
  });
});
