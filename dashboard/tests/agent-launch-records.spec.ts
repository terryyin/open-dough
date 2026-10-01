// How long and where the local launch boundary (../server/agentLaunchPlugin.ts)
// keeps a project's launch records, over raw HTTP: this machine keeps them
// outside every repository until 30 days after its session is marked done,
// however old an unclosed one is, across server restarts and shared
// between its dev and preview servers, and an unreadable store answers none
// and is moved aside by the next launch rather than lost, even when an earlier
// unreadable copy is already beside it. Each test owns a fresh machine
// directory holding HOME and the synthetic `claude`'s (./fixtures/fake-claude)
// state; the real one is never reached. What one launch answers and keeps is
// ./agent-launch-boundary.spec.ts.

import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  launch,
  launchRequest,
  markDone,
  recordsOf,
  title,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import {
  recordLaunchedDaysAgo,
  seedStore,
  storedRecords,
  storeFile,
} from "./machineLaunchRecords.ts";
import { launchWithStateSchema } from "../src/agentLaunch.ts";
import { alertReading, attentionCount } from "../src/sessionShown.ts";

const launchWaitMs = 4_000;

// A machine directory this test owns, holding HOME and the fake `claude`'s
// state across the servers it starts.
function newMachine(): string {
  return mkdtempSync(path.join(tmpdir(), "dough-machine-"));
}

test.describe("launch records kept on this machine", () => {
  let machine: string;
  const servers: DashboardServer[] = [];

  async function serverOn(mode: "dev" | "preview"): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode,
      prebuilt: mode === "preview" ? builtDashboardDir : undefined,
      machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: launchWaitMs,
    });
    servers.push(server);
    return server;
  }

  test.beforeEach(() => {
    machine = newMachine();
  });

  test.afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    rmSync(machine, { recursive: true, force: true });
  });

  test("answers a launch from another server on this machine, and again after both restart", async () => {
    const dev = await serverOn("dev");
    dev.claudeScenario("launched");
    const { record } = JSON.parse((await launch(dev, launchRequest)).body) as {
      record: unknown;
    };
    expect(record).toBeDefined();

    const preview = await serverOn("preview");
    expect(await recordsOf(preview, "open-dough")).toEqual([record]);

    await Promise.all(servers.splice(0).map((server) => server.close()));
    const restarted = await serverOn("dev");
    expect(await recordsOf(restarted, "open-dough")).toEqual([record]);
  });

  test("concurrent done marks from separate dashboard processes all survive and suppress later review attention", async () => {
    const sessionIds = Array.from(
      Array<unknown>(24).keys(),
      (index) =>
        `${String(index).padStart(8, "0")}-0000-4000-8000-000000000001`,
    );
    seedStore(
      machine,
      JSON.stringify({
        "open-dough": sessionIds.map((id) => recordLaunchedDaysAgo(1, id)),
      }),
    );
    const dev = await serverOn("dev");
    const preview = await serverOn("preview");
    const replies = await Promise.all(
      sessionIds.map((session, index) =>
        markDone(index % 2 === 0 ? dev : preview, {
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
      storedRecords(machine).map((entry) => {
        const record = entry as {
          session: { sessionId: string };
          doneAt?: string;
        };
        return { session: record.session.sessionId, doneAt: record.doneAt };
      }),
    ).toEqual(expected);

    // Native completion can arrive after closure; it must not revive attention.
    writeFileSync(
      path.join(machine, "claude-state", "agents.json"),
      JSON.stringify(
        sessionIds.map((sessionId) => ({
          id: sessionId.slice(0, 8),
          sessionId,
          cwd: path.join(dev.home, "git", "open-dough"),
          kind: "bg",
          startedAt: Date.now(),
          name: title,
          state: "done",
        })),
      ),
    );
    for (const server of [dev, preview]) {
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
    const unclosed = recordLaunchedDaysAgo(
      40,
      "40000000-0000-4000-8000-000000000040",
    );
    const recentlyDone = recordLaunchedDaysAgo(
      60,
      "60000000-0000-4000-8000-000000000029",
      29,
    );
    const longDone = recordLaunchedDaysAgo(
      60,
      "60000000-0000-4000-8000-000000000031",
      31,
    );
    seedStore(
      machine,
      JSON.stringify({ "open-dough": [longDone, unclosed, recentlyDone] }),
    );
    const server = await serverOn("preview");

    // The fake `claude` never launched them, so it no longer lists them.
    expect(await recordsOf(server, "open-dough")).toEqual([
      { ...unclosed, sessionState: { kind: "unavailable" } },
      { ...recentlyDone, sessionState: { kind: "unavailable" } },
    ]);
    expect(storedRecords(machine)).toHaveLength(3);

    server.claudeScenario("launched");
    const { record } = JSON.parse(
      (await launch(server, launchRequest)).body,
    ) as {
      record: { session: { sessionId: string } };
    };
    expect(storedRecords(machine)).toEqual([
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
    seedStore(machine, unreadable);
    const server = await serverOn("preview");

    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(readFileSync(storeFile(machine), "utf8")).toBe(unreadable);

    server.claudeScenario("launched");
    const { record } = JSON.parse(
      (await launch(server, launchRequest)).body,
    ) as { record: unknown };
    expect(await recordsOf(server, "open-dough")).toEqual([record]);
    expect(readFileSync(`${storeFile(machine)}.unreadable`, "utf8")).toBe(
      unreadable,
    );
    const unreadableAgain = "[ still not launch records";
    seedStore(machine, unreadableAgain);
    const second = JSON.parse((await launch(server, launchRequest)).body) as {
      record: unknown;
    };
    expect(await recordsOf(server, "open-dough")).toEqual([second.record]);
    const dir = path.dirname(storeFile(machine));
    const copyPrefix = `${path.basename(storeFile(machine))}.unreadable`;
    const copies = readdirSync(dir)
      .filter((name) => name.startsWith(copyPrefix))
      .map((name) => readFileSync(path.join(dir, name), "utf8"));
    expect(copies.sort()).toEqual([unreadable, unreadableAgain].sort());
  });
});
