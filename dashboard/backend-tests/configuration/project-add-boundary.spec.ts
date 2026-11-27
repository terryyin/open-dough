// Which Add requests the project configuration boundary
// (../../server/projectConfigurationBoundary.ts) admits, in-process over raw
// HTTP with a synthetic `gh` answering from the fake GitHub and Git routed
// through the private HOME: only same-origin POST, answered with published
// facts and no checkout path; a pending Git transport ends on disconnect,
// deadline, shutdown or an unfinished body without writing configuration.
import http from "node:http";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { installProjectConfigurationMiddleware } from "../../server/projectConfigurationBoundary.ts";
import { projectConfigurationFile } from "../../server/projectConfiguration.ts";
import { projectAddEndpoint } from "../../src/projectConfiguration.ts";
import {
  privateSettingsMachine,
  type PrivateSettingsMachine,
} from "../support/privateSettingsMachine.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../test-support/support/fakeGh.ts";
import {
  everyRepository,
  publishes,
  startFakeGitHub,
  type FakeGitHub,
} from "../../test-support/support/fakeGitHub.ts";
import {
  routeDashboardHome,
  routeOriginThroughHome,
} from "../../test-support/support/fixtureOriginRoute.ts";
import { git } from "../../test-support/support/launchLanding.ts";
import {
  projectAddMachine,
  addedRepository,
  addedLocalPath,
} from "../../test-support/support/projectAddMachine.ts";
import {
  startInProcessBoundaryHttp,
  type InProcessBoundaryHttp,
} from "../../test-support/support/inProcessBoundaryHttp.ts";
import {
  rawRequest,
  abandonedRequest,
} from "../../test-support/support/rawHttp.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

let fixture: ReturnType<typeof projectAddMachine>;
let machine: PrivateSettingsMachine;
let github: FakeGitHub;
let home: string;
let cleanups: (() => void | Promise<void>)[];
beforeEach(async () => {
  cleanups = [];
  machine = privateSettingsMachine();
  cleanups.push(machine.close);
  fixture = projectAddMachine();
  cleanups.push(() => fixture.close());
  github = await startFakeGitHub();
  cleanups.push(() => github.close());
  github.serve(everyRepository, publishes({}));
  home = path.join(fixture.machine, "home");
  routeDashboardHome(home, github);
});
afterEach(async () => {
  for (const cleanup of cleanups.reverse()) await cleanup();
});

// The production boundary in this worker, its `gh` answering from the fake
// GitHub and Git reads taking at most `readTimeoutMs`.
async function startAdd(readTimeoutMs = 30_000) {
  await fixture.serveOn(github);
  const gh = installFakeGh(fixture.machine);
  cleanups.push(() => endFakeGh(gh));
  cleanups.push(
    withRestoredEnv({
      ...fakeGhEnv(gh, github.url),
      HOME: home,
      DOUGH_READ_TIMEOUT_MS: String(readTimeoutMs),
    }),
  );
  const server: InProcessBoundaryHttp = await startInProcessBoundaryHttp(
    {
      name: "dough-project-configuration",
      install: installProjectConfigurationMiddleware,
    },
    "production",
  );
  let boundaryOpen = true;
  const closeBoundary = async () => {
    if (!boundaryOpen) return;
    boundaryOpen = false;
    await server.closeBoundary();
  };
  cleanups.push(async () => {
    await closeBoundary();
    await server.closeHttp();
  });
  const configuration = projectConfigurationFile("production");
  return {
    url: `${server.origin}${projectAddEndpoint}`,
    origin: server.origin,
    configuration,
    before: readFileSync(configuration, "utf8"),
    closeBoundary,
  };
}

const body = JSON.stringify({
  githubUrl: `https://github.com/${addedRepository}`,
  localPath: addedLocalPath,
});

test("Add admits only same-origin POST and returns published facts without checkout paths", async () => {
  const server = await startAdd();
  const { url, configuration, before } = server;
  for (const headers of [
    {},
    { Origin: "http://other.example" },
    { Origin: server.origin, Host: "other.example" },
  ]) {
    const response = await rawRequest({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
    });
    expect(response.status).toBe(403);
  }
  expect(
    (await rawRequest({ url, headers: { Origin: server.origin } })).status,
  ).toBe(405);
  expect(github.calls).toEqual([]);
  expect(readFileSync(configuration, "utf8")).toBe(before);
  const response = await rawRequest({
    url,
    method: "POST",
    headers: { Origin: server.origin, "Content-Type": "application/json" },
    body,
  });
  expect(response.status).toBe(200);
  expect(response.headers["cache-control"]).toBe("no-store");
  const answer = JSON.parse(response.body) as {
    project: Record<string, unknown>;
    projects: Record<string, unknown>[];
  };
  expect(Object.keys(answer.project).sort()).toEqual([
    "backlogPath",
    "id",
    "label",
    "ref",
    "repository",
  ]);
  expect(answer.projects.at(-1)).toEqual(answer.project);
  expect(response.body).not.toContain(addedLocalPath);
  expect(machine.commandCalls()).toBe("");
});

test("Add reports a rejected advertised branch name at the GitHub URL field", async () => {
  const origin = path.join(fixture.machine, "rejected-branch.git");
  git(fixture.machine, "clone", "--bare", "--quiet", fixture.checkout, origin);
  git(origin, "update-ref", "refs/heads/HEAD", "refs/heads/local-checkout");
  git(origin, "symbolic-ref", "HEAD", "refs/heads/HEAD");
  routeOriginThroughHome(home, origin, addedRepository);
  const server = await startAdd();

  const response = await rawRequest({
    url: server.url,
    method: "POST",
    headers: { Origin: server.origin, "Content-Type": "application/json" },
    body,
  });
  expect(response.status).toBe(400);
  expect(JSON.parse(response.body)).toEqual({
    field: "githubUrl",
    error: `Git could not resolve a usable default branch for ${addedRepository}. Try again when the repository has a valid default branch.`,
  });
  expect(readFileSync(server.configuration, "utf8")).toBe(server.before);
});

describe("Add validation with a pending Git request", () => {
  let origin: http.Server | undefined;
  let requested: (string | undefined)[];
  let closed: number;

  beforeEach(async () => {
    requested = [];
    closed = 0;
    origin = http.createServer((req, res) => {
      requested.push(req.url);
      res.once("close", () => {
        closed += 1;
      });
    });
    await once(origin.listen(0, "127.0.0.1"), "listening");
    const { port } = origin.address() as AddressInfo;
    routeOriginThroughHome(
      home,
      `http://127.0.0.1:${String(port)}/sample-app.git`,
      addedRepository,
    );
  });

  afterEach(async () => {
    const pendingOrigin = origin;
    origin = undefined;
    if (pendingOrigin === undefined) return;
    pendingOrigin.closeAllConnections();
    await new Promise<void>((resolve) => {
      pendingOrigin.close(() => {
        resolve();
      });
    });
  });

  // Git reaches, and leaves, the pending origin in its own time under load.
  const waitLimit = { timeout: 5_000, interval: 50 };

  async function prepareAdd(readTimeoutMs?: number) {
    const server = await startAdd(readTimeoutMs);
    return {
      ...server,
      options: {
        url: server.url,
        method: "POST",
        headers: { Origin: server.origin, "Content-Type": "application/json" },
        body,
      },
    };
  }

  async function expectTransportReached() {
    await vi.waitFor(() => {
      expect(requested).toEqual([
        "/sample-app.git/info/refs?service=git-upload-pack",
      ]);
    }, waitLimit);
  }

  async function expectAddEnded(configuration: string, before: string) {
    await vi.waitFor(() => {
      expect(closed).toBe(1);
    }, waitLimit);
    expect(readFileSync(configuration, "utf8")).toBe(before);
  }

  test("disconnect ends the transport without writing configuration", async () => {
    const { configuration, before, options } = await prepareAdd();
    const request = abandonedRequest(options);
    await expectTransportReached();
    request.cutAfter(1);
    await expectAddEnded(configuration, before);
  });

  test("the deadline ends the transport without writing configuration", async () => {
    // Allow the request to reach the transport under CI load.
    const { configuration, before, options } = await prepareAdd(3_000);
    expect((await rawRequest(options)).status).toBe(503);
    await expectTransportReached();
    await expectAddEnded(configuration, before);
  });

  test("shutdown ends the transport without writing configuration", async () => {
    const { closeBoundary, configuration, before, options } =
      await prepareAdd();
    abandonedRequest(options);
    await expectTransportReached();
    await closeBoundary();
    await expectAddEnded(configuration, before);
  });
});

test("an unfinished Add request body ends at the boundary deadline without validation or writes", async () => {
  const server = await startAdd(100);
  let request: http.ClientRequest | undefined;
  const status = await new Promise<number>((resolve, reject) => {
    request = http.request(
      server.url,
      {
        method: "POST",
        headers: { Origin: server.origin, "Content-Type": "application/json" },
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve(response.statusCode ?? 0);
        });
      },
    );
    request.on("error", reject);
    request.write('{"githubUrl":');
  });
  request?.destroy();
  expect(status).toBe(503);
  expect(github.calls).toEqual([]);
  expect(readFileSync(server.configuration, "utf8")).toBe(server.before);
});
