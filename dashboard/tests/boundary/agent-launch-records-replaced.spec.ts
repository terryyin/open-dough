// What a dashboard server answers, over raw HTTP, once the launch record store
// it already read (../../server/launchRecordDocument.ts) is replaced: its next
// read answers what another server of this machine wrote since, and an
// unreadable replacement -- even one of the same size and time -- answers no
// records and is left in place. Each test owns a fresh machine directory
// holding HOME and the synthetic `claude`'s (../fixtures/fake-claude) state;
// the store is settled first, so the server holds what it parsed. How long and
// where records are kept is ./agent-launch-records.spec.ts.

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import {
  replaceFileKeepingTimes,
  settleFile,
} from "../support/machineFileIdentity.ts";
import { launch, recordsOf } from "../agentLaunchBoundary.ts";
import { distinctStoryRequest } from "../openStorySessionSetup.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../support/dashboardServer.ts";
import {
  recordLaunchedDaysAgo,
  seedStore,
  storeFile,
} from "../machineLaunchRecords.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";

test.describe("launch records after the store a server read is replaced", () => {
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
      launchTimeoutMs: 4_000,
    });
    servers.push(server);
    return server;
  }

  // Seeds the store with `text`, settled so a server holds what it parses.
  function seedSettled(text: string): void {
    seedStore(machine, text);
    settleFile(storeFile(machine));
  }

  test.beforeEach(() => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-machine-"));
  });

  test.afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    rmSync(machine, { recursive: true, force: true });
  });

  test("answers a launch another server recorded after this server already read the store", async () => {
    const kept = recordLaunchedDaysAgo(
      1,
      "10000000-0000-4000-8000-000000000001",
    );
    seedSettled(JSON.stringify({ "open-dough": [kept] }));
    const reader = await serverOn("production");
    expect(await recordsOf(reader, "open-dough")).toHaveLength(1);
    expect(await recordsOf(reader, "open-dough")).toHaveLength(1);

    const writer = await serverOn("development");
    writer.claudeScenario("launched");
    const { record } = JSON.parse(
      (await launch(writer, distinctStoryRequest("cross-read"))).body,
    ) as { record: { session: { sessionId: string } } };
    expect(
      (
        (await recordsOf(reader, "open-dough")) as {
          session: { sessionId: string };
        }[]
      ).map((entry) => entry.session.sessionId),
    ).toEqual([
      "10000000-0000-4000-8000-000000000001",
      record.session.sessionId,
    ]);
  });

  test("answers no records once a store already read is replaced by an unreadable file of the same size and time, and leaves it in place", async () => {
    const good = JSON.stringify({
      "open-dough": [
        recordLaunchedDaysAgo(1, "20000000-0000-4000-8000-000000000002"),
      ],
    });
    seedSettled(good);
    const server = await serverOn("production");
    expect(await recordsOf(server, "open-dough")).toHaveLength(1);

    const unreadable = `x${good.slice(1)}`;
    replaceFileKeepingTimes(storeFile(machine), unreadable);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(readFileSync(storeFile(machine), "utf8")).toBe(unreadable);
    expect(
      readdirSync(path.dirname(storeFile(machine))).filter((name) =>
        name.includes(".unreadable"),
      ),
    ).toEqual([]);
  });
});
