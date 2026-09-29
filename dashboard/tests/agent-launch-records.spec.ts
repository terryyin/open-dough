// How long and where the local launch boundary (../server/agentLaunchPlugin.ts)
// keeps a project's launch records, over raw HTTP: this machine keeps them
// outside every repository for 30 days, across server restarts and shared
// between its dev and preview servers, and an unreadable store answers none
// and is moved aside by the next launch rather than lost. Each test owns a
// fresh machine directory holding HOME and the synthetic `claude`'s
// (./fixtures/fake-claude) state; the real one is never reached. What one
// launch answers and keeps is ./agent-launch-boundary.spec.ts.

import {
  mkdirSync,
  mkdtempSync,
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
  recordsOf,
  title,
} from "./agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";

const launchWaitMs = 4_000;

// A machine directory this test owns, holding HOME and the fake `claude`'s
// state across the servers it starts.
function newMachine(): string {
  return mkdtempSync(path.join(tmpdir(), "dough-machine-"));
}

function storeFile(machine: string): string {
  return path.join(
    machine,
    "home",
    ".open-dough",
    "dashboard",
    "agent-launches.json",
  );
}

function seedStore(machine: string, text: string): void {
  mkdirSync(path.dirname(storeFile(machine)), { recursive: true });
  writeFileSync(storeFile(machine), text);
}

function recordLaunchedDaysAgo(days: number, sessionId: string): object {
  return {
    request: launchRequest,
    session: {
      host: "claude",
      sessionId,
      shortId: sessionId.slice(0, 8),
      name: `Open Dough · Execution · ${title}`,
    },
    launchedAt: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
  };
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

  test("does not answer a record launched more than 30 days ago", async () => {
    const recent = recordLaunchedDaysAgo(
      29,
      "29000000-0000-4000-8000-000000000029",
    );
    seedStore(
      machine,
      JSON.stringify({
        "open-dough": [
          recordLaunchedDaysAgo(31, "31000000-0000-4000-8000-000000000031"),
          recent,
        ],
      }),
    );
    const server = await serverOn("preview");

    // The fake `claude` never launched it, so it no longer lists it.
    expect(await recordsOf(server, "open-dough")).toEqual([
      { ...recent, sessionState: { kind: "unlisted" } },
    ]);
  });

  test("answers no records from an unreadable store and leaves it until the next launch moves it aside", async () => {
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
  });
});
