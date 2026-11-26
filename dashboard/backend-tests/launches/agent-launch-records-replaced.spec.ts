// What a dashboard server answers, over raw HTTP, once the launch record store
// it already read (../../server/launchRecordDocument.ts) is replaced: an
// unreadable replacement -- even one of the same size and time -- answers no
// records and is left in place. Each test owns a fresh machine directory
// holding HOME and the synthetic `claude`'s (../../test-support/fixtures/fake-claude) state;
// the store is settled first, so the server holds what it parsed. How long and
// where records are kept is ./agent-launch-records.spec.ts.

import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import {
  keepLaunchStoreText,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../test-support/support/pageTest.ts";
import {
  replaceFileKeepingTimes,
  settleFile,
} from "../../test-support/support/machineFileIdentity.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  identity,
  recordsOf,
  title,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import {
  daysAgo,
  machineHome,
} from "../../test-support/machineLaunchRecords.ts";

test.describe("launch records after the store a server read is replaced", () => {
  let machine: string;
  const servers: DashboardServer[] = [];

  async function productionServer(): Promise<DashboardServer> {
    const server = await startDashboardServer({
      mode: "boundary",
      environment: "production",
      machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: 4_000,
    });
    servers.push(server);
    return server;
  }

  // Seeds the store with `text`, settled so a server holds what it parses.
  function seedSettled(text: string): void {
    keepLaunchStoreText(machineHome(machine), text);
    settleFile(launchStoreFile(machineHome(machine)));
  }

  test.beforeEach(() => {
    machine = mkdtempSync(path.join(tmpdir(), "dough-machine-"));
  });

  test.afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => server.close()));
    rmSync(machine, { recursive: true, force: true });
  });

  test("answers no records once a store already read is replaced by an unreadable file of the same size and time, and leaves it in place", async () => {
    const good = JSON.stringify({
      "open-dough": [
        makeMe.aLaunchRecord
          .executing({ identity, title })
          .inClaudeSession({
            sessionId: "20000000-0000-4000-8000-000000000002",
          })
          .launchedAt(daysAgo(1))
          .please(),
      ],
    });
    seedSettled(good);
    const server = await productionServer();
    expect(await recordsOf(server, "open-dough")).toHaveLength(1);

    const unreadable = `x${good.slice(1)}`;
    replaceFileKeepingTimes(launchStoreFile(machineHome(machine)), unreadable);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
    expect(readFileSync(launchStoreFile(machineHome(machine)), "utf8")).toBe(
      unreadable,
    );
    expect(
      readdirSync(path.dirname(launchStoreFile(machineHome(machine)))).filter(
        (name) => name.includes(".unreadable"),
      ),
    ).toEqual([]);
  });
});
