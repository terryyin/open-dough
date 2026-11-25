// The installed catalog checkout and launch record survive concurrent
// Dashboard starts and a restart on the same machine.
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import {
  launch,
  machineFolder,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  startDashboardServer,
  type DashboardServer,
} from "../../test-support/support/dashboardServer.ts";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { git } from "../../test-support/support/startOriginObservation.ts";

const source = "doughnut";
const repository = "nerds-odd-e/doughnut";
let machine: string;
const dashboards: DashboardServer[] = [];

test.beforeEach(() => {
  machine = mkdtempSync(path.join(tmpdir(), "dough-catalog-machine-"));
});

async function closeDashboards() {
  const closes = await Promise.allSettled(
    dashboards.splice(0).map((server) => server.close()),
  );
  for (const close of closes) {
    if (close.status === "rejected") throw close.reason;
  }
}

test.afterEach(async () => {
  try {
    await closeDashboards();
  } finally {
    rmSync(machine, { recursive: true, force: true });
  }
});

async function startAndReadCatalog(environment: ProjectEnvironment) {
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    environment,
    projectFolders: [source],
    installedCatalog: "claude",
  });
  dashboards.push(server);
  const home = machineFolder(server);
  const checkout = path.join(home, "git", source);
  const origin = await git(checkout, "remote", "get-url", "origin");
  const head = await git(checkout, "rev-parse", "HEAD");
  expect(head).toBe(await git(origin, "rev-parse", "main"));
  expect(await git(origin, "rev-parse", "--is-bare-repository")).toBe("true");
  expect(await git(checkout, "config", "--get", "remote.origin.url")).toBe(
    `https://github.com/${repository}.git`,
  );
  const response = await rawRequest({
    url: `${server.origin}${projectListEndpoint}`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  expect(JSON.parse(response.body)).toContainEqual(
    expect.objectContaining({ id: source, repository }),
  );
  return { server, home, checkout, origin, head };
}

type Catalog = Awaited<ReturnType<typeof startAndReadCatalog>>;

async function startBothCatalogs() {
  const [development, production] = await Promise.allSettled([
    startAndReadCatalog("development"),
    startAndReadCatalog("production"),
  ]);
  if (development.status === "rejected") throw development.reason;
  if (production.status === "rejected") throw production.reason;
  return [development.value, production.value] as const;
}

test("answers a launch from another server on this machine, and again after both restart", async () => {
  let launchCatalog: Catalog;
  let readingCatalog: Catalog;
  let response: Awaited<ReturnType<typeof launch>>;
  let answer: { kind: string; record?: unknown };

  await test.step("Given development and production start together on one machine", async () => {
    [launchCatalog, readingCatalog] = await startBothCatalogs();
  });

  await test.step("Then both serve the same installed checkout", () => {
    const { checkout, origin, head } = launchCatalog;
    expect(readingCatalog).toMatchObject({ checkout, origin, head });
  });

  await test.step("And the machine keeps one bare origin for it", () => {
    const origins = path.join(
      path.dirname(launchCatalog.home),
      "catalog-origins",
    );
    expect(readdirSync(origins)).toEqual([`${source}.git`]);
    expect(launchCatalog.origin).toBe(path.join(origins, `${source}.git`));
  });

  await test.step("When development starts an ad hoc session from that checkout", async () => {
    launchCatalog.server.claudeScenario("launched");
    const request = makeMe.aLaunchRequest.adHoc({ source }).please();
    response = await launch(launchCatalog.server, request);
  });

  await test.step("Then the launched session has a record", () => {
    expect(response.status).toBe(200);
    answer = JSON.parse(response.body) as typeof answer;
    expect(answer).toMatchObject({
      kind: "launched",
      record: expect.any(Object),
    });
  });

  await test.step("And Claude runs in the installed checkout", () => {
    const { server, checkout } = launchCatalog;
    expect(server.claudeLaunches()).toMatchObject([{ cwd: checkout }]);
  });

  await test.step("And production reads the record the launch kept", async () => {
    expect(await recordsOf(readingCatalog.server, source)).toEqual([
      answer.record,
    ]);
  });

  await test.step("When both servers close and development starts again", async () => {
    await closeDashboards();
    readingCatalog = await startAndReadCatalog("development");
  });

  await test.step("Then the restarted server reads the same record", async () => {
    expect(await recordsOf(readingCatalog.server, source)).toEqual([
      answer.record,
    ]);
  });
});
